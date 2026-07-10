import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, useMediaQuery, IconButton, AppBar, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import theme from './theme';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ExperimentsView from './components/ExperimentsView';
import ResultsView from './components/ResultsView';
import SettingsView from './components/SettingsView';
import NewExperimentDialog from './components/NewExperimentDialog';

// Mock Initial Experiments
const initialExperiments = [
  { id: '1', name: 'pod-kill-webapp', description: 'Kill Random Pods', type: 'Pod Kill', namespace: 'target-zone', target: 'web-app', status: 'Completed', lastRun: '2025-06-26 10:30:15' },
  { id: '2', name: 'network-latency', description: 'Inject Latency', type: 'Network Chaos', namespace: 'target-zone', target: 'payment-svc', status: 'Completed', lastRun: '2025-06-26 10:29:42' },
  { id: '3', name: 'cpu-stress-api', description: 'Stress CPU', type: 'CPU Stress', namespace: 'target-zone', target: 'api-service', status: 'Failed', lastRun: '2025-06-26 10:10:31' },
  { id: '4', name: 'memory-stress', description: 'Stress Memory', type: 'Memory Stress', namespace: 'target-zone', target: 'order-service', status: 'Completed', lastRun: '2025-06-26 09:45:12' },
  { id: '5', name: 'pod-delete', description: 'Delete Pods', type: 'Pod Delete', namespace: 'default', target: 'frontend', status: 'Completed', lastRun: '2025-06-26 09:20:05' },
  { id: '6', name: 'packet-loss-db', description: 'Inject Network Packet Loss', type: 'Network Chaos', namespace: 'target-zone', target: 'db-service', status: 'Idle', lastRun: 'Never' },
  { id: '7', name: 'disk-fill-logs', description: 'Fill up ephemeral storage', type: 'Memory Stress', namespace: 'kube-system', target: 'fluentd', status: 'Idle', lastRun: 'Never' },
  { id: '8', name: 'api-delay-gateway', description: 'Inject 500ms API gateway lag', type: 'Network Chaos', namespace: 'default', target: 'api-gateway', status: 'Idle', lastRun: 'Never' },
];

// Mock Initial Results
const initialResults = [
  { runId: 'r1', name: 'pod-kill-webapp', type: 'Pod Kill', status: 'Completed', namespace: 'target-zone', target: 'web-app', startedAt: '2025-06-26 10:30:15', duration: '2m 34s', impact: 'Low' },
  { runId: 'r2', name: 'network-latency', type: 'Network Chaos', status: 'Completed', namespace: 'target-zone', target: 'payment-svc', startedAt: '2025-06-26 10:29:42', duration: '5m 12s', impact: 'Medium' },
  { runId: 'r3', name: 'cpu-stress-api', type: 'CPU Stress', status: 'Failed', namespace: 'target-zone', target: 'api-service', startedAt: '2025-06-26 10:10:31', duration: '1m 08s', impact: 'High' },
  { runId: 'r4', name: 'memory-stress', type: 'Memory Stress', status: 'Completed', namespace: 'target-zone', target: 'order-service', startedAt: '2025-06-26 09:45:12', duration: '3m 45s', impact: 'Medium' },
  { runId: 'r5', name: 'pod-delete', type: 'Pod Delete', status: 'Completed', namespace: 'default', target: 'frontend', startedAt: '2025-06-26 09:20:05', duration: '1m 56s', impact: 'Low' },
  { runId: 'r6', name: 'network-latency', type: 'Network Chaos', status: 'Completed', namespace: 'target-zone', target: 'payment-svc', startedAt: '2025-06-25 15:20:10', duration: '5m 00s', impact: 'Low' },
  { runId: 'r7', name: 'pod-kill-webapp', type: 'Pod Kill', status: 'Failed', namespace: 'target-zone', target: 'web-app', startedAt: '2025-06-25 14:15:33', duration: '45s', impact: 'High' },
  { runId: 'r8', name: 'cpu-stress-api', type: 'CPU Stress', status: 'Completed', namespace: 'target-zone', target: 'api-service', startedAt: '2025-06-25 11:05:00', duration: '2m 10s', impact: 'Low' },
];

const API_BASE = 'http://34.47.250.118:8000/api';

export default function App() {
  const [selectedView, setSelectedView] = useState('dashboard');
  const [currentCluster, setCurrentCluster] = useState('production');
  const [clusterStatus, setClusterStatus] = useState('Healthy');
  
  // Experiments list
  const [experiments, setExperiments] = useState(() => {
    const list = [...initialExperiments];
    for (let i = 9; i <= 24; i++) {
      list.push({
        id: String(i),
        name: `filler-experiment-${i}`,
        description: `Simulated chaos exercise number ${i}`,
        type: i % 3 === 0 ? 'Pod Kill' : i % 3 === 1 ? 'Network Chaos' : 'CPU Stress',
        namespace: i % 2 === 0 ? 'target-zone' : 'default',
        target: i % 2 === 0 ? 'auth-db' : 'redis-cache',
        status: 'Idle',
        lastRun: 'Never',
      });
    }
    return list;
  });

  // Results list
  const [results, setResults] = useState(() => {
    return [
      { runId: 'r1', name: 'pod-kill-webapp', type: 'Pod Kill', status: 'Completed', namespace: 'target-zone', target: 'web-app', startedAt: '2025-06-26 10:30:15', duration: '2m 34s', impact: 'Low' },
      { runId: 'r2', name: 'network-latency', type: 'Network Chaos', status: 'Completed', namespace: 'target-zone', target: 'payment-svc', startedAt: '2025-06-26 10:29:42', duration: '5m 12s', impact: 'Medium' },
      { runId: 'r3', name: 'cpu-stress-api', type: 'CPU Stress', status: 'Failed', namespace: 'target-zone', target: 'api-service', startedAt: '2025-06-26 10:10:31', duration: '1m 08s', impact: 'High' },
    ];
  });

  const [selectedRun, setSelectedRun] = useState(null);
  const [newExpDialogOpen, setNewExpDialogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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

        if (settings.autoHeal) {
          setTimeout(() => setClusterStatus('Healthy'), 3000);
        } else if (!isSuccess) {
          setClusterStatus('Critical');
        }
      }, settings.simulationSpeed * 1000);
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

  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0d0e12', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
        
        {/* Sidebar Responsive Component */}
        <Sidebar
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          currentCluster={currentCluster}
          setCurrentCluster={setCurrentCluster}
          clusterStatus={clusterStatus}
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
        />

        {/* Main Content Pane */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            minWidth: 0, // Prevent grid breakout
          }}
        >
          {/* Mobile Top Bar (AppBar visible only on small viewports) */}
          {!isSmUp && (
            <AppBar position="sticky" sx={{ bgcolor: '#141721', backgroundImage: 'none', mb: 3, borderRadius: 2 }}>
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="subtitle1" noWrap component="div" sx={{ fontWeight: 700 }}>
                  Chaos Platform Dashboard
                </Typography>
              </Toolbar>
            </AppBar>
          )}

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
