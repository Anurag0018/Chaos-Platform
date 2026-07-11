import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  TextField,
  Chip,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Restore as ResetIcon,
  Add as AddIcon,
} from '@mui/icons-material';

export default function SettingsView({
  currentCluster,
  clusterStatus,
  setClusterStatus,
  settings,
  setSettings,
}) {
  const [successRate, setSuccessRate] = useState((settings?.successRate ?? 0.8) * 100);
  const [simulationSpeed, setSimulationSpeed] = useState(settings?.simulationSpeed ?? 3);
  const [autoHeal, setAutoHeal] = useState(settings?.autoHeal ?? true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [newNamespace, setNewNamespace] = useState('');
  const [namespaces, setNamespaces] = useState(['target-zone', 'default', 'kube-system', 'production-gate']);

  const handleSave = () => {
    setSettings({
      successRate: successRate / 100,
      simulationSpeed: simulationSpeed,
      autoHeal: autoHeal,
    });
    setNotificationOpen(true);
  };

  const handleReset = () => {
    setSuccessRate(80);
    setSimulationSpeed(3);
    setAutoHeal(true);
  };

  const handleAddNamespace = (e) => {
    e.preventDefault();
    if (newNamespace && !namespaces.includes(newNamespace)) {
      setNamespaces([...namespaces, newNamespace]);
      setNewNamespace('');
    }
  };

  const handleDeleteNamespace = (ns) => {
    if (namespaces.length > 1) {
      setNamespaces(namespaces.filter((item) => item !== ns));
    }
  };

  const getNodeData = () => {
    if (clusterStatus === 'Healthy') {
      return [
        { name: 'prod-node-1', status: 'Healthy', color: '#10b981', pods: [{ name: 'payment-svc', status: 'Ready' }, { name: 'web-app', status: 'Ready' }] },
        { name: 'prod-node-2', status: 'Healthy', color: '#10b981', pods: [{ name: 'core-api-service', status: 'Ready' }, { name: 'cache-redis', status: 'Ready' }] },
        { name: 'prod-node-3', status: 'Healthy', color: '#10b981', pods: [{ name: 'auth-service', status: 'Ready' }, { name: 'db-postgres', status: 'Ready' }] },
        { name: 'prod-node-4', status: 'Healthy', color: '#10b981', pods: [{ name: 'ingress-gateway', status: 'Ready' }, { name: 'logging-agent', status: 'Ready' }] },
      ];
    }
    if (clusterStatus === 'Degraded') {
      return [
        { name: 'prod-node-1', status: 'Healthy', color: '#10b981', pods: [{ name: 'payment-svc', status: 'Ready' }, { name: 'web-app', status: 'Ready' }] },
        { name: 'prod-node-2', status: 'Healthy', color: '#10b981', pods: [{ name: 'core-api-service', status: 'Ready' }, { name: 'cache-redis', status: 'Ready' }] },
        { name: 'prod-node-3', status: 'Stressed', color: '#f97316', pods: [{ name: 'auth-service', status: 'Stressed' }, { name: 'db-postgres', status: 'Ready' }] },
        { name: 'prod-node-4', status: 'Healthy', color: '#10b981', pods: [{ name: 'ingress-gateway', status: 'Ready' }, { name: 'logging-agent', status: 'Ready' }] },
      ];
    }
    return [
      { name: 'prod-node-1', status: 'Healthy', color: '#10b981', pods: [{ name: 'payment-svc', status: 'Ready' }, { name: 'web-app', status: 'Ready' }] },
      { name: 'prod-node-2', status: 'Healthy', color: '#10b981', pods: [{ name: 'core-api-service', status: 'Ready' }, { name: 'cache-redis', status: 'Ready' }] },
      { name: 'prod-node-3', status: 'Offline', color: '#ef4444', pods: [{ name: 'auth-service', status: 'Crashed' }, { name: 'db-postgres', status: 'Unreachable' }] },
      { name: 'prod-node-4', status: 'Stressed', color: '#f97316', pods: [{ name: 'ingress-gateway', status: 'Ready' }, { name: 'logging-agent', status: 'Stressed' }] },
    ];
  };
  const nodes = getNodeData();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100% !important' }}>
      {/* View Header */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 1, letterSpacing: '-0.02em' }}>
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
          Configure chaos testing environment parameters and dashboard telemetry behavior.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, width: '100% !important' }}>
        {/* Mock Simulation Settings */}
        <Box sx={{ flex: 1.4, minWidth: 0 }}>
          <Card sx={{ height: '100%', borderTop: '3px solid #7c3aed' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>
                Chaos Simulation Configuration
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Success Rate */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                    Simulated Experiment Success Rate ({successRate}%)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                    Probability that a scheduled chaos run will resolve in 'Completed' rather than 'Failed'.
                  </Typography>
                  <Slider
                    value={successRate}
                    onChange={(e, val) => setSuccessRate(val)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={100}
                    color="primary"
                  />
                </Box>

                {/* Speed */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                    disruption telemetries delay ({simulationSpeed} seconds)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                    How long an experiment remains in the 'Running' state before reporting logs and final results.
                  </Typography>
                  <Slider
                    value={simulationSpeed}
                    onChange={(e, val) => setSimulationSpeed(val)}
                    valueLabelDisplay="auto"
                    min={1}
                    max={10}
                    color="primary"
                  />
                </Box>

                {/* Auto Heal Switch */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ pr: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
                      Enable Auto-Healing Workloads
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                      Simulate Kubernetes self-healing behavior (replacing terminated pods, auto-scaling) to resolve chaos conditions automatically.
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoHeal}
                        onChange={(e) => setAutoHeal(e.target.checked)}
                        color="secondary"
                      />
                    }
                    label=""
                  />
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mt: 2, pt: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ResetIcon />}
                    onClick={handleReset}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.08)',
                      color: '#9ca3af',
                      '&:hover': {
                        borderColor: '#fff',
                        color: '#fff',
                        bgcolor: 'rgba(255,255,255,0.02)',
                      },
                    }}
                  >
                    Reset Defaults
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Panel - Cluster Details & Namespaces */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Cluster Status Tweak */}
            <Card sx={{ borderTop: `3px solid ${clusterStatus === 'Healthy' ? '#10b981' : clusterStatus === 'Degraded' ? '#f97316' : '#ef4444'}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>
                  Cluster Status (Override)
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3 }}>
                  Active cluster is <strong style={{ color: '#fff' }}>{currentCluster}</strong>. Select the status you want to simulate:
                </Typography>

                <Grid container spacing={1.5} sx={{ width: '100% !important', margin: '0 !important' }}>
                  {['Healthy', 'Degraded', 'Critical'].map((status) => {
                    const isActive = clusterStatus === status;
                    let activeColor = '#7c3aed';
                    if (status === 'Healthy') activeColor = '#10b981';
                    if (status === 'Degraded') activeColor = '#f97316';
                    if (status === 'Critical') activeColor = '#ef4444';

                    return (
                      <Grid item xs={4} key={status}>
                        <Button
                          fullWidth
                          variant={isActive ? 'contained' : 'outlined'}
                          onClick={() => setClusterStatus(status)}
                          sx={{
                            fontSize: '0.8rem',
                            py: 1,
                            bgcolor: isActive ? activeColor : 'transparent',
                            color: isActive ? '#fff' : '#9ca3af',
                            borderColor: isActive ? 'transparent' : 'rgba(255,255,255,0.08)',
                            '&:hover': {
                              bgcolor: isActive ? activeColor : 'rgba(255,255,255,0.02)',
                              borderColor: isActive ? 'transparent' : '#fff',
                            },
                          }}
                        >
                          {status}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>

            {/* Namespaces Management */}
            <Card sx={{ borderTop: '3px solid #7c3aed' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
                  Namespace Directory
                </Typography>

                {/* Chips list */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {namespaces.map((ns) => (
                    <Chip
                      key={ns}
                      label={ns}
                      onDelete={() => handleDeleteNamespace(ns)}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#f3f4f6',
                        '& .MuiChip-deleteIcon': {
                          color: '#9ca3af',
                          '&:hover': { color: '#ef4444' },
                        },
                      }}
                    />
                  ))}
                </Box>

                {/* Add Input */}
                <form onSubmit={handleAddNamespace}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add namespace..."
                      value={newNamespace}
                      onChange={(e) => setNewNamespace(e.target.value)}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.1)' } }}
                    />
                    <IconButton
                      type="submit"
                      color="primary"
                      sx={{
                        bgcolor: 'rgba(124, 58, 237, 0.1)',
                        '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.2)' },
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </form>
              </CardContent>
            </Card>

            {/* Cluster Node Map */}
            <Card sx={{ borderTop: `3px solid ${clusterStatus === 'Healthy' ? '#10b981' : clusterStatus === 'Degraded' ? '#f97316' : '#ef4444'}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                  Cluster Node Map
                </Typography>
                <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 3 }}>
                  Visual state of node pools in production-cluster-1.
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  {nodes.map((node) => (
                    <Tooltip
                      key={node.name}
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>{node.name}</Typography>
                          {node.pods.map((p) => (
                            <Typography key={p.name} variant="caption" sx={{ display: 'block', color: p.status === 'Ready' ? '#34d399' : p.status === 'Stressed' ? '#fb923c' : '#f87171' }}>
                              • {p.name} ({p.status})
                            </Typography>
                          ))}
                        </Box>
                      }
                      arrow
                      placement="top"
                    >
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: 'rgba(0,0,0,0.15)',
                          border: '1px solid rgba(255,255,255,0.03)',
                          borderRadius: 2,
                          textAlign: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.02)',
                            transform: 'translateY(-2px)',
                            borderColor: node.color,
                            boxShadow: `0 4px 20px ${node.color}20`,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: node.color,
                            mx: 'auto',
                            mb: 1.5,
                            boxShadow: `0 0 10px ${node.color}`,
                            animation: node.color !== '#10b981' ? 'statusPulse 2s infinite ease-in-out' : 'none',
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#f3f4f6' }}>
                          {node.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                          {node.status}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Snackbar alerts */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={4000}
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setNotificationOpen(false)} severity="success" sx={{ width: '100%' }}>
          Settings updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
