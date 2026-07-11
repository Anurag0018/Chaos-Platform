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
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  LocalFireDepartment as FireIcon,
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

const ActivityHeatmap = () => {
  const generateHeatmapData = () => {
    const data = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      let level = 0; 
      let success = 0;
      let failed = 0;
      
      if (i % 7 === 0) {
        level = 0; 
      } else if (i === 5 || i === 19) {
        level = 4; 
        success = i === 5 ? 1 : 2;
        failed = 1;
      } else {
        level = (i % 3) + 1; 
        success = level;
      }

      data.push({
        date: dayStr,
        level,
        success,
        failed,
      });
    }
    return data;
  };

  const days = generateHeatmapData();

  const getBlockColor = (day) => {
    if (day.failed > 0) return '#ef4444'; 
    if (day.level === 0) return 'rgba(255, 255, 255, 0.03)';
    if (day.level === 1) return '#10b98130';
    if (day.level === 2) return '#10b98170';
    return '#10b981b0'; 
  };

  return (
    <Card sx={{ mb: 3, overflow: 'hidden' }}>
      <Box sx={{ height: 3, background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)' }} />
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
          Chaos Activity Heatmap
        </Typography>
        <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 3 }}>
          Daily chaos engineering execution history over the last 30 days.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, alignItems: 'center' }}>
          {days.map((day, idx) => (
            <Tooltip
              key={idx}
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>{day.date}</Typography>
                  {day.level === 0 ? (
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>No experiments run</Typography>
                  ) : (
                    <>
                      <Typography variant="caption" sx={{ display: 'block', color: '#34d399' }}>• {day.success} Successful</Typography>
                      {day.failed > 0 && (
                        <Typography variant="caption" sx={{ display: 'block', color: '#f87171' }}>• {day.failed} Failed</Typography>
                      )}
                    </>
                  )}
                </Box>
              }
              arrow
              placement="top"
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '4px',
                  bgcolor: getBlockColor(day),
                  border: '1px solid rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                  '&:hover': {
                    transform: 'scale(1.2)',
                    borderColor: '#fff',
                    boxShadow: '0 0 10px rgba(255,255,255,0.1)',
                  },
                }}
              />
            </Tooltip>
          ))}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto', mt: { xs: 2, sm: 0 } }}>
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>Less</Typography>
            <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: 'rgba(255, 255, 255, 0.03)' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: '#10b98130' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: '#10b98170' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: '#10b981b0' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: '#ef4444' }} />
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>More / Failure</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};


