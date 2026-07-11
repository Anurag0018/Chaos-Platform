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

const formatLocalDate = (utcString) => {
  if (!utcString) return '';
  let isoString = utcString;
  if (!utcString.includes('T')) {
    isoString = utcString.trim().replace(' ', 'T') + 'Z';
  }
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return utcString;
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const ChaosSparkline = ({ type, status }) => {
  const isFailed = status === 'Failed';
  
  let color = '#7c3aed';
  let label = 'System Metric';
  let valueLabel = 'Normal';
  if (type === 'Pod Kill' || type === 'Pod Delete') {
    color = '#10b981';
    label = 'Replica Availability';
    valueLabel = isFailed ? '2 / 3 Replicas (Degraded)' : '3 / 3 Replicas (Healthy)';
  } else if (type === 'Network Chaos') {
    color = '#3b82f6';
    label = 'Network Latency';
    valueLabel = isFailed ? '250ms (Jitter Active)' : '14ms (Healthy)';
  } else if (type === 'CPU Stress' || type === 'Memory Stress') {
    color = '#f97316';
    label = 'CPU Utilization';
    valueLabel = isFailed ? '95% (Resource Saturation)' : '12% (Healthy)';
  }

  let d = '';
  if (type === 'Pod Kill' || type === 'Pod Delete') {
    d = isFailed 
      ? 'M 0 30 L 250 30 L 250 70 L 800 70' 
      : 'M 0 30 L 250 30 L 250 70 L 550 70 L 550 30 L 800 30';
  } else if (type === 'Network Chaos') {
    d = isFailed
      ? 'M 0 85 L 150 85 C 180 85, 200 20, 230 20 L 270 45 L 310 25 L 350 55 L 390 15 L 430 40 L 800 20'
      : 'M 0 85 L 150 85 C 180 85, 200 20, 230 20 L 270 45 L 310 25 L 350 55 L 390 15 L 430 40 L 470 20 C 500 20, 520 85, 550 85 L 800 85';
  } else {
    d = isFailed
      ? 'M 0 85 L 150 85 C 190 85, 220 15, 260 15 L 800 15'
      : 'M 0 85 L 150 85 C 190 85, 220 15, 260 15 L 530 15 C 570 15, 600 85, 640 85 L 800 85';
  }

  return (
    <Box sx={{ width: '100%', mt: 3, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5, letterSpacing: '0.05em' }}>
            TELEMETRY METRICS
          </Typography>
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600 }}>
            {label}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5, letterSpacing: '0.05em' }}>
            CURRENT STATUS
          </Typography>
          <Typography variant="body2" sx={{ color: color, fontWeight: 700 }}>
            {valueLabel}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2, p: 2, border: '1px solid rgba(255,255,255,0.03)', position: 'relative', overflow: 'hidden' }}>
        <svg viewBox="0 0 800 100" width="100%" height="80px" style={{ overflow: 'visible', display: 'block' }}>
          <defs>
            <linearGradient id={`grad-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          <line x1="0" y1="20" x2="800" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="0" y1="50" x2="800" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="0" y1="80" x2="800" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          
          <path
            d={`${d} L 800 100 L 0 100 Z`}
            fill={`url(#grad-${type})`}
            style={{
              animation: 'fadeIn 0.5s ease forwards',
            }}
          />
          
          <path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: 1000,
              animation: 'drawPath 2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            }}
          />
        </svg>
      </Box>
      <style>{`
        @keyframes drawPath {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </Box>
  );
};

const DisruptionTimeline = ({ currentRun }) => {
  const isFailed = currentRun.status === 'Failed';
  
  const getTimelineSteps = () => {
    const steps = [
      { label: 'Initializing Simulation', desc: 'Pre-flight checks and Kubernetes client setup.', time: '0s', status: 'success' },
    ];
    
    if (currentRun.type === 'Pod Kill' || currentRun.type === 'Pod Delete') {
      steps.push({ label: 'Locating Target Pods', desc: `Namespace: ${currentRun.namespace}, Selector: ${currentRun.target}`, time: '+1s', status: 'success' });
      steps.push({ label: 'Injecting Pod Disruption', desc: `SIGKILL signal sent to matching pod.`, time: '+2s', status: 'success' });
      if (isFailed) {
        steps.push({ label: 'Service Outage Detected', desc: 'Readiness probe failed. Target pods unresponsive.', time: '+5s', status: 'failed' });
        steps.push({ label: 'Reconciliation Timeout', desc: 'Kubernetes self-healing scheduler failed to spawn new replicas.', time: '+15s', status: 'failed' });
      } else {
        steps.push({ label: 'Pod Eviction Confirmed', desc: 'Replica capacity degraded to 2/3.', time: '+3s', status: 'success' });
        steps.push({ label: 'Kubernetes Reconciliation', desc: 'ReplicaSet scheduler initialized container spawning.', time: '+8s', status: 'success' });
        steps.push({ label: 'System Restored', desc: 'All readiness checks passed. Replicas: 3/3.', time: '+15s', status: 'success' });
      }
    } else if (currentRun.type === 'Network Chaos') {
      steps.push({ label: 'Injecting Traffic Latency', desc: 'Adding 250ms latency delay rule to container veth.', time: '+1s', status: 'success' });
      if (isFailed) {
        steps.push({ label: 'Connection Dropped', desc: 'Gateway timeout (504) detected under high jitter.', time: '+6s', status: 'failed' });
        steps.push({ label: 'Simulation Aborted', desc: 'Experiment failed to gracefully recover traffic rules.', time: '+15s', status: 'failed' });
      } else {
        steps.push({ label: 'Jitter Monitor Active', desc: 'Ping telemetry latency stabilized at 250ms.', time: '+4s', status: 'success' });
        steps.push({ label: 'Clearing Latency Rules', desc: 'Deleting tc filter configuration.', time: '+10s', status: 'success' });
        steps.push({ label: 'Latency Recovered', desc: 'Ping normalized back to 14ms baseline.', time: '+15s', status: 'success' });
      }
    } else {
      steps.push({ label: 'Resource Injection', desc: 'Running high load stress-ng worker threads.', time: '+1s', status: 'success' });
      if (isFailed) {
        steps.push({ label: 'OOM Killer Triggered', desc: 'Kernel terminated critical daemon process.', time: '+8s', status: 'failed' });
        steps.push({ label: 'Resource Exhausted', desc: 'Node memory capacity saturated at 95%.', time: '+15s', status: 'failed' });
      } else {
        steps.push({ label: 'Monitoring Utilization', desc: 'Resource load stabilized at 92% utilization.', time: '+5s', status: 'success' });
        steps.push({ label: 'Terminating stress-ng', desc: 'Killing worker process threads.', time: '+10s', status: 'success' });
        steps.push({ label: 'Resources Restored', desc: 'CPU usage cooled down back to 12% baseline.', time: '+15s', status: 'success' });
      }
    }

    return steps;
  };

  const steps = getTimelineSteps();

  return (
    <Card sx={{ height: '100%', bgcolor: '#111319', border: '1px solid rgba(255,255,255,0.08)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ color: '#9ca3af', fontFamily: 'monospace', fontWeight: 600, mb: 3 }}>
          DISRUPTION_EVENT_TIMELINE
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, position: 'relative', pl: 3, '&::before': { content: '""', position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', bgcolor: 'rgba(255,255,255,0.05)' } }}>
          {steps.map((step, idx) => (
            <Box key={idx} sx={{ position: 'relative' }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: '-28px',
                  top: '4px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  bgcolor: step.status === 'success' ? '#10b981' : '#ef4444',
                  boxShadow: `0 0 8px ${step.status === 'success' ? '#10b981' : '#ef4444'}80`,
                  border: '2px solid #111319',
                  zIndex: 2,
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                    {step.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                    {step.desc}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#a78bfa', fontFamily: 'monospace', fontWeight: 600 }}>
                  {step.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

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
  const [logFilter, setLogFilter] = useState('ALL');
  const [copied, setCopied] = useState(false);

  const handleCopyLogs = () => {
    if (!currentRun) return;
    const logText = generateLogs(currentRun).join('\n');
    navigator.clipboard.writeText(logText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
    
    const localStartedAt = formatLocalDate(run.startedAt);
    const timeBase = localStartedAt.split(' ')[1] || '12:00:00';
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
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
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
                  {r.name} ({formatLocalDate(r.startedAt).split(' ')[1] || r.runId})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {currentRun ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100% !important' }}>
          {/* Metadata Cards */}
          <Card sx={{ width: '100% !important', borderTop: '3px solid #7c3aed' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 0, width: '100%' }}>
                {/* Col 1 */}
                <Box sx={{ flex: 1.2, borderRight: { md: '1px solid rgba(255,255,255,0.05)' }, pr: 3, pb: { xs: 2, md: 0 } }}>
                  <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
                    Experiment Run
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                    {currentRun.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7c3aed', mt: 0.5, fontWeight: 600 }}>
                    {currentRun.type}
                  </Typography>
                </Box>

                {/* Col 2 */}
                <Box sx={{ flex: 1, borderRight: { md: '1px solid rgba(255,255,255,0.05)' }, px: { md: 3 }, py: { xs: 2, md: 0 }, borderTop: { xs: '1px solid rgba(255,255,255,0.05)', md: 'none' } }}>
                  <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
                    Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(currentRun.status)}
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>
                      {currentRun.status}
                    </Typography>
                  </Box>
                </Box>

                {/* Col 3 */}
                <Box sx={{ flex: 1.2, borderRight: { md: '1px solid rgba(255,255,255,0.05)' }, px: { md: 3 }, py: { xs: 2, md: 0 }, borderTop: { xs: '1px solid rgba(255,255,255,0.05)', md: 'none' } }}>
                  <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
                    Namespace & Target
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                    {currentRun.namespace}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    svc: {currentRun.target || 'N/A'}
                  </Typography>
                </Box>

                {/* Col 4 */}
                <Box sx={{ flex: 1, borderRight: { md: '1px solid rgba(255,255,255,0.05)' }, px: { md: 3 }, py: { xs: 2, md: 0 }, borderTop: { xs: '1px solid rgba(255,255,255,0.05)', md: 'none' } }}>
                  <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
                    Duration
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                    {currentRun.duration}
                  </Typography>
                </Box>

                {/* Col 5 */}
                <Box sx={{ flex: 1.2, borderRight: { md: '1px solid rgba(255,255,255,0.05)' }, px: { md: 3 }, py: { xs: 2, md: 0 }, borderTop: { xs: '1px solid rgba(255,255,255,0.05)', md: 'none' } }}>
                  <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>
                    Execution Time
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                    {formatLocalDate(currentRun.startedAt).split(' ')[1] || 'N/A'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    {formatLocalDate(currentRun.startedAt).split(' ')[0] || ''}
                  </Typography>
                </Box>

                {/* Col 6 */}
                <Box sx={{ flex: 1.2, pl: { md: 3 }, pt: { xs: 2, md: 0 }, borderTop: { xs: '1px solid rgba(255,255,255,0.05)', md: 'none' }, display: 'flex', flexDirection: 'column', alignItems: { md: 'flex-end', xs: 'flex-start' }, justifyContent: 'center' }}>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>Impact:</Typography>
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
                    sx={{ color: '#a78bfa', '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.05)' }, p: 0 }}
                  >
                    Download logs
                  </Button>
                </Box>
              </Box>
              <ChaosSparkline type={currentRun.type} status={currentRun.status} />
            </CardContent>
          </Card>

          {/* Console Output Terminal & Timeline Row */}
          <Box sx={{ display: 'flex', gap: 3, width: '100% !important', flexDirection: { xs: 'column', lg: 'row' } }}>
            {/* Console Output Terminal */}
            <Box sx={{ flex: { xs: 1, lg: 2 }, minWidth: 0 }}>
              <Card sx={{ bgcolor: '#020408', border: '1px solid rgba(123, 44, 255, 0.1)', overflow: 'hidden' }}>
                <Box sx={{ height: 3, background: 'linear-gradient(90deg, #7b2cff 0%, #06f0b4 100%)' }} />
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
                      bgcolor: '#080a0f',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TerminalIcon sx={{ color: '#7b2cff', fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ color: '#9ca3af', fontFamily: 'monospace', fontWeight: 600, mr: 2 }}>
                        DISRUPTION_CONSOLE_OUTPUT
                      </Typography>
                      {/* Filter tabs */}
                      <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '4px', p: 0.25 }}>
                        {['ALL', 'INFO', 'WARN/ERROR'].map((tab) => (
                          <Button
                            key={tab}
                            size="small"
                            variant="text"
                            onClick={() => setLogFilter(tab)}
                            sx={{
                              color: logFilter === tab ? '#7b2cff' : 'rgba(255,255,255,0.4)',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              px: 1.2,
                              py: 0.25,
                              minWidth: 0,
                              height: '24px',
                              bgcolor: logFilter === tab ? 'rgba(123, 44, 255, 0.08)' : 'transparent',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.02)', color: '#fff' },
                            }}
                          >
                            {tab}
                          </Button>
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Button
                        size="small"
                        variant="text"
                        onClick={handleCopyLogs}
                        sx={{
                          color: copied ? '#06f0b4' : '#9ca3af',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          height: '24px',
                          '&:hover': { color: '#fff' },
                        }}
                      >
                        {copied ? 'Copied!' : 'Copy Logs'}
                      </Button>
                      <Box sx={{ display: 'flex', gap: 0.8 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff3860' }} />
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff8c00' }} />
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#06f0b4' }} />
                      </Box>
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
                      gap: 1.2,
                    }}
                  >
                    {generateLogs(currentRun)
                      .filter((log) => {
                        if (logFilter === 'INFO') {
                          return log.includes('[INFO]') || log.includes('[SUCCESS]') || log.includes('[LOG]');
                        }
                        if (logFilter === 'WARN/ERROR') {
                          return log.includes('[WARN]') || log.includes('[ERROR]') || log.includes('[FATAL]');
                        }
                        return true;
                      })
                      .map((log, index) => {
                        let color = '#00ff66';
                        if (log.includes('[ERROR]') || log.includes('[FATAL]')) color = '#ff3860';
                        else if (log.includes('[WARN]')) color = '#ff8c00';
                        else if (log.includes('[SUCCESS]')) color = '#06f0b4';
                        else if (log.includes('[RUNNING]')) color = '#7b2cff';

                        return (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                color: 'rgba(255,255,255,0.15)',
                                userSelect: 'none',
                                width: '20px',
                                textAlign: 'right',
                                fontSize: '0.9rem',
                                lineHeight: 1.6,
                              }}
                            >
                              {String(index + 1).padStart(2, '0')}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                color: color,
                                lineHeight: 1.6,
                                fontSize: '0.9rem',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                              }}
                            >
                              {log}
                            </Typography>
                          </Box>
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

            {/* Disruption Event Timeline */}
            <Box sx={{ flex: { xs: 1, lg: 1 } }}>
              <DisruptionTimeline currentRun={currentRun} />
            </Box>
          </Box>
        </Box>
      ) : (
        <Card sx={{ borderTop: '3px solid #7c3aed' }}>
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
