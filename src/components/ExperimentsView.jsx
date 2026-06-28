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
} from '@mui/icons-material';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {/* Experiments Section */}
      <Card>
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
            </Box>
          </Box>

          {/* Experiments Table */}
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
                        <Box
                          sx={{
                            bgcolor: `${getTypeColor(exp.type)}15`,
                            p: 1,
                            borderRadius: '50%',
                            border: `1px solid ${getTypeColor(exp.type)}25`,
                            display: 'flex',
                          }}
                        >
                          <CircleIcon sx={{ color: getTypeColor(exp.type), fontSize: 14 }} />
                        </Box>
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
      <Card>
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
                        <CircleIcon sx={{ color: getTypeColor(res.type), fontSize: 10 }} />
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
                    <TableCell sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>{res.startedAt}</TableCell>
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
