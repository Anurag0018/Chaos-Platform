import asyncio
import datetime
import os
import random
from typing import List, Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
try:
    from kubernetes import client, config  # type: ignore
    from kubernetes.client.exceptions import ApiException  # type: ignore
except ImportError:
    client = None
    config = None
    ApiException = None

app = FastAPI(title="Chaos Platform API")

# Helper dependency to enforce cookie-based auth
def verify_cookie_auth(request: Request):
    access_token = request.cookies.get("access_token")
    if not access_token:
        # Fallback to Authorization header if cookies are restricted in testing
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            access_token = auth_header.split(" ")[1]
            
    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Access token cookie is missing"
        )
    return access_token

# Initialize Kubernetes Client
# Try loading incluster config first (when running as a pod in k8s)
# Fallback to loading kubeconfig file locally
k8s_v1 = None
try:
    if os.getenv("KUBERNETES_SERVICE_HOST"):
        config.load_incluster_config()
        print("Loaded in-cluster Kubernetes config.")
    else:
        # Check root workspace path for kubeconfig
        kubeconfig_path = "kubeconfig"
        if not os.path.exists(kubeconfig_path) and os.path.exists("../kubeconfig"):
            kubeconfig_path = "../kubeconfig"
        config.load_kube_config(config_file=kubeconfig_path)
        print(f"Loaded local Kubernetes config from {kubeconfig_path}.")
    k8s_v1 = client.CoreV1Api()
except Exception as e:
    print(f"Warning: Failed to load Kubernetes configuration: {e}")
    print("Running in MOCK mode (Kubernetes client disabled).")

# Enable CORS for frontend requests
# Credentials require explicit origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class Experiment(BaseModel):
    id: str
    name: str
    description: str
    type: str
    namespace: str
    target: str
    status: str
    lastRun: str

