import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';
import theme from './theme';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ExperimentsView from './components/ExperimentsView';
import ResultsView from './components/ResultsView';
import SettingsView from './components/SettingsView';
import NewExperimentDialog from './components/NewExperimentDialog';

// Mock Initial Experiments
const initialExperiments = [
  { id: '1', name: 'Pod Kill', description: 'Kill Random Pods', type: 'Pod Kill', namespace: 'target-zone', target: 'web-app', status: 'Completed', lastRun: '2025-06-26 10:30:15' },
  { id: '2', name: 'Network Latency', description: 'Inject Latency', type: 'Network Chaos', namespace: 'target-zone', target: 'payment-svc', status: 'Completed', lastRun: '2025-06-26 10:29:42' },
  { id: '3', name: 'CPU Stress', description: 'Stress CPU', type: 'CPU Stress', namespace: 'target-zone', target: 'api-service', status: 'Failed', lastRun: '2025-06-26 10:10:31' },
  { id: '4', name: 'Memory Stress', description: 'Stress Memory', type: 'Memory Stress', namespace: 'target-zone', target: 'order-service', status: 'Completed', lastRun: '2025-06-26 09:45:12' },
  { id: '5', name: 'Pod Delete', description: 'Delete Pods', type: 'Pod Delete', namespace: 'default', target: 'frontend', status: 'Completed', lastRun: '2025-06-26 09:20:05' },
  { id: '6', name: 'Packet Loss DB', description: 'Inject Network Packet Loss', type: 'Network Chaos', namespace: 'target-zone', target: 'db-service', status: 'Idle', lastRun: 'Never' },
  { id: '7', name: 'Disk Fill Logs', description: 'Fill up ephemeral storage', type: 'Memory Stress', namespace: 'kube-system', target: 'fluentd', status: 'Idle', lastRun: 'Never' },
  { id: '8', name: 'API Delay Gateway', description: 'Inject 500ms API gateway lag', type: 'Network Chaos', namespace: 'default', target: 'api-gateway', status: 'Idle', lastRun: 'Never' },
];

// Mock Initial Results (matching mockup exactly)
const initialResults = [
  { runId: 'r1', name: 'Pod Kill', type: 'Pod Kill', status: 'Completed', namespace: 'target-zone', target: 'web-app', startedAt: '2025-06-26 10:30:15', duration: '2m 34s', impact: 'Low' },
  { runId: 'r2', name: 'Network Latency', type: 'Network Chaos', status: 'Completed', namespace: 'target-zone', target: 'payment-svc', startedAt: '2025-06-26 10:29:42', duration: '5m 12s', impact: 'Medium' },
  { runId: 'r3', name: 'CPU Stress', type: 'CPU Stress', status: 'Failed', namespace: 'target-zone', target: 'api-service', startedAt: '2025-06-26 10:10:31', duration: '1m 08s', impact: 'High' },
];

const API_BASE = '/api';