const ResilienceScoreboard = () => {
  const scoreboards = [
    { ns: 'target-zone', grade: 'A+', speed: '12s', badges: ['Healer', 'Fortress'], color: '#10b981' },
    { ns: 'default', grade: 'B-', speed: '18s', badges: ['Survivor'], color: '#3b82f6' },
    { ns: 'kube-system', grade: 'C+', speed: '28s', badges: ['Heavyweight'], color: '#f97316' },
  ];

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box sx={{ height: 3, background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)' }} />
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
          Resilience Scoreboard
        </Typography>
        <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 3 }}>
          Self-healing grades & performance metrics by namespace.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {scoreboards.map((score) => (
            <Box
              key={score.ns}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                bgcolor: 'rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.03)',
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                  {score.ns}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                  {score.badges.map((badge) => (
                    <Chip
                      key={badge}
                      label={badge}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: 18,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        color: '#9ca3af',
                        border: '1px solid rgba(255,255,255,0.05)',
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Box>
              </Box>
              
              <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', fontSize: '0.65rem' }}>
                    SLA Speed
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>
                    {score.speed}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: `${score.color}15`,
                    border: `1px solid ${score.color}40`,
                    color: score.color,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                  }}
                >
                  {score.grade}
                </Avatar>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};


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
      icon: <SkullIconSVG color="#10b981" size={40} />,
      borderColor: 'rgba(16, 185, 129, 0.3)',
      activeBorderColor: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.35)',
      bgColor: 'linear-gradient(135deg, #091a12 0%, #032a18 100%)',
      iconBg: 'rgba(16, 185, 129, 0.12)',
    },
    {
      title: 'Network Latency',
      desc: 'Inject Latency',
      type: 'Network Chaos',
      icon: <WaveIconSVG color="#3b82f6" size={40} />,
      borderColor: 'rgba(59, 130, 246, 0.3)',
      activeBorderColor: '#3b82f6',
      bgGlow: 'rgba(59, 130, 246, 0.35)',
      bgColor: 'linear-gradient(135deg, #091629 0%, #042454 100%)',
      iconBg: 'rgba(59, 130, 246, 0.12)',
    },
    {
      title: 'CPU/Memory Stress',
      desc: 'Stress Resources',
      type: 'CPU Stress',
      icon: <FireIcon sx={{ fontSize: 40, color: '#f97316' }} />,
      borderColor: 'rgba(249, 115, 22, 0.3)',
      activeBorderColor: '#f97316',
      bgGlow: 'rgba(249, 115, 22, 0.35)',
      bgColor: 'linear-gradient(135deg, #1b0f07 0%, #3a1c06 100%)',
      iconBg: 'rgba(249, 115, 22, 0.12)',
    },
  ];

  const getStatusChip = (status) => {
    const isCompleted = status === 'Completed';
    const isFailed = status === 'Failed';
    const isRunning = status === 'Running';
    const isReady = status === 'Ready';
    
    let color = '#9ca3af';
    if (isCompleted) color = '#10b981';
    else if (isFailed) color = '#ef4444';
    else if (isRunning) color = '#a78bfa';
    else if (isReady) color = '#3b82f6';

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
          bgcolor: `${color}15`,
          color: color,
          border: `1px solid ${color}30`,
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100% !important', flexGrow: 1 }}>
      {/* View Header */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 0, letterSpacing: '-0.02em' }}>
          Dashboard
        </Typography>
      </Box>

      {/* Top Cards Flex Row */}
      <Box sx={{ display: 'flex', gap: 3, width: '100% !important', flexDirection: { xs: 'column', md: 'row' } }}>
        {quickActions.map((action) => (
          <Box key={action.title} sx={{ flex: 1, minWidth: 0 }}>
            <Card
              onClick={() => handleQuickActionClick(action)}
              sx={{
                cursor: 'pointer',
                background: action.bgColor,
                border: `2px solid ${action.borderColor}`,
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px) !important',
                  boxShadow: `0 12px 30px ${action.borderColor}40 !important`,
                  borderColor: action.borderColor,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)',
                  transition: 'transform 0.6s ease',
                  zIndex: 1,
                  pointerEvents: 'none',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '120px',
                  height: '120px',
                  background: action.bgGlow,
                  filter: 'blur(35px)',
                  borderRadius: '50%',
                  opacity: 0.2,
                  transition: 'all 0.3s ease',
                  pointerEvents: 'none',
                  zIndex: 0,
                },
                '&:hover': {
                  transform: 'translateY(-6px) scale(1.02)',
                  boxShadow: `0 20px 40px ${action.bgGlow}, inset 0 0 15px ${action.borderColor}`,
                  borderColor: action.activeBorderColor,
                  '&::before': {
                    transform: 'translateX(200%)',
                  },
                  '&::after': {
                    opacity: 0.5,
                    transform: 'scale(1.3)',
                  },
                },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, '&:last-child': { pb: 3 } }}>
                <Box
                  sx={{
                    bgcolor: action.iconBg,
                    p: 2,
                    borderRadius: '16px',
                    border: `1.5px solid ${action.borderColor}`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 72,
                    height: 72,
                    flexShrink: 0,
                  }}
                >
                  {action.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 0.5, fontSize: '1.2rem' }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    {action.desc}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <ActivityHeatmap />

      {/* Bottom Layout - Recent Experiments & Sidebar Metrics */}
      <Box sx={{ display: 'flex', gap: 3, width: '100% !important', flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Recent Experiments Table (66.6% width) */}
        <Box sx={{ flex: 2, minWidth: 0 }}>
          <Card sx={{ height: '100%', overflow: 'hidden' }}>
            <Box sx={{ height: 3, background: 'linear-gradient(90deg, #7c3aed 0%, #3b82f6 100%)' }} />
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
                              <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', p: 1, borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <SkullIconSVG color="#10b981" size={18} />
                              </Box>
                            )}
                            {run.type === 'Network Chaos' && (
                              <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', p: 1, borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <WaveIconSVG color="#3b82f6" size={18} />
                              </Box>
                            )}
                            {(run.type === 'CPU Stress' || run.type === 'Memory Stress') && (
                              <Box sx={{ bgcolor: 'rgba(249, 115, 22, 0.1)', p: 1, borderRadius: '8px', border: '1px solid rgba(249, 115, 22, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <FireIcon sx={{ color: '#f97316', fontSize: 18 }} />
                              </Box>
                            )}
                            {run.type === 'Pod Delete' && (
                              <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', p: 1, borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                        <TableCell sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>{formatLocalDate(run.startedAt)}</TableCell>
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
        </Box>

        {/* Right Side Summary Panel (33.3% width) */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            {/* Summary Metrics */}
            <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
              <Box sx={{ height: 3, background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)' }} />
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>
                  Summary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flexShrink: 1 }}>
                      <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', p: 1, borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.15)', display: 'flex', flexShrink: 0 }}>
                        <CompassIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#9ca3af', fontWeight: 500, noWrap: false }}>
                        Total Experiments
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                      {totalRuns}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flexShrink: 1 }}>
                      <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', p: 1, borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', flexShrink: 0 }}>
                        <SuccessIcon sx={{ color: '#10b981', fontSize: 20 }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#9ca3af', fontWeight: 500, noWrap: false }}>
                        Successful
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 700, flexShrink: 0 }}>
                      {successfulRuns}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flexShrink: 1 }}>
                      <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', p: 1, borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', flexShrink: 0 }}>
                        <FailedIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#9ca3af', fontWeight: 500, noWrap: false }}>
                        Failed
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>
                      {failedRuns}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Cluster Health status */}
            <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
              <Box sx={{ height: 3, bgcolor: clusterStatus === 'Healthy' ? '#10b981' : clusterStatus === 'Degraded' ? '#f97316' : '#ef4444' }} />
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

            <ResilienceScoreboard />

            {/* Disruption Recovery Speed Chart */}
            <Card sx={{ overflow: 'hidden' }}>
              <Box sx={{ height: 3, background: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)' }} />
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                  Recovery Analytics
                </Typography>
                <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 3 }}>
                  Average self-healing recovery times.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {[
                    { label: 'Pod Kill / Delete', time: '12s', value: 40, color: '#10b981' },
                    { label: 'Network Chaos', time: '15s', value: 50, color: '#3b82f6' },
                    { label: 'Resource Stress', time: '28s', value: 93, color: '#f97316' },
                  ].map((item) => (
                    <Box key={item.label}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                        <Typography variant="body2" sx={{ color: '#d1d5db', fontWeight: 600 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>
                          {item.time}
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 6, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3, overflow: 'hidden' }}>
                        <Box
                          sx={{
                            width: `${item.value}%`,
                            height: '100%',
                            bgcolor: item.color,
                            borderRadius: 3,
                            boxShadow: `0 0 8px ${item.color}80`,
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
