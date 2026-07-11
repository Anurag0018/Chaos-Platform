import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  InputAdornment,
  CircularProgress,
  Pagination,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  FileDownload as ExportIcon,
  Visibility as ViewIcon,
  Circle as CircleIcon,
  LocalFireDepartment as FireIcon,
  GridView as GridIcon,
  ViewList as ListIcon,
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

export default function ExperimentsView({
  experiments,
  results,
  onRunExperiment,
  onOpenNewExperimentDialog,
  selectedExperimentForLogs,
  setSelectedExperimentForLogs,
  setView,
}) {
  // Search & Filter state for Experiments
  const [layout, setLayout] = useState('list');
  const [expSearch, setExpSearch] = useState('');
  const [expNamespace, setExpNamespace] = useState('All Namespaces');
  const [expPage, setExpPage] = useState(1);
  const [expRowsPerPage, setExpRowsPerPage] = useState(5);

  // Search & Filter state for Results
  const [resSearch, setResSearch] = useState('');
  const [resStatus, setResStatus] = useState('All Status');
  const [resPage, setResPage] = useState(1);
  const [resRowsPerPage, setResRowsPerPage] = useState(5);

  // Filter Experiments
  const filteredExperiments = experiments.filter((exp) => {
    const matchesSearch =
      exp.name.toLowerCase().includes(expSearch.toLowerCase()) ||
      exp.description.toLowerCase().includes(expSearch.toLowerCase());
    const matchesNamespace =
      expNamespace === 'All Namespaces' || exp.namespace === expNamespace;
    return matchesSearch && matchesNamespace;
  });

  // Paginate Experiments
  const expCount = filteredExperiments.length;
  const paginatedExperiments = filteredExperiments.slice(
    (expPage - 1) * expRowsPerPage,
    (expPage - 1) * expRowsPerPage + expRowsPerPage
  );

  // Filter Results
  const filteredResults = results.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(resSearch.toLowerCase()) ||
      res.type.toLowerCase().includes(resSearch.toLowerCase());
    const matchesStatus =
      resStatus === 'All Status' || res.status === resStatus;
    return matchesSearch && matchesStatus;
  });

  // Paginate Results
  const resCount = filteredResults.length;
  const paginatedResults = filteredResults.slice(
    (resPage - 1) * resRowsPerPage,
    (resPage - 1) * resRowsPerPage + resRowsPerPage
  );

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

  const getImpactChip = (impact) => {
    const isLow = impact === 'Low';
    const isMed = impact === 'Medium';
    const isHigh = impact === 'High';

    return (
      <Chip
        label={impact}
        size="small"
        sx={{
          bgcolor: isLow
            ? 'rgba(16, 185, 129, 0.1)'
            : isMed
            ? 'rgba(249, 115, 22, 0.1)'
            : 'rgba(239, 68, 68, 0.1)',
          color: isLow ? '#10b981' : isMed ? '#f97316' : '#ef4444',
          border: '1px solid',
          borderColor: isLow
            ? 'rgba(16, 185, 129, 0.2)'
            : isMed
            ? 'rgba(249, 115, 22, 0.2)'
            : 'rgba(239, 68, 68, 0.2)',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      />
    );
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Pod Kill':
      case 'Pod Delete':
        return '#10b981';
      case 'Network Chaos':
        return '#3b82f6';
      case 'CPU Stress':
      case 'Memory Stress':
        return '#f97316';
      default:
        return '#8b5cf6';
    }
  };

  const handleViewResultLogs = (run) => {
    setSelectedExperimentForLogs(run);
    setView('results');
  };

  const handleExportCSV = () => {
    // Generate simple text representation of results
    const headers = 'RunID,Name,Type,Status,Namespace,StartedAt,Duration,Impact\n';
    const csvContent = results
      .map(
        (r) =>
          `"${r.runId}","${r.name}","${r.type}","${r.status}","${r.namespace}","${r.startedAt}","${r.duration}","${r.impact}"`
      )
      .join('\n');
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `chaos_experiments_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100% !important' }}>
      {/* Experiments Section */}
      <Card sx={{ borderTop: '3px solid #7c3aed' }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header & Controls */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Experiments
              </Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af', mt: 0.5 }}>
                Manage and run chaos experiments
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <TextField
                size="small"
                placeholder="Search experiments..."
                value={expSearch}
                onChange={(e) => {
                  setExpSearch(e.target.value);
                  setExpPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#9ca3af', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: '100%', sm: 200 },
                  '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)' },
                }}
              />

              <FormControl size="small" sx={{ width: { xs: '100%', sm: 160 } }}>
                <Select
                  value={expNamespace}
                  onChange={(e) => {
                    setExpNamespace(e.target.value);
                    setExpPage(1);
                  }}
                  sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}
                >
                  <MenuItem value="All Namespaces">All Namespaces</MenuItem>
                  <MenuItem value="target-zone">target-zone</MenuItem>
                  <MenuItem value="default">default</MenuItem>
                  <MenuItem value="kube-system">kube-system</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onOpenNewExperimentDialog}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                New Experiment
              </Button>

              <Box sx={{ display: 'flex', gap: 0.5, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 0.5, bgcolor: 'rgba(0,0,0,0.1)' }}>
                <IconButton
                  size="small"
                  onClick={() => setLayout('list')}
                  sx={{
                    color: layout === 'list' ? '#7c3aed' : '#9ca3af',
                    bgcolor: layout === 'list' ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                    borderRadius: 1.5,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                  }}
                >
                  <ListIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setLayout('grid')}
                  sx={{
                    color: layout === 'grid' ? '#7c3aed' : '#9ca3af',
                    bgcolor: layout === 'grid' ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                    borderRadius: 1.5,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                  }}
                >
                  <GridIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Experiments Table */}
          {layout === 'list' ? (
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.01)' }}>
                  <TableRow>
                    <TableCell>Experiment</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Namespace</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Run</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedExperiments.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {exp.type === 'Pod Kill' && (
                            <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', p: 1, borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <SkullIconSVG color="#10b981" size={18} />
                            </Box>
                          )}
                          {exp.type === 'Network Chaos' && (
                            <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', p: 1, borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <WaveIconSVG color="#3b82f6" size={18} />
                            </Box>
                          )}
                          {(exp.type === 'CPU Stress' || exp.type === 'Memory Stress') && (
                            <Box sx={{ bgcolor: 'rgba(249, 115, 22, 0.1)', p: 1, borderRadius: '8px', border: '1px solid rgba(249, 115, 22, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <FireIcon sx={{ color: '#f97316', fontSize: 18 }} />
                            </Box>
                          )}
                          {exp.type === 'Pod Delete' && (
                            <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', p: 1, borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <SkullIconSVG color="#10b981" size={18} />
                            </Box>
                          )}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {exp.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                              {exp.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={exp.type}
                          size="small"
                          sx={{
                            bgcolor: `${getTypeColor(exp.type)}15`,
                            color: getTypeColor(exp.type),
                            border: `1px solid ${getTypeColor(exp.type)}30`,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#d1d5db' }}>{exp.namespace}</TableCell>
                      <TableCell sx={{ color: '#d1d5db' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 14, height: 14, borderRadius: 0.5, border: '1px solid #9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>C</Box>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{exp.target}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{getStatusChip(exp.status)}</TableCell>
                      <TableCell sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>{exp.lastRun}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          {exp.status === 'Running' ? (
                            <CircularProgress size={20} sx={{ m: 1, color: '#7c3aed' }} />
                          ) : (
                            <Tooltip title="Run Experiment">
                              <IconButton
                                size="small"
                                onClick={() => onRunExperiment(exp.id)}
                                sx={{
                                  color: '#10b981',
                                  bgcolor: 'rgba(16, 185, 129, 0.05)',
                                  '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.15)' },
                                }}
                              >
                                <PlayIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <IconButton
                            size="small"
                            sx={{
                              color: '#9ca3af',
                              '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{
                              color: '#9ca3af',
                              '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' },
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedExperiments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                          No experiments found matching filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </TableContainer>
          ) : (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {paginatedExperiments.map((exp) => {
                const typeColor = getTypeColor(exp.type);
                return (
                  <Grid item xs={12} sm={6} md={4} key={exp.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        borderTop: `3px solid ${typeColor}`,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 24px ${typeColor}15`,
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3, pb: 1, flexGrow: 1 }}>
                        {/* Header Info */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Chip
                            label={exp.type}
                            size="small"
                            sx={{
                              bgcolor: `${typeColor}15`,
                              color: typeColor,
                              border: `1px solid ${typeColor}30`,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          />
                          {getStatusChip(exp.status)}
                        </Box>

                        {/* Title & Desc */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                          {exp.type === 'Pod Kill' && <SkullIconSVG color="#10b981" size={20} />}
                          {exp.type === 'Network Chaos' && <WaveIconSVG color="#3b82f6" size={20} />}
                          {(exp.type === 'CPU Stress' || exp.type === 'Memory Stress') && <FireIcon sx={{ color: '#f97316', fontSize: 20 }} />}
                          {exp.type === 'Pod Delete' && <SkullIconSVG color="#10b981" size={20} />}
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                            {exp.name}
                          </Typography>
                        </Box>
                        
                        <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 3, minHeight: '32px' }}>
                          {exp.description}
                        </Typography>

                        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

                        {/* Target Metadata details */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ color: '#9ca3af' }}>Namespace</Typography>
                            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>{exp.namespace}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ color: '#9ca3af' }}>Target Service</Typography>
                            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>{exp.target}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ color: '#9ca3af' }}>Last Run</Typography>
                            <Typography variant="caption" sx={{ color: '#9ca3af' }}>{exp.lastRun || 'Never'}</Typography>
                          </Box>
                        </Box>
                      </CardContent>

                      {/* Actions Card Footer */}
                      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {exp.status === 'Running' ? (
                          <CircularProgress size={20} sx={{ m: 1, color: '#7c3aed' }} />
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => onRunExperiment(exp.id)}
                            startIcon={<PlayIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              bgcolor: 'rgba(16, 185, 129, 0.1)',
                              color: '#10b981',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)' },
                              py: 0.5,
                            }}
                          >
                            Run Scenario
                          </Button>
                        )}
                        <IconButton
                          size="small"
                          sx={{
                            color: '#9ca3af',
                            '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            color: '#9ca3af',
                            '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' },
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
              {paginatedExperiments.length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2, border: '1px dashed rgba(255,255,255,0.05)' }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                      No experiments found matching filters.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}

          {/* Experiments Pagination */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              mt: 3,
              pt: 2,
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
              Showing {(expPage - 1) * expRowsPerPage + 1} to{' '}
              {Math.min(expPage * expRowsPerPage, expCount)} of {expCount} experiments
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Pagination
                count={Math.ceil(expCount / expRowsPerPage)}
                page={expPage}
                onChange={(e, p) => setExpPage(p)}
                color="primary"
                size="small"
              />
              <FormControl size="small" sx={{ width: 100 }}>
                <Select
                  value={expRowsPerPage}
                  onChange={(e) => {
                    setExpRowsPerPage(e.target.value);
                    setExpPage(1);
                  }}
                  sx={{
                    fontSize: '0.75rem',
                    bgcolor: 'rgba(0,0,0,0.1)',
                    '& .MuiSelect-select': { py: 0.5 },
                  }}
                >
                  <MenuItem value={5}>5 / page</MenuItem>
                  <MenuItem value={10}>10 / page</MenuItem>
                  <MenuItem value={20}>20 / page</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card sx={{ borderTop: '3px solid #3b82f6' }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header & Controls */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                Results
              </Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af', mt: 0.5 }}>
                View experiment results and system impact
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <TextField
                size="small"
                placeholder="Search results..."
                value={resSearch}
                onChange={(e) => {
                  setResSearch(e.target.value);
                  setResPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#9ca3af', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: '100%', sm: 200 },
                  '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)' },
                }}
              />

              <FormControl size="small" sx={{ width: { xs: '100%', sm: 160 } }}>
                <Select
                  value={resStatus}
                  onChange={(e) => {
                    setResStatus(e.target.value);
                    setResPage(1);
                  }}
                  sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}
                >
                  <MenuItem value="All Status">All Status</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                  <MenuItem value="Running">Running</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExportCSV}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  '&:hover': {
                    borderColor: '#fff',
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                  },
                }}
              >
                Export
              </Button>
            </Box>
          </Box>

          {/* Results Table */}
          <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.01)' }}>
                <TableRow>
                  <TableCell>Experiment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Namespace</TableCell>
                  <TableCell>Started At</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Impact</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedResults.map((res) => (
                  <TableRow key={res.runId}>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {res.type === 'Pod Kill' && (
                          <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', p: 1, borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <SkullIconSVG color="#10b981" size={18} />
                          </Box>
                        )}
                        {res.type === 'Network Chaos' && (
                          <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', p: 1, borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <WaveIconSVG color="#3b82f6" size={18} />
                          </Box>
                        )}
                        {(res.type === 'CPU Stress' || res.type === 'Memory Stress') && (
                          <Box sx={{ bgcolor: 'rgba(249, 115, 22, 0.1)', p: 1, borderRadius: '8px', border: '1px solid rgba(249, 115, 22, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <FireIcon sx={{ color: '#f97316', fontSize: 18 }} />
                          </Box>
                        )}
                        {res.type === 'Pod Delete' && (
                          <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', p: 1, borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <SkullIconSVG color="#10b981" size={18} />
                          </Box>
                        )}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {res.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                            {res.type}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{getStatusChip(res.status)}</TableCell>
                    <TableCell sx={{ color: '#d1d5db' }}>{res.namespace}</TableCell>
                    <TableCell sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>{formatLocalDate(res.startedAt)}</TableCell>
                    <TableCell sx={{ color: '#d1d5db' }}>{res.duration}</TableCell>
                    <TableCell>{getImpactChip(res.impact)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="View Logs">
                          <IconButton
                            size="small"
                            onClick={() => handleViewResultLogs(res)}
                            sx={{
                              color: '#a78bfa',
                              bgcolor: 'rgba(124, 58, 237, 0.05)',
                              '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.15)' },
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download CSV Log">
                          <IconButton
                            size="small"
                            onClick={handleExportCSV}
                            sx={{
                              color: '#9ca3af',
                              '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' },
                            }}
                          >
                            <ExportIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedResults.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        No results found. Run an experiment or modify your search filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Results Pagination */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              mt: 3,
              pt: 2,
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
              Showing {(resPage - 1) * resRowsPerPage + 1} to{' '}
              {Math.min(resPage * resRowsPerPage, resCount)} of {resCount} results
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Pagination
                count={Math.ceil(resCount / resRowsPerPage)}
                page={resPage}
                onChange={(e, p) => setResPage(p)}
                color="primary"
                size="small"
              />
              <FormControl size="small" sx={{ width: 100 }}>
                <Select
                  value={resRowsPerPage}
                  onChange={(e) => {
                    setResRowsPerPage(e.target.value);
                    setResPage(1);
                  }}
                  sx={{
                    fontSize: '0.75rem',
                    bgcolor: 'rgba(0,0,0,0.1)',
                    '& .MuiSelect-select': { py: 0.5 },
                  }}
                >
                  <MenuItem value={5}>5 / page</MenuItem>
                  <MenuItem value={10}>10 / page</MenuItem>
                  <MenuItem value={20}>20 / page</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