export default function App() {
  const [selectedView, setSelectedView] = useState('dashboard');
  const [currentCluster, setCurrentCluster] = useState('production');
  const [clusterStatus, setClusterStatus] = useState('Healthy');
  
  // Experiments list
  const [experiments, setExperiments] = useState(() => [...initialExperiments]);

  // Results list
  const [results, setResults] = useState(() => [...initialResults]);

  const [selectedRun, setSelectedRun] = useState(null);
  const [newExpDialogOpen, setNewExpDialogOpen] = useState(false);

  // Simulation settings
  const [settings, setSettings] = useState({
    successRate: 0.8,
    simulationSpeed: 3, // in seconds
    autoHeal: true,
  });

  // Fetch data on mount and poll
  useEffect(() => {
    async function loadData() {
      try {
        const [expsRes, resultsRes, healthRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/experiments`),
          fetch(`${API_BASE}/results`),
          fetch(`${API_BASE}/cluster/health`),
          fetch(`${API_BASE}/settings`),
        ]);
        
        if (expsRes.ok) setExperiments(await expsRes.json());
        if (resultsRes.ok) setResults(await resultsRes.json());
        if (healthRes.ok) {
          const data = await healthRes.json();
          setClusterStatus(data.status);
        }
        if (settingsRes.ok) setSettings(await settingsRes.json());
      } catch (err) {
        console.warn("Backend API not reachable. Using simulated local state.", err);
      }
    }
    
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);



  const handleCreateExperiment = async (newExp) => {
    // Generate optimistic UI update
    const freshExp = {
      id: String(experiments.length + 1),
      name: newExp.name,
      description: newExp.description || `Custom chaos targeting ${newExp.target}`,
      type: newExp.type,
      namespace: newExp.namespace,
      target: newExp.target,
      status: 'Idle',
      lastRun: 'Never',
    };
    setExperiments([freshExp, ...experiments]);

    // Send API call
    try {
      const res = await fetch(`${API_BASE}/experiments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExp),
      });
      if (res.ok) {
        const created = await res.json();
        // Replace optimistic entry with actual
        setExperiments((prev) => prev.map((e) => e.name === created.name ? created : e));
      }
    } catch (err) {
      console.warn("Could not create experiment on backend:", err);
    }
  };

  const handleRunExperiment = async (expId) => {
    // Optimistic UI updates
    setExperiments((prev) =>
      prev.map((e) => (e.id === expId ? { ...e, status: 'Running' } : e))
    );

    try {
      const res = await fetch(`${API_BASE}/experiments/${expId}/run`, {
        method: 'POST',
      });
      if (res.ok) {
        const newRun = await res.json();
        setResults((prev) => [newRun, ...prev]);
      }
    } catch (err) {
      console.warn("Could not execute experiment on backend:", err);
      
      // Local Fallback simulation logic if backend is unreachable
      const expIndex = experiments.findIndex((e) => e.id === expId);
      if (expIndex === -1) return;
      const exp = experiments[expIndex];
      const runId = `r_${Date.now()}`;
      const pad = (n) => String(n).padStart(2, '0');
      const now = new Date();
      const startedAtStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const newRun = {
        runId,
        name: exp.name,
        type: exp.type,
        status: 'Running',
        namespace: exp.namespace,
        target: exp.target,
        startedAt: startedAtStr,
        duration: '--',
        impact: 'Pending',
      };
      setResults((prev) => [newRun, ...prev]);

      if (clusterStatus === 'Healthy' && (exp.type === 'CPU Stress' || exp.type === 'Memory Stress')) {
        setClusterStatus('Degraded');
      }

      setTimeout(() => {
        const isSuccess = Math.random() < settings.successRate;
        const finalStatus = isSuccess ? 'Completed' : 'Failed';
        const durationMin = Math.floor(Math.random() * 2);
        const durationSec = Math.floor(Math.random() * 50) + 10;
        const durationStr = `${durationMin > 0 ? durationMin + 'm ' : ''}${durationSec}s`;
        const impactOptions = isSuccess ? ['Low', 'Medium'] : ['Medium', 'High'];
        const finalImpact = impactOptions[Math.floor(Math.random() * impactOptions.length)];

        setExperiments((prevExps) => {
          const idx = prevExps.findIndex((e) => e.id === expId);
          if (idx === -1) return prevExps;
          const copy = [...prevExps];
          copy[idx] = { ...copy[idx], status: finalStatus, lastRun: startedAtStr };
          return copy;
        });

        setResults((prevResults) =>
          prevResults.map((r) =>
            r.runId === runId ? { ...r, status: finalStatus, duration: durationStr, impact: finalImpact } : r
          )
        );

        if (settings?.autoHeal) {
          setTimeout(() => setClusterStatus('Healthy'), 3000);
        } else if (!isSuccess) {
          setClusterStatus('Critical');
        }
      }, (settings?.simulationSpeed ?? 3) * 1000);
    }
  };

  const handleSetClusterStatus = async (status) => {
    setClusterStatus(status);
    try {
      await fetch(`${API_BASE}/cluster/health/${status}`, {
        method: 'POST',
      });
    } catch (err) {
      console.warn("Could not sync cluster status to backend:", err);
    }
  };

  const handleSaveSettings = async (newSettings) => {
    setSettings(newSettings);
    try {
      await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (err) {
      console.warn("Could not sync settings to backend:", err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0d0e12', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
        
        {/* Sidebar Component */}
        <Sidebar
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          currentCluster={currentCluster}
          setCurrentCluster={setCurrentCluster}
          clusterStatus={clusterStatus}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: 'calc(100vw - 240px) !important',
            p: { xs: 2, sm: 3, md: 4 },
            minWidth: 0, // Prevent grid breakout
          }}
        >
          {/* Dynamic View Selector */}
          {selectedView === 'dashboard' && (
            <DashboardView
              experiments={experiments}
              results={results}
              clusterStatus={clusterStatus}
              onRunExperiment={handleRunExperiment}
              setView={setSelectedView}
              setSelectedExperimentForLogs={setSelectedRun}
            />
          )}

          {selectedView === 'experiments' && (
            <ExperimentsView
              experiments={experiments}
              results={results}
              onRunExperiment={handleRunExperiment}
              onOpenNewExperimentDialog={() => setNewExpDialogOpen(true)}
              selectedExperimentForLogs={selectedRun}
              setSelectedExperimentForLogs={setSelectedRun}
              setView={setSelectedView}
            />
          )}

          {selectedView === 'results' && (
            <ResultsView
              results={results}
              selectedRun={selectedRun}
              setSelectedRun={setSelectedRun}
              setView={setSelectedView}
            />
          )}

          {selectedView === 'settings' && (
            <SettingsView
              currentCluster={currentCluster}
              clusterStatus={clusterStatus}
              setClusterStatus={handleSetClusterStatus}
              settings={settings}
              setSettings={handleSaveSettings}
            />
          )}
        </Box>
      </Box>

      {/* Dialog for Creating New Experiment */}
      <NewExperimentDialog
        open={newExpDialogOpen}
        onClose={() => setNewExpDialogOpen(false)}
        onCreateExperiment={handleCreateExperiment}
      />
    </ThemeProvider>
  );
}
