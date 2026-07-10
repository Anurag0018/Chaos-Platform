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
  LocalFireDepartment as FireIcon,
  Circle as CircleIcon,
  CheckCircle as SuccessIcon,
  Cancel as FailedIcon,
  Explore as CompassIcon,
} from '@mui/icons-material';

// Custom high-fidelity SVGs matching the mockup exactly
const SkullIconSVG = ({ color, size = 32, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color || 'currentColor'} style={{ display: 'block' }} {...props}>
    <path d="M12,2A9,9 0 0,0 3,11C3,14.03 4.53,16.7 6.87,18.28L6.4,22H9V20H11V22H13V20H15V22H17.6L17.13,18.28C19.47,16.7 21,14.03 21,11A9,9 0 0,0 12,2M9,9.5A1.5,1.5 0 0,1 10.5,11A1.5,1.5 0 0,1 9,12.5A1.5,1.5 0 0,1 7.5,11A1.5,1.5 0 0,1 9,9.5M15,9.5A1.5,1.5 0 0,1 16.5,11A1.5,1.5 0 0,1 15,12.5A1.5,1.5 0 0,1 13.5,11A1.5,1.5 0 0,1 15,9.5M10,14H14V16H10V14Z" />
  </svg>
);

const WaveIconSVG = ({ color, size = 32, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }} {...props}>
    <path d="M3 12h3l3-9 4 18 3-12h5" />
  </svg>
);

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
      icon: <SkullIconSVG color="#10b981" size={24} />,
      borderColor: 'rgba(16, 185, 129, 0.2)',
      activeBorderColor: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      bgColor: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)',
    },
    {
      title: 'Network Latency',
      desc: 'Inject Latency',
      type: 'Network Chaos',
      icon: <WaveIconSVG color="#3b82f6" size={24} />,
      borderColor: 'rgba(59, 130, 246, 0.2)',
      activeBorderColor: '#3b82f6',
      bgGlow: 'rgba(59, 130, 246, 0.15)',
      bgColor: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)',
    },
    {
      title: 'CPU/Memory Stress',
      desc: 'Stress Resources',
      type: 'CPU Stress',
      icon: <FireIcon sx={{ fontSize: 24, color: '#f97316' }} />,
      borderColor: 'rgba(249, 115, 22, 0.2)',
      activeBorderColor: '#f97316',
      bgGlow: 'rgba(249, 115, 22, 0.15)',
      bgColor: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 100%)',
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
          isRunning ? (
            <span
              className="status-dot-pulse"
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: color,
                borderRadius: '50%',
              }}
            />
          ) : undefined
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
          px: isRunning ? 0 : 0.5,
          '& .MuiChip-icon': {
            marginLeft: '8px',
            marginRight: '-4px',
          },
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
      {/* View Header */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 0 }}>
          Dashboard
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
                background: action.bgColor,
                border: `1px solid ${action.borderColor}`,
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 24px ${action.bgGlow}`,
                  borderColor: action.activeBorderColor,
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 3 }}>
                <Box
                  sx={{
                    bgcolor: action.bgGlow,
                    p: 1.5,
                    borderRadius: '50%',
                    border: `1px solid ${action.borderColor}`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 56,
                    height: 56,
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {run.type === 'Pod Kill' && (
                              <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', p: 1, borderRadius: '50%', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <SkullIconSVG color="#10b981" size={18} />
                              </Box>
                            )}
                            {run.type === 'Network Chaos' && (
                              <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', p: 1, borderRadius: '50%', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <WaveIconSVG color="#3b82f6" size={18} />
                              </Box>
                            )}
                            {(run.type === 'CPU Stress' || run.type === 'Memory Stress') && (
                              <Box sx={{ bgcolor: 'rgba(249, 115, 22, 0.1)', p: 1, borderRadius: '50%', border: '1px solid rgba(249, 115, 22, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <FireIcon sx={{ color: '#f97316', fontSize: 18 }} />
                              </Box>
                            )}
                            {run.type === 'Pod Delete' && (
                              <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', p: 1, borderRadius: '50%', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <SkullIconSVG color="#10b981" size={18} />
                              </Box>
                            )}
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{run.name}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{getStatusChip(run.status)}</TableCell>
                        <TableCell sx={{ color: '#9ca3af' }}>{run.namespace}</TableCell>
                        <TableCell sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>{run.startedAt}</TableCell>
                        <TableCell align="right">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleViewDetails(run)}
                            sx={{
                              bgcolor: '#7c3aed',
                              color: '#fff',
                              '&:hover': {
                                bgcolor: '#6d28d9',
                              },
                              boxShadow: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              py: 0.5,
                              px: 2,
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
                      <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)', p: 1, borderRadius: 1, display: 'flex' }}>
                        <CompassIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
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
                      <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.05)', p: 1, borderRadius: 1, display: 'flex' }}>
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
                      <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)', p: 1, borderRadius: 1, display: 'flex' }}>
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

                <Box sx={{ mb: 2 }}>
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

                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  {clusterStatus === 'Healthy'
                    ? 'All systems operational'
                    : clusterStatus === 'Degraded'
                    ? 'Some nodes are under heavy CPU/Memory load. Potential latency impacts.'
                    : 'System failure detected in cluster components. Immediate attention required.'}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
