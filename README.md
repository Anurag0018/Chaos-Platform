# K8s Chaos Engineering Platform 🌀🔬

An automated resiliency testing and chaos injection control plane for cloud-native applications. This platform provides engineers with a unified, dark-themed dashboard to systematically break Kubernetes microservices and evaluate their self-healing/high-availability capabilities in real time.



---

## ✨ Features

- **🎯 Target Workspace Injection (`target-zone`):** Safely isolates targeted applications away from critical infrastructure.
- **💀 Pod Delete Vector (`pod-delete`):** Simulates sudden infrastructure or node termination instances.
- **🌐 Network Latency Testing (`pod-network-latency`):** Injects specific, localized packet delays to stress-test microservice timeouts and upstream resilience.
- **⚡ CPU & Memory Resource Stress (`pod-cpu-hog` / `pod-memory-hog`):** Artificially spikes container compute footprint to validate HPA (Horizontal Pod Autoscaling) behaviors.
- **📊 Live Auto-Recovery Reports:** Continuous background polling of Kubernetes Custom Resource Statuses (CRDs) paired with automated service health checks to yield instant resiliency verdicts.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Material UI (MUI), TypeScript
- **Backend Control Plane:** Python, FastAPI, Official Kubernetes SDK
- **Chaos Engine:** LitmusChaos (Operator and Custom Resource Definitions)
- **Environment:** Kubernetes (Minikube / Kind / Managed Cluster), Helm

---

## 📐 High-Level Architecture

1. **Dashboard Layer (React + MUI):** User triggers specific experiment profiles and monitors system telemetry.
2. **API Controller Layer (FastAPI):** Bridges frontend actions with the cluster, programmatically manipulating `ChaosEngine` Custom Objects via the K8s API.
3. **Chaos Execution Layer (Litmus Operator):** Detects custom resource changes, spins up experiment pods, executes runtime faults inside target nodes, and outputs structured status metrics.

---

## 🚀 Quick Start & Deployment

### 1. Set Up the Target Environment
```bash
# Create the targeted microservice zone
kubectl apply -f manifests/sample-app.yaml