import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Terminal as TerminalIcon,
  CheckCircle as SuccessIcon,
  Error as FailedIcon,
  PlayArrow as RunningIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

export default function ResultsView({
  results,
  selectedRun,
  setSelectedRun,
  setView,
}) {
  const [activeRunId, setActiveRunId] = useState(
    selectedRun ? selectedRun.runId : results[0]?.runId || ''
  );

  const currentRun = results.find((r) => r.runId === activeRunId) || selectedRun || results[0];

  const handleBack = () => {
    setSelectedRun(null);
    setView('experiments');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <SuccessIcon sx={{ color: '#10b981' }} />;
      case 'Failed':
        return <FailedIcon sx={{ color: '#ef4444' }} />;
      default:
        return <RunningIcon sx={{ color: '#a78bfa', animation: 'spin 2s linear infinite' }} />;
    }
  };

  const generateLogs = (run) => {
    if (!run) return [];
    
    const timeBase = run.startedAt.split(' ')[1] || '12:00:00';
    const [h, m, s] = timeBase.split(':').map(Number);
    const pad = (num) => String(num).padStart(2, '0');
    const t = (offset) => {
      let sec = s + offset;
      let min = m + Math.floor(sec / 60);
      let hr = h + Math.floor(min / 60);
      return `${pad(hr % 24)}:${pad(min % 60)}:${pad(sec % 60)}`;
    };

    if (run.status === 'Running') {
      return [
        `[${t(0)}] [INFO] Initializing chaos experiment: "${run.name}"`,
        `[${t(1)}] [INFO] Target resource: "${run.target}" in namespace "${run.namespace}"`,
        `[${t(2)}] [INFO] Pinging target service...`,
        `[${t(3)}] [INFO] Service response: HTTP 200 OK (latency: 18ms)`,
        `[${t(5)}] [WARN] Injecting agent container to run chaos workload...`,
        `[${t(7)}] [RUNNING] Active disruption phase started: target=${run.type}`,
        `[${t(8)}] [LOG] Disruption load running on host node. Monitoring telemetry...`,
      ];
    }

    if (run.status === 'Failed') {
      return [
        `[${t(0)}] [INFO] Initializing chaos experiment: "${run.name}"`,
        `[${t(1)}] [INFO] Target resource: "${run.target}" in namespace "${run.namespace}"`,
        `[${t(2)}] [INFO] Pinging target service...`,
        `[${t(3)}] [INFO] Service response: HTTP 200 OK (latency: 22ms)`,
        `[${t(5)}] [WARN] Injecting agent container: type=${run.type}`,
        `[${t(8)}] [RUNNING] Disruptive payload injected. Loading nodes...`,
        `[${t(12)}] [ERROR] Health check probe failed: Connection refused on port 80/443`,
        `[${t(18)}] [ERROR] Timeout waiting for service recovery! Downtime threshold exceeded (15s limit).`,
        `[${t(24)}] [WARN] Aborting disruption agent to prevent further damage.`,
        `[${t(28)}] [INFO] Restoring original deployment state...`,
        `[${t(30)}] [FATAL] Experiment Failed. SLA breach: Service unrecoverable without manual intervention.`,
        `[${t(32)}] [INFO] Completed post-chaos impact analysis. Status: Failed. Severity: High.`
      ];
    }

    // Default Completed Logs
    return [
      `[${t(0)}] [INFO] Initializing chaos experiment: "${run.name}"`,
      `[${t(1)}] [INFO] Target resource: "${run.target}" in namespace "${run.namespace}"`,
      `[${t(2)}] [INFO] Checking cluster connection... Connected to production-1.`,
      `[${t(3)}] [INFO] Pre-chaos service health check: PASS (HTTP 200, response: 12ms)`,
      `[${t(5)}] [WARN] Disruption payload active: ${run.type} in progress`,
      `[${t(8)}] [RUNNING] Active disturbance injected. Monitoring metric degradation...`,
      `[${t(14)}] [LOG] Metrics showing expected stress levels. CPU: 92%, Network latency spike: +250ms`,
      `[${t(25)}] [INFO] Disruption payload ended. Initiating self-healing verification...`,
      `[${t(32)}] [INFO] Detected replica reschedule. Rebuilding container configurations...`,
      `[${t(40)}] [INFO] System self-healed successfully.`,
      `[${t(45)}] [INFO] Post-chaos service health check: PASS (HTTP 200, response: 14ms)`,
      `[${t(50)}] [SUCCESS] Experiment finished. Status: Completed. System Impact: Low.`
    ];
  };

  const handleDownloadLogs = () => {
    if (!currentRun) return;
    const logText = generateLogs(currentRun).join('\n');
    const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chaos_log_${currentRun.name}_${currentRun.runId}.txt`;
    link.click();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100% !important' }}>
      {/* Header View */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            startIcon={<BackIcon />}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.08)',
              color: '#9ca3af',
              '&:hover': {
                borderColor: '#fff',
                color: '#fff',
              },
            }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff' }}>
            Experiment Logs
          </Typography>
        </Box>

        {results.length > 0 && (
          <FormControl size="small" sx={{ width: 250, ml: { sm: 'auto' } }}>
            <InputLabel id="select-run-label">Select Run</InputLabel>
            <Select
              labelId="select-run-label"
              value={currentRun?.runId || ''}
              label="Select Run"
              onChange={(e) => {
                setActiveRunId(e.target.value);
                const match = results.find((r) => r.runId === e.target.value);
                if (match) setSelectedRun(match);
              }}
              sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}
            >
              {results.map((r) => (
                <MenuItem key={r.runId} value={r.runId}>
                  {r.name} ({r.startedAt.split(' ')[1] || r.runId})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {currentRun ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100% !important' }}>
          {/* Metadata Cards */}
          <Card sx={{ width: '100% !important' }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center" sx={{ width: '100% !important', margin: '0 !important' }}>
                <Grid item xs={12} md={3} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.05)' } }}>
                  <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
                    Experiment Run
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                    {currentRun.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7c3aed', mt: 0.5, fontWeight: 600 }}>
                    {currentRun.type}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={2} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.05)' } }}>
                  <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
                    Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(currentRun.status)}
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>
                      {currentRun.status}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} md={2} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.05)' } }}>
                  <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
                    Namespace & Target
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                    {currentRun.namespace}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    svc: {currentRun.target || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={2} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.05)' } }}>
                  <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
                    Duration
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                    {currentRun.duration}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: { md: 'flex-end' } }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#9ca3af', mr: 1 }}>Impact:</Typography>
                    <Chip
                      label={currentRun.impact}
                      size="small"
                      sx={{
                        bgcolor:
                          currentRun.impact === 'Low'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : currentRun.impact === 'Medium'
                            ? 'rgba(249, 115, 22, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                        color:
                          currentRun.impact === 'Low'
                            ? '#10b981'
                            : currentRun.impact === 'Medium'
                            ? '#f97316'
                            : '#ef4444',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadLogs}
                    sx={{ color: '#a78bfa', '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.05)' } }}
                  >
                    Download logs
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Console Output Terminal */}
          <Card sx={{ width: '100% !important', bgcolor: '#0b0c10', border: '1px solid rgba(255,255,255,0.08)' }}>
            <CardContent sx={{ p: 0 }}>
              {/* Console header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 3,
                  py: 1.5,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  bgcolor: '#111319',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TerminalIcon sx={{ color: '#7c3aed', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ color: '#9ca3af', fontFamily: 'monospace', fontWeight: 600 }}>
                    DISRUPTION_CONSOLE_OUTPUT
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.8 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444' }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f97316' }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                </Box>
              </Box>

              {/* Log screen */}
              <Box
                component={Paper}
                sx={{
                  p: 3,
                  bgcolor: 'transparent',
                  maxHeight: 500,
                  overflowY: 'auto',
                  borderRadius: 0,
                  boxShadow: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                {generateLogs(currentRun).map((log, index) => {
                  let color = '#d1d5db';
                  if (log.includes('[ERROR]') || log.includes('[FATAL]')) color = '#f87171';
                  else if (log.includes('[WARN]')) color = '#fbcfe8';
                  else if (log.includes('[SUCCESS]')) color = '#34d399';
                  else if (log.includes('[RUNNING]')) color = '#c084fc';

                  return (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        color: color,
                        lineHeight: 1.6,
                        fontSize: '0.85rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                      }}
                    >
                      {log}
                    </Typography>
                  );
                })}
                {currentRun.status === 'Running' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                    <CircularProgress size={14} sx={{ color: '#7c3aed' }} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        color: '#a78bfa',
                        fontSize: '0.85rem',
                        fontStyle: 'italic',
                      }}
                    >
                      Awaiting cluster telemetry logs...
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Card>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: '#9ca3af' }}>
              No experiment runs available. Navigate to Experiments to launch one.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
