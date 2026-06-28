import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Science as SkullIcon, // Using Science or Skull
  SettingsInputComponent as WaveIcon,
  LocalFireDepartment as FireIcon,
  Circle as CircleIcon,
  CheckCircle as SuccessIcon,
  Error as FailedIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';

export default function DashboardView({
  experiments,
  results,
  clusterStatus,
  onRunExperiment,
  setView,
  setSelectedExperimentForLogs,
}) {
  // Count stats
  const totalRuns = results.length;
  const successfulRuns = results.filter((r) => r.status === 'Completed').length;
  const failedRuns = results.filter((r) => r.status === 'Failed').length;

  const quickActions = [
    {
      title: 'Pod Kill',
      desc: 'Kill Random Pods',
      type: 'Pod Kill',
      icon: <SkullIcon sx={{ fontSize: 32, color: '#10b981' }} />,
      borderColor: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.05)',
    },
    {
      title: 'Network Latency',
      desc: 'Inject Latency',
      type: 'Network Chaos',
      icon: <WaveIcon sx={{ fontSize: 32, color: '#3b82f6' }} />,
      borderColor: '#3b82f6',
      bgGlow: 'rgba(59, 130, 246, 0.05)',
    },
    {
      title: 'CPU/Memory Stress',
      desc: 'Stress Resources',
      type: 'CPU Stress',
      icon: <FireIcon sx={{ fontSize: 32, color: '#f97316' }} />,
      borderColor: '#f97316',
      bgGlow: 'rgba(249, 115, 22, 0.05)',
    },
  ];

  const getStatusChip = (status) => {
    const isCompleted = status === 'Completed';
    const isFailed = status === 'Failed';
    const isRunning = status === 'Running';
    const color = isCompleted ? '#10b981' : isFailed ? '#ef4444' : '#a78bfa';

    return (
      <Chip
        icon={
          <span
            className="status-dot-pulse"
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: color,
              marginLeft: '8px',
              marginRight: '-4px',
            }}
          />
        }
        label={status}
        size="small"
        sx={{
          bgcolor: isCompleted
            ? 'rgba(16, 185, 129, 0.1)'
            : isFailed
            ? 'rgba(239, 68, 68, 0.1)'
            : 'rgba(124, 58, 237, 0.1)',
          color: color,
          border: '1px solid',
          borderColor: isCompleted
            ? 'rgba(16, 185, 129, 0.2)'
            : isFailed
            ? 'rgba(239, 68, 68, 0.2)'
            : 'rgba(124, 58, 237, 0.2)',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      />
    );
  };

  const handleQuickActionClick = (action) => {
    // Find an experiment of this type or run a generic one
    const matchingExp = experiments.find((e) => e.type === action.type);
    if (matchingExp) {
      onRunExperiment(matchingExp.id);
      setView('experiments');
    } else {
      // Trigger new experiment view
      setView('experiments');
    }
  };

  const handleViewDetails = (run) => {
    setSelectedExperimentForLogs(run);
    setView('results');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* View Header */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
          Overview of chaos engineering activities and infrastructure resilience.
        </Typography>
      </Box>

      {/* Top Cards Grid */}
      <Grid container spacing={3}>
        {quickActions.map((action) => (
          <Grid item xs={12} md={4} key={action.title}>
            <Card
              onClick={() => handleQuickActionClick(action)}
              sx={{
                cursor: 'pointer',
                border: `1px solid rgba(255, 255, 255, 0.05)`,
                borderLeft: `4px solid ${action.borderColor}`,
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 24px ${action.bgGlow}`,
                  borderColor: action.borderColor,
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 3 }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.02)',
                    p: 1.5,
                    borderRadius: '50%',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {action.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    {action.desc}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bottom Layout - Recent Experiments & Sidebar Metrics */}
      <Grid container spacing={3}>
        {/* Recent Experiments Table (70% on large, 100% on small) */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>
                Recent Experiments
              </Typography>
              <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                <Table sx={{ minWidth: 500 }} aria-label="recent experiments table">
                  <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.01)' }}>
                    <TableRow>
                      <TableCell>Experiment</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Namespace</TableCell>
                      <TableCell>Started At</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.slice(0, 5).map((run) => (
                      <TableRow key={run.runId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {run.type === 'Pod Kill' && <CircleIcon sx={{ color: '#10b981', fontSize: 10 }} />}
                            {run.type === 'Network Chaos' && <CircleIcon sx={{ color: '#3b82f6', fontSize: 10 }} />}
                            {(run.type === 'CPU Stress' || run.type === 'Memory Stress') && (
                              <CircleIcon sx={{ color: '#f97316', fontSize: 10 }} />
                            )}
                            {run.type === 'Pod Delete' && <CircleIcon sx={{ color: '#059669', fontSize: 10 }} />}
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{run.name}</Typography>
                              <Typography variant="caption" sx={{ color: '#9ca3af' }}>{run.type}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{getStatusChip(run.status)}</TableCell>
                        <TableCell sx={{ color: '#d1d5db' }}>{run.namespace}</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>{run.startedAt}</TableCell>
                        <TableCell align="right">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleViewDetails(run)}
                            sx={{
                              bgcolor: 'rgba(124, 58, 237, 0.15)',
                              color: '#a78bfa',
                              '&:hover': {
                                bgcolor: '#7c3aed',
                                color: '#fff',
                              },
                              boxShadow: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              py: 0.5,
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {results.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                            No recent experiments found. Run a new experiment to see results.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side Summary Panel */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Summary Metrics */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>
                  Summary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 1, borderRadius: 1 }}>
                        <PlayIcon sx={{ color: '#a78bfa', fontSize: 20 }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                        Total Experiments
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                      {totalRuns}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.05)', p: 1, borderRadius: 1 }}>
                        <SuccessIcon sx={{ color: '#10b981', fontSize: 20 }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                        Successful
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 700 }}>
                      {successfulRuns}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)', p: 1, borderRadius: 1 }}>
                        <FailedIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                        Failed
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 700 }}>
                      {failedRuns}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Cluster Health status */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
                  Cluster Health
                </Typography>

                <Box sx={{ mb: 2.5 }}>
                  <Chip
                    label={clusterStatus}
                    sx={{
                      bgcolor:
                        clusterStatus === 'Healthy'
                          ? 'rgba(16, 185, 129, 0.1)'
                          : clusterStatus === 'Degraded'
                          ? 'rgba(249, 115, 22, 0.1)'
                          : 'rgba(239, 68, 68, 0.1)',
                      color:
                        clusterStatus === 'Healthy'
                          ? '#10b981'
                          : clusterStatus === 'Degraded'
                          ? '#f97316'
                          : '#ef4444',
                      border: '1px solid',
                      borderColor:
                        clusterStatus === 'Healthy'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : clusterStatus === 'Degraded'
                          ? 'rgba(249, 115, 22, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                      fontWeight: 700,
                      px: 0.5,
                    }}
                  />
                </Box>

                <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2.5 }}>
                  {clusterStatus === 'Healthy'
                    ? 'All system components are fully operational. No alerts active.'
                    : clusterStatus === 'Degraded'
                    ? 'Some nodes are under heavy CPU/Memory load. Potential latency impacts.'
                    : 'System failure detected in cluster components. Immediate attention required.'}
                </Typography>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>Resilience Score</Typography>
                    <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>
                      {clusterStatus === 'Healthy' ? '94%' : clusterStatus === 'Degraded' ? '76%' : '42%'}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={clusterStatus === 'Healthy' ? 94 : clusterStatus === 'Degraded' ? 76 : 42}
                    color={
                      clusterStatus === 'Healthy'
                        ? 'secondary'
                        : clusterStatus === 'Degraded'
                        ? 'warning'
                        : 'error'
                    }
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