class ExperimentCreate(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = ""
    type: str
    namespace: str
    target: str

class Result(BaseModel):
    runId: str
    name: str
    type: str
    status: str
    namespace: str
    target: str
    startedAt: str
    duration: str
    impact: str

class Settings(BaseModel):
    successRate: float
    simulationSpeed: int
    autoHeal: bool

# Helper to get formatted timestamps
def get_current_timestamp():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# In-Memory Database State
DB_SETTINGS = {
    "successRate": 0.8,
    "simulationSpeed": 3,
    "autoHeal": True
}

DB_CLUSTER = {
    "status": "Healthy"
}

# Initial Experiments
DB_EXPERIMENTS = []

# Initial Results matching the target mockup exactly (3 total runs)
DB_RESULTS = []

# Simulation Runner task
async def run_chaos_simulation(exp_id: str, run_id: str):
    # Load parameters
    speed = DB_SETTINGS["simulationSpeed"]
    rate = DB_SETTINGS["successRate"]
    auto_heal = DB_SETTINGS["autoHeal"]

    # Find experiment details
    exp_details = next((e for e in DB_EXPERIMENTS if e["id"] == exp_id), None)
    exp_type = exp_details["type"] if exp_details else "Pod Kill"
    namespace = exp_details["namespace"] if exp_details else "target-zone"
    target = exp_details["target"] if exp_details else ""

    # 1. Wait duration
    await asyncio.sleep(speed)

    # 2. Determine outcome and perform actual action if connected to k8s
    real_action_taken = False
    
    if k8s_v1 and exp_type in ["Pod Kill", "Pod Delete"] and target:
        try:
            # Fetch all pods in the target namespace
            pods = k8s_v1.list_namespaced_pod(namespace=namespace)
            matching_pods = []
            for pod in pods.items:
                app_label = pod.metadata.labels.get("app") if pod.metadata.labels else None
                if app_label == target or target in pod.metadata.name:
                    matching_pods.append(pod)
            
            if matching_pods:
                target_pod = random.choice(matching_pods)
                pod_name = target_pod.metadata.name
                
                # Delete pod immediately
                k8s_v1.delete_namespaced_pod(
                    name=pod_name,
                    namespace=namespace,
                    body=client.V1DeleteOptions(grace_period_seconds=0)
                )
                print(f"Chaos action: Successfully deleted pod {pod_name} in namespace {namespace}")
                real_action_taken = True
            else:
                print(f"Chaos action warning: No pods found matching target {target} in namespace {namespace}")
        except Exception as e:
            print(f"Chaos action error: Failed to execute real pod deletion: {e}")

    # Determine final outcome
    if real_action_taken:
        is_success = True
    else:
        is_success = random.random() < rate
        
    final_status = "Completed" if is_success else "Failed"
    
    duration_min = random.randint(0, 1)
    duration_sec = random.randint(10, 59)
    duration_str = f"{f'{duration_min}m ' if duration_min > 0 else ''}{duration_sec}s"
    
    impact_opts = ["Low", "Medium"] if is_success else ["Medium", "High"]
    final_impact = random.choice(impact_opts)

    # 3. Update DB
    # Update Experiment status and last run
    for exp in DB_EXPERIMENTS:
        if exp["id"] == exp_id:
            exp["status"] = final_status
            exp["lastRun"] = get_current_timestamp()
            break
            
    # Update Result entry
    for res in DB_RESULTS:
        if res["runId"] == run_id:
            res["status"] = final_status
            res["duration"] = duration_str
            res["impact"] = final_impact
            break

    # 4. Handle cluster health impact
    if not is_success and not auto_heal:
        DB_CLUSTER["status"] = "Critical"
    elif not is_success and auto_heal:
        # Temporarily degrade then self-heal
        DB_CLUSTER["status"] = "Degraded"
        await asyncio.sleep(3)
        DB_CLUSTER["status"] = "Healthy"
    elif is_success and auto_heal:
        # If a real pod was killed, let the cluster health be updated dynamically via API query,
        # but keep in-memory mock state healthy for mock fallback.
        DB_CLUSTER["status"] = "Healthy"

# API Endpoints
@app.get("/api/experiments", response_model=List[Experiment])
def get_experiments(token: str = Depends(verify_cookie_auth)):
    return DB_EXPERIMENTS

@app.post("/api/experiments", response_model=Experiment)
def create_experiment(item: ExperimentCreate, token: str = Depends(verify_cookie_auth)):
    exp_id = item.id if item.id else str(len(DB_EXPERIMENTS) + 1)
    new_exp = {
        "id": exp_id,
        "name": item.name,
        "description": item.description or f"Custom chaos targeting {item.target}",
        "type": item.type,
        "namespace": item.namespace,
        "target": item.target,
        "status": "Idle",
        "lastRun": "Never"
    }
    DB_EXPERIMENTS.insert(0, new_exp) # Add to top
    return new_exp

@app.post("/api/experiments/sync", response_model=List[Experiment])
def sync_experiments(items: List[Experiment], token: str = Depends(verify_cookie_auth)):
    global DB_EXPERIMENTS
    DB_EXPERIMENTS = [item.dict() for item in items]
    return DB_EXPERIMENTS

@app.post("/api/experiments/{id}/run", response_model=Result)
def run_experiment(id: str, background_tasks: BackgroundTasks, token: str = Depends(verify_cookie_auth)):
    # Find experiment
    exp = next((e for e in DB_EXPERIMENTS if e["id"] == id), None)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    # Set state to Running
    exp["status"] = "Running"
    
    # Create running Result
    run_id = f"r_{int(datetime.datetime.now().timestamp())}"
    new_run = {
        "runId": run_id,
        "name": exp["name"],
        "type": exp["type"],
        "status": "Running",
        "namespace": exp["namespace"],
        "target": exp["target"],
        "startedAt": get_current_timestamp(),
        "duration": "--",
        "impact": "Pending"
    }
    DB_RESULTS.insert(0, new_run) # Add to top

    # Temporarily degrade cluster health on stress runs
    if DB_CLUSTER["status"] == "Healthy" and exp["type"] in ["CPU Stress", "Memory Stress"]:
        DB_CLUSTER["status"] = "Degraded"

    # Queue background simulator task
    background_tasks.add_task(run_chaos_simulation, id, run_id)
    
    return new_run

@app.post("/api/experiments/{id}/stop", response_model=Experiment)
def stop_experiment(id: str, token: str = Depends(verify_cookie_auth)):
    exp = next((e for e in DB_EXPERIMENTS if e["id"] == id), None)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
        
    exp["status"] = "Idle"
    
    # Also update any running results for this experiment to Failed/Aborted
    for r in DB_RESULTS:
        if r["name"] == exp["name"] and r["status"] == "Running":
            r["status"] = "Failed"
            r["duration"] = "Aborted"
            r["impact"] = "None"
            
    DB_CLUSTER["status"] = "Healthy"
    return exp

@app.get("/api/results", response_model=List[Result])
def get_results(token: str = Depends(verify_cookie_auth)):
    return DB_RESULTS

@app.get("/api/cluster/health")
def get_cluster_health(token: str = Depends(verify_cookie_auth)):
    if not k8s_v1:
        return {"status": DB_CLUSTER["status"]}
    
    try:
        # Query target-zone namespace pods
        namespace = "target-zone"
        pods = k8s_v1.list_namespaced_pod(namespace=namespace)
        
        if not pods.items:
            # If namespace has no pods, consider it degraded (initializing)
            return {"status": "Degraded"}
            
        for pod in pods.items:
            # If any pod is not running
            if pod.status.phase != "Running":
                return {"status": "Degraded"}
                
            # If container statuses are present, check readiness
            if pod.status.container_statuses:
                for status in pod.status.container_statuses:
                    if not status.ready:
                        return {"status": "Degraded"}
                        
        return {"status": "Healthy"}
    except Exception as e:
        print(f"Kubernetes cluster health check error: {e}")
        # Fallback to mock DB status in case of API/auth failure
        return {"status": DB_CLUSTER["status"]}

@app.post("/api/cluster/health/{status}")
def override_cluster_health(status: str, token: str = Depends(verify_cookie_auth)):
    if status not in ["Healthy", "Degraded", "Critical"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    DB_CLUSTER["status"] = status
    return {"status": DB_CLUSTER["status"]}

@app.get("/api/kubernetes/namespaces", response_model=List[str])
def get_kubernetes_namespaces(token: str = Depends(verify_cookie_auth)):
    if not k8s_v1:
        # Fallback list of mock namespaces
        return ["target-zone", "default", "kube-system", "production-gate"]
    try:
        ns_list = k8s_v1.list_namespace()
        namespaces = [ns.metadata.name for ns in ns_list.items]
        return namespaces
    except Exception as e:
        print(f"Error listing namespaces: {e}")
        return ["target-zone", "default", "kube-system", "production-gate"]

@app.get("/api/kubernetes/targets", response_model=List[str])
def get_kubernetes_targets(namespace: str = "target-zone", token: str = Depends(verify_cookie_auth)):
    if not k8s_v1:
        # Fallback list of mock targets
        if namespace == "target-zone":
            return ["web-app", "payment-svc", "api-service", "order-service", "db-service"]
        elif namespace == "kube-system":
            return ["fluentd", "kube-dns", "kube-proxy"]
        else:
            return ["frontend", "api-gateway", "auth-db", "redis-cache"]
            
    try:
        # Query services and deployments in the namespace
        targets = set()
        
        # 1. Fetch deployments
        apps_v1 = client.AppsV1Api()
        depl_list = apps_v1.list_namespaced_deployment(namespace=namespace)
        for depl in depl_list.items:
            targets.add(depl.metadata.name)
            
        # 2. Fetch services
        svc_list = k8s_v1.list_namespaced_service(namespace=namespace)
        for svc in svc_list.items:
            targets.add(svc.metadata.name)
            
        # 3. Fetch pods (for app labels)
        pod_list = k8s_v1.list_namespaced_pod(namespace=namespace)
        for pod in pod_list.items:
            app_label = pod.metadata.labels.get("app") if pod.metadata.labels else None
            if app_label:
                targets.add(app_label)
                
        return sorted(list(targets))
    except Exception as e:
        print(f"Error listing targets for namespace {namespace}: {e}")
        return ["web-app", "payment-svc", "api-service", "order-service", "db-service"]

@app.get("/api/settings", response_model=Settings)
def get_settings(token: str = Depends(verify_cookie_auth)):
    return DB_SETTINGS

@app.post("/api/settings", response_model=Settings)
def update_settings(item: Settings, token: str = Depends(verify_cookie_auth)):
    DB_SETTINGS["successRate"] = item.successRate
    DB_SETTINGS["simulationSpeed"] = item.simulationSpeed
    DB_SETTINGS["autoHeal"] = item.autoHeal
    return DB_SETTINGS

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
