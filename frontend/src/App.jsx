import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
  Box,
  CssBaseline,
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import theme from './theme';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ExperimentsView from './components/ExperimentsView';
import ResultsView from './components/ResultsView';
import SettingsView from './components/SettingsView';
import NewExperimentDialog from './components/NewExperimentDialog';
import {
  signInWithGitHub,
  signOut,
  getSession,
  onAuthStateChange,
  fetchExperiments,
  upsertExperiment,
  fetchResults,
  insertResult,
  fetchSettings,
  saveSettings,
  isSupabaseConfigured,
} from './db';

// Mock Initial Experiments (Disabled - Clean slate for Supabase)
const initialExperiments = [];

// Mock Initial Results (Disabled - Clean slate for Supabase)
const initialResults = [];


const API_BASE = '/api';

function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      await signInWithGitHub();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        bgcolor: '#06070a',
        backgroundImage: 'radial-gradient(rgba(123, 44, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        p: 3,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: 'rgba(12, 14, 21, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(123, 44, 255, 0.15)',
          borderRadius: 4,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 40px rgba(123, 44, 255, 0.1)',
          overflow: 'hidden',
          p: 1,
        }}
      >
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #7b2cff 0%, #06f0b4 100%)' }} />
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              sx={{
                bgcolor: 'rgba(123, 44, 255, 0.1)',
                p: 2,
                borderRadius: '50%',
                border: '1px solid rgba(123, 44, 255, 0.2)',
                display: 'flex',
                boxShadow: '0 0 20px rgba(123, 44, 255, 0.25)',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7b2cff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </Box>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 1, letterSpacing: '-0.02em' }}>
            Chaos Platform
          </Typography>
          <Typography variant="body2" sx={{ color: '#9ca3af', mb: 4, fontWeight: 500 }}>
            Secure Operator Authentication
          </Typography>
          
          {!isSupabaseConfigured && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(255, 140, 0, 0.08)', borderRadius: 2, border: '1px solid rgba(255, 140, 0, 0.15)', textAlign: 'left' }}>
              <Typography variant="caption" sx={{ color: '#ff8c00', fontWeight: 600, display: 'block', mb: 0.5 }}>
                ⚠️ LOCAL DEMO MODE ACTIVE
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                Supabase env variables are not set. Logging in will use a simulated mock session locally.
              </Typography>
            </Box>
          )}

          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled={loading}
            onClick={handleGitHubLogin}
            startIcon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            }
            sx={{
              py: 1.5,
              background: 'linear-gradient(135deg, #7b2cff 0%, #06f0b4 100%)',
              boxShadow: '0 4px 20px rgba(123, 44, 255, 0.35)',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #8b5cf6 0%, #3df3c4 100%)',
                boxShadow: '0 6px 24px rgba(123, 44, 255, 0.5), 0 0 15px rgba(6, 240, 180, 0.3)',
              },
            }}
          >
            {loading ? 'Authenticating...' : 'Sign in with GitHub'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('dashboard');
  const [currentCluster, setCurrentCluster] = useState('gke-production-1');
  const [clusterStatus, setClusterStatus] = useState('Healthy');
  
  // Experiments list
  const [experiments, setExperiments] = useState(() => [...initialExperiments]);

  // Results list
  const [results, setResults] = useState(() => [...initialResults]);

  const [selectedRun, setSelectedRun] = useState(null);
  const [newExpDialogOpen, setNewExpDialogOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selIdx, setSelIdx] = useState(0);

  // Simulation settings
  const [settings, setSettings] = useState({
    successRate: 0.8,
    simulationSpeed: 3, // in seconds
    autoHeal: true,
    voiceAlerts: true,
  });

  const announceSpeech = (text) => {
    if (settings.voiceAlerts && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const commands = [
    { text: 'Go to Dashboard', category: 'Navigation', action: () => { setSelectedView('dashboard'); } },
    { text: 'Go to Experiments List', category: 'Navigation', action: () => { setSelectedView('experiments'); } },
    { text: 'Go to Results Telemetry', category: 'Navigation', action: () => { setSelectedView('results'); } },
    { text: 'Go to Platform Settings', category: 'Navigation', action: () => { setSelectedView('settings'); } },
    { text: 'Trigger Pod Kill Disruption', category: 'Actions', action: () => { handleCreateExperiment({ name: 'CMD-Pod-Kill', description: 'Triggered from Command Palette', type: 'Pod Kill', namespace: 'target-zone', target: 'web-app' }); setSelectedView('experiments'); } },
    { text: 'Trigger Network Latency Injection', category: 'Actions', action: () => { handleCreateExperiment({ name: 'CMD-Latency-Delay', description: 'Triggered from Command Palette', type: 'Network Chaos', namespace: 'target-zone', target: 'payment-svc' }); setSelectedView('experiments'); } },
    { text: 'Simulate Cluster Status: Degraded', category: 'Settings', action: () => { handleSetClusterStatus('Degraded'); } },
    { text: 'Simulate Cluster Status: Healthy', category: 'Settings', action: () => { handleSetClusterStatus('Healthy'); } },
    { text: 'Simulate Cluster Status: Critical', category: 'Settings', action: () => { handleSetClusterStatus('Critical'); } },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auth state listener
  useEffect(() => {
    getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
        setSearchQuery('');
        setSelIdx(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePaletteKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelIdx((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelIdx((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selIdx]) {
        filteredCommands[selIdx].action();
        setPaletteOpen(false);
      }
    } else if (e.key === 'Escape') {
      setPaletteOpen(false);
    }
  };

  // Fetch data on mount and poll
  useEffect(() => {
    if (!session?.user?.id) return;

    async function loadData() {
      const userId = session.user.id;
      
      try {
        const [dbExps, dbResults, dbSettings] = await Promise.all([
          fetchExperiments(userId),
          fetchResults(userId),
          fetchSettings(userId),
        ]);

        if (dbExps) {
          const mappedExps = dbExps.map((e) => ({
            id: e.id,
            name: e.name,
            description: e.description,
            type: e.type,
            namespace: e.namespace,
            target: e.target,
            status: e.status,
            lastRun: e.last_run || e.lastRun || 'Never',
          }));
          setExperiments(mappedExps);
        } else {
          setExperiments([]);
        }

        if (dbResults) {
          const mappedResults = dbResults.map((r) => ({
            runId: r.run_id || r.runId,
            name: r.name,
            type: r.type,
            status: r.status,
            namespace: r.namespace,
            target: r.target,
            startedAt: r.started_at || r.startedAt,
            duration: r.duration,
            impact: r.impact,
          }));
          setResults(mappedResults);
        } else {
          setResults([]);
        }

        if (dbSettings) {
          setSettings((prev) => ({ ...prev, ...dbSettings }));
        } else {
          await saveSettings(settings, userId);
        }

        const token = session?.access_token || localStorage.getItem('access_token') || '';
        const authHeaders = {
          'Authorization': `Bearer ${token}`
        };

        // Merge API state if backend is running
        try {
          const [expsRes, resultsRes] = await Promise.all([
            fetch(`${API_BASE}/experiments`, { headers: authHeaders, credentials: 'include' }),
            fetch(`${API_BASE}/results`, { headers: authHeaders, credentials: 'include' }),
          ]);
          
          if (expsRes.ok) {
            const apiExps = await expsRes.json();
            for (const apiExp of apiExps) {
              const matched = dbExps?.find((e) => e.id === apiExp.id);
              if (matched && matched.status !== apiExp.status) {
                await upsertExperiment(apiExp, userId);
              }
            }
          }

          if (resultsRes.ok) {
            const apiResults = await resultsRes.json();
            for (const apiRes of apiResults) {
              const matched = dbResults?.find((r) => (r.run_id || r.runId) === apiRes.runId);
              if (!matched) {
                await insertResult(apiRes, userId);
              }
            }
          }
        } catch (e) {}

      } catch (err) {
        console.warn("Supabase database error. Falling back to local API/mock.", err);
        const token = session?.access_token || localStorage.getItem('access_token') || '';
        const authHeaders = {
          'Authorization': `Bearer ${token}`
        };
        try {
          const [expsRes, resultsRes, healthRes, settingsRes] = await Promise.all([
            fetch(`${API_BASE}/experiments`, { headers: authHeaders, credentials: 'include' }),
            fetch(`${API_BASE}/results`, { headers: authHeaders, credentials: 'include' }),
            fetch(`${API_BASE}/cluster/health`, { headers: authHeaders, credentials: 'include' }),
            fetch(`${API_BASE}/settings`, { headers: authHeaders, credentials: 'include' }),
          ]);
          
          if (expsRes.ok) setExperiments(await expsRes.json());
          if (resultsRes.ok) setResults(await resultsRes.json());
          if (healthRes.ok) {
            const data = await healthRes.json();
            setClusterStatus(data.status);
          }
          if (settingsRes.ok) setSettings(await settingsRes.json());
        } catch (backendErr) {
          console.warn("FastAPI backend also not reachable. Using simulated local state.", backendErr);
        }
      }

      // Sync cluster health status from backend API if active
      try {
        const token = session?.access_token || localStorage.getItem('access_token') || '';
        const authHeaders = {
          'Authorization': `Bearer ${token}`
        };
        const healthRes = await fetch(`${API_BASE}/cluster/health`, { headers: authHeaders, credentials: 'include' });
        if (healthRes.ok) {
          const data = await healthRes.json();
          setClusterStatus(data.status);
        }
      } catch (e) {}
    }
    
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [session]);

  const handleCreateExperiment = async (newExp) => {
    const userId = session?.user?.id;
    if (!userId) return;

    const freshExp = {
      id: String(Date.now()),
      name: newExp.name,
      description: newExp.description || `Custom chaos targeting ${newExp.target}`,
      type: newExp.type,
      namespace: newExp.namespace,
      target: newExp.target,
      status: 'Idle',
      lastRun: 'Never',
    };
    setExperiments([freshExp, ...experiments]);

    try {
      await upsertExperiment(freshExp, userId);
    } catch (err) {
      console.warn("Could not save to Supabase:", err);
    }

    try {
      const token = session?.access_token || localStorage.getItem('access_token') || '';
      await fetch(`${API_BASE}/experiments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newExp),
        credentials: 'include',
      });
    } catch (err) {
      console.warn("Could not create experiment on backend:", err);
    }
  };

  const handleRunExperiment = async (expId) => {
    const expObj = experiments.find((e) => e.id === expId);
    if (expObj) {
      announceSpeech(`Chaos simulation initiated. Executing ${expObj.type} scenario on target resource ${expObj.target}.`);
    }

    setExperiments((prev) =>
      prev.map((e) => (e.id === expId ? { ...e, status: 'Running' } : e))
    );

    const userId = session?.user?.id;
    if (userId && expObj) {
      try {
        await upsertExperiment({ ...expObj, status: 'Running' }, userId);
      } catch (e) {}
    }

    try {
      const token = session?.access_token || localStorage.getItem('access_token') || '';
      const res = await fetch(`${API_BASE}/experiments/${expId}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });
      if (res.ok) {
        const newRun = await res.json();
        setResults((prev) => [newRun, ...prev]);
        if (userId) {
          await insertResult(newRun, userId);
        }
      }
    } catch (err) {
      console.warn("Could not execute experiment on backend:", err);
      
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

      if (userId) {
        try {
          await insertResult(newRun, userId);
        } catch (e) {}
      }

      if (clusterStatus === 'Healthy' && (exp.type === 'CPU Stress' || exp.type === 'Memory Stress')) {
        setClusterStatus('Degraded');
      }

      setTimeout(async () => {
        const isSuccess = Math.random() < settings.successRate;
        const finalStatus = isSuccess ? 'Completed' : 'Failed';
        const durationMin = Math.floor(Math.random() * 2);
        const durationSec = Math.floor(Math.random() * 50) + 10;
        const durationStr = `${durationMin > 0 ? durationMin + 'm ' : ''}${durationSec}s`;
        const impactOptions = isSuccess ? ['Low', 'Medium'] : ['Medium', 'High'];
        const finalImpact = impactOptions[Math.floor(Math.random() * impactOptions.length)];

        if (isSuccess) {
          announceSpeech(`Chaos simulation resolved successfully. All systems operational.`);
        } else {
          announceSpeech(`Warning. Resiliency SLA check failed. Container recovery limit exceeded.`);
        }

        setExperiments((prevExps) => {
          const idx = prevExps.findIndex((e) => e.id === expId);
          if (idx === -1) return prevExps;
          const copy = [...prevExps];
          const updatedExp = { ...copy[idx], status: finalStatus, lastRun: startedAtStr };
          copy[idx] = updatedExp;
          if (userId) {
            upsertExperiment(updatedExp, userId).catch(console.error);
          }
          return copy;
        });

        const completedRun = {
          runId,
          name: exp.name,
          type: exp.type,
          status: finalStatus,
          namespace: exp.namespace,
          target: exp.target,
          startedAt: startedAtStr,
          duration: durationStr,
          impact: finalImpact,
        };

        setResults((prevResults) =>
          prevResults.map((r) =>
            r.runId === runId ? completedRun : r
          )
        );

        if (userId) {
          await insertResult(completedRun, userId).catch(console.error);
        }

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
    announceSpeech(`Cluster status override set to ${status}.`);
    try {
      const token = session?.access_token || localStorage.getItem('access_token') || '';
      await fetch(`${API_BASE}/cluster/health/${status}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });
    } catch (err) {
      console.warn("Could not sync cluster status to backend:", err);
    }
  };

  const handleSaveSettings = async (newSettings) => {
    setSettings(newSettings);
    const userId = session?.user?.id;
    if (userId) {
      try {
        await saveSettings(newSettings, userId);
      } catch (err) {
        console.warn("Could not save settings to Supabase:", err);
      }
    }
    try {
      const token = session?.access_token || localStorage.getItem('access_token') || '';
      await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings),
        credentials: 'include',
      });
    } catch (err) {
      console.warn("Could not sync settings to backend:", err);
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw', bgcolor: '#06070a', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" sx={{ color: '#9ca3af', fontFamily: 'monospace' }}>
          LOADING_OPERATOR_CREDENTIALS...
        </Typography>
      </Box>
    );
  }

  if (!session) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#06070a', width: '100vw !important', maxWidth: '100vw !important', overflowX: 'hidden' }}>
        
        {/* Sidebar Component */}
        <Sidebar
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          currentCluster={currentCluster}
          setCurrentCluster={setCurrentCluster}
          clusterStatus={clusterStatus}
          onOpenPalette={() => {
            setPaletteOpen(true);
            setSearchQuery('');
            setSelIdx(0);
          }}
          session={session}
          onSignOut={signOut}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: 'calc(100vw - 240px) !important',
            marginLeft: '240px !important',
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
              setCurrentCluster={setCurrentCluster}
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

      {/* Global Command Palette */}
      <Dialog
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            position: 'absolute',
            top: '15%',
            bgcolor: 'rgba(22, 25, 32, 0.95)',
            backdropFilter: 'blur(8px)',
            backgroundImage: 'none',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 3,
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search navigation, scenarios, action commands..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelIdx(0);
            }}
            onKeyDown={handlePaletteKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9ca3af', ml: 1 }} />
                </InputAdornment>
              ),
              sx: {
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                '& fieldset': { border: 'none' },
                color: '#fff',
                fontSize: '1rem',
                py: 1,
              },
            }}
          />
          
          <List sx={{ maxHeight: 300, overflowY: 'auto', p: 1.5 }}>
            {filteredCommands.map((cmd, idx) => {
              const isSelected = selIdx === idx;
              return (
                <ListItem key={idx} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => {
                      cmd.action();
                      setPaletteOpen(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      bgcolor: isSelected ? 'rgba(124, 58, 237, 0.15) !important' : 'transparent',
                      color: isSelected ? '#a78bfa' : '#d1d5db',
                      py: 1.2,
                      px: 2,
                    }}
                  >
                    <ListItemText
                      primary={cmd.text}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: isSelected ? 600 : 500,
                      }}
                      secondary={cmd.category}
                      secondaryTypographyProps={{
                        fontSize: '0.7rem',
                        color: isSelected ? 'rgba(167, 139, 250, 0.7)' : '#9ca3af',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
            {filteredCommands.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  No commands found matching "{searchQuery}"
                </Typography>
              </Box>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
