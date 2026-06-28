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

export default function App() {
  const [selectedView, setSelectedView] = useState('dashboard');
  const [currentCluster, setCurrentCluster] = useState('production');
  const [clusterStatus, setClusterStatus] = useState('Healthy');
  
  // Experiments list (expanded dynamically to simulate larger list size)
  const [experiments, setExperiments] = useState(() => {
    const list = [...initialExperiments];
    // Generate mock fillers up to 24
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

  // Results list (expanded dynamically to simulate 48 results)
  const [results, setResults] = useState(() => {
    const list = [...initialResults];
    const types = ['Pod Kill', 'Network Chaos', 'CPU Stress', 'Memory Stress', 'Pod Delete'];
    const impacts = ['Low', 'Medium', 'High'];
    const statuses = ['Completed', 'Completed', 'Completed', 'Failed']; // Bias towards completed

    // Generate mock fillers up to 48
    for (let i = 9; i <= 48; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(i / 3));
      date.setHours(date.getHours() - (i % 24));
      
      const pad = (n) => String(n).padStart(2, '0');
      const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

      list.push({
        runId: `r${i}`,
        name: i % 4 === 0 ? 'pod-kill-webapp' : i % 4 === 1 ? 'network-latency' : i % 4 === 2 ? 'cpu-stress-api' : 'memory-stress',
        type: types[i % types.length],
        status: statuses[i % statuses.length],
        namespace: i % 3 === 0 ? 'target-zone' : i % 3 === 1 ? 'default' : 'kube-system',
        target: i % 3 === 0 ? 'web-app' : i % 3 === 1 ? 'payment-svc' : 'order-service',
        startedAt: dateStr,
        duration: `${Math.floor(Math.random() * 5) + 1}m ${Math.floor(Math.random() * 50) + 10}s`,
        impact: impacts[i % impacts.length],
      });
    }
    return list;
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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCreateExperiment = (newExp) => {
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
  };

  const handleRunExperiment = (expId) => {
    // 1. Find the experiment
    const expIndex = experiments.findIndex((e) => e.id === expId);
    if (expIndex === -1) return;
    const exp = experiments[expIndex];

    // 2. Set experiment status to Running
    const updatedExperiments = [...experiments];
    updatedExperiments[expIndex] = { ...exp, status: 'Running' };
    setExperiments(updatedExperiments);

    // 3. Add a temporary Running Result at the top
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
    
    setResults([newRun, ...results]);

    // If cluster was healthy, running an experiment might degrade it slightly (visual flair!)
    if (clusterStatus === 'Healthy' && (exp.type === 'CPU Stress' || exp.type === 'Memory Stress')) {
      setTimeout(() => setClusterStatus('Degraded'), 1000);
    }

    // 4. Simulate delay
    setTimeout(() => {
      const isSuccess = Math.random() < settings.successRate;
      const finalStatus = isSuccess ? 'Completed' : 'Failed';
      const durationMin = Math.floor(Math.random() * 2);
      const durationSec = Math.floor(Math.random() * 50) + 10;
      const durationStr = `${durationMin > 0 ? durationMin + 'm ' : ''}${durationSec}s`;
      const impactOptions = isSuccess ? ['Low', 'Medium'] : ['Medium', 'High'];
      const finalImpact = impactOptions[Math.floor(Math.random() * impactOptions.length)];

      // Update experiment status
      setExperiments((prevExps) => {
        const idx = prevExps.findIndex((e) => e.id === expId);
        if (idx === -1) return prevExps;
        const copy = [...prevExps];
        copy[idx] = {
          ...copy[idx],
          status: finalStatus,
          lastRun: startedAtStr,
        };
        return copy;
      });

      // Update Results entry
      setResults((prevResults) => {
        return prevResults.map((r) => {
          if (r.runId === runId) {
            return {
              ...r,
              status: finalStatus,
              duration: durationStr,
              impact: finalImpact,
            };
          }
          return r;
        });
      });

      // If cluster health degraded and autoHeal is enabled, restore it
      if (settings.autoHeal) {
        setTimeout(() => {
          setClusterStatus('Healthy');
        }, 3000);
      } else if (!isSuccess) {
        // If failed and no auto-heal, degrade cluster further
        setClusterStatus('Critical');
      }

    }, settings.simulationSpeed * 1000);
  };

  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0d0e12' }}>
        
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
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            minWidth: 0, // Prevent grid breakout
          }}
        >
          {/* Mobile Top Bar (AppBar visible only on small viewports) */}
          {!isMdUp && (
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
              setClusterStatus={setClusterStatus}
              settings={settings}
              setSettings={setSettings}
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
