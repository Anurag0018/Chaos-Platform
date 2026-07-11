import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import { LocalFireDepartment as FireIcon } from '@mui/icons-material';

const SkullIconSVG = ({ color, size = 24, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color || 'currentColor'} style={{ display: 'block' }} {...props}>
    <path d="M12,2A9,9 0 0,0 3,11C3,14.03 4.53,16.7 6.87,18.28L6.4,22H9V20H11V22H13V20H15V22H17.6L17.13,18.28C19.47,16.7 21,14.03 21,11A9,9 0 0,0 12,2M9,9.5A1.5,1.5 0 0,1 10.5,11A1.5,1.5 0 0,1 9,12.5A1.5,1.5 0 0,1 7.5,11A1.5,1.5 0 0,1 9,9.5M15,9.5A1.5,1.5 0 0,1 16.5,11A1.5,1.5 0 0,1 15,12.5A1.5,1.5 0 0,1 13.5,11A1.5,1.5 0 0,1 15,9.5M10,14H14V16H10V14Z" />
  </svg>
);

const WaveIconSVG = ({ color, size = 24, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }} {...props}>
    <path d="M3 12h3l3-9 4 18 3-12h5" />
  </svg>
);

export default function NewExperimentDialog({ open, onClose, onCreateExperiment }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Pod Kill');
  const [namespace, setNamespace] = useState('target-zone');
  const [target, setTarget] = useState('web-app');
  
  const [namespacesList, setNamespacesList] = useState(['target-zone', 'default', 'kube-system', 'production-gate']);
  const [targetsList, setTargetsList] = useState([]);

  const API_BASE = 'http://localhost:8000/api';

  // Fetch Namespaces from Kubernetes
  useEffect(() => {
    if (!open) return;
    async function fetchNamespaces() {
      try {
        const res = await fetch(`${API_BASE}/kubernetes/namespaces`);
        if (res.ok) {
          const data = await res.json();
          setNamespacesList(data);
          if (data.length > 0 && !data.includes(namespace)) {
            setNamespace(data[0]);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch namespaces from API, using defaults:", err);
      }
    }
    fetchNamespaces();
  }, [open]);

  // Fetch Targets for selected Namespace from Kubernetes
  useEffect(() => {
    if (!open || !namespace) return;
    async function fetchTargets() {
      try {
        const res = await fetch(`${API_BASE}/kubernetes/targets?namespace=${namespace}`);
        if (res.ok) {
          const data = await res.json();
          setTargetsList(data);
          if (data.length > 0) {
            setTarget(data[0]);
          } else {
            setTarget('');
          }
        }
      } catch (err) {
        console.warn("Failed to fetch targets from API:", err);
      }
    }
    fetchTargets();
  }, [open, namespace]);

  const handleCloseWizard = () => {
    setStep(1);
    setName('');
    setDescription('');
    setType('Pod Kill');
    setNamespace('target-zone');
    setTarget('web-app');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !target) return;

    onCreateExperiment({
      name,
      description,
      type,
      namespace,
      target,
    });

    handleCloseWizard();
  };

  const experimentTypes = [
    { value: 'Pod Kill', label: 'Pod Kill', desc: 'Kill random container instances', color: '#10b981', icon: <SkullIconSVG color="#10b981" /> },
    { value: 'Network Chaos', label: 'Network Chaos', desc: 'Inject latency delays & jitter', color: '#3b82f6', icon: <WaveIconSVG color="#3b82f6" /> },
    { value: 'CPU Stress', label: 'CPU Stress', desc: 'Simulate high compute resource stress', color: '#f97316', icon: <FireIcon sx={{ color: '#f97316' }} /> },
    { value: 'Memory Stress', label: 'Memory Stress', desc: 'Simulate RAM resource leakage', color: '#f97316', icon: <FireIcon sx={{ color: '#f97316' }} /> },
    { value: 'Pod Delete', label: 'Pod Delete', desc: 'Gracefully delete target containers', color: '#10b981', icon: <SkullIconSVG color="#10b981" /> },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleCloseWizard}
      maxWidth={step === 1 ? "md" : "sm"}
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#161920',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 3,
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
            New Chaos Experiment
          </Typography>
          
          {/* Step Progress Tracker */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            {[
              { num: 1, label: 'Select Scenario' },
              { num: 2, label: 'Define Targets' },
              { num: 3, label: 'Save Scenario' },
            ].map((s) => {
              const active = step === s.num;
              const completed = step > s.num;
              return (
                <Box key={s.num} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: active ? '#7c3aed' : completed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: active ? '#fff' : completed ? '#10b981' : '#9ca3af',
                      border: active ? '1px solid #7c3aed' : completed ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {s.num}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: active ? '#fff' : '#9ca3af',
                    }}
                  >
                    {s.label}
                  </Typography>
                  {s.num < 3 && (
                    <Box sx={{ width: 16, height: '1px', bgcolor: 'rgba(255,255,255,0.08)', ml: 1 }} />
                  )}
                </Box>
              );
            })}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ mt: 3, pb: 3 }}>
          {step === 1 && (
            <Box>
              <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                Select the type of chaos disruption you want to configure:
              </Typography>
              <Grid container spacing={2}>
                {experimentTypes.map((t) => {
                  const isSelected = type === t.value;
                  return (
                    <Grid item xs={12} sm={6} key={t.value}>
                      <Card
                        onClick={() => {
                          setType(t.value);
                          setStep(2);
                        }}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: isSelected ? `${t.color}08` : 'rgba(255,255,255,0.01)',
                          border: isSelected ? `2px solid ${t.color}` : '2px solid rgba(255,255,255,0.05)',
                          borderRadius: 2,
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            borderColor: t.color,
                            boxShadow: `0 4px 20px ${t.color}15`,
                          },
                        }}
                      >
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '16px !important' }}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 1.5,
                              bgcolor: `${t.color}12`,
                              border: `1px solid ${t.color}25`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {t.icon}
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                              {t.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mt: 0.2 }}>
                              {t.desc}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {step === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                Define the target namespace and Kubernetes resource:
              </Typography>
              
              <FormControl fullWidth required>
                <InputLabel id="namespace-label">Namespace</InputLabel>
                <Select
                  labelId="namespace-label"
                  value={namespace}
                  label="Namespace"
                  onChange={(e) => setNamespace(e.target.value)}
                  sx={{ bgcolor: 'rgba(255,255,255,0.01)' }}
                >
                  {namespacesList.map((ns) => (
                    <MenuItem key={ns} value={ns}>
                      {ns}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {targetsList.length > 0 ? (
                <FormControl fullWidth required>
                  <InputLabel id="target-label">Target Resource / Service</InputLabel>
                  <Select
                    labelId="target-label"
                    value={target}
                    label="Target Resource / Service"
                    onChange={(e) => setTarget(e.target.value)}
                    sx={{ bgcolor: 'rgba(255,255,255,0.01)' }}
                  >
                    {targetsList.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  required
                  fullWidth
                  label="Target Resource / Service"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g. web-app or payment-svc"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.01)',
                    },
                  }}
                />
              )}
            </Box>
          )}

          {step === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                Name and describe your custom chaos experiment:
              </Typography>

              <TextField
                required
                fullWidth
                label="Experiment Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. pod-kill-webapp"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.01)',
                  },
                }}
              />

              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Kill pods randomly to test recovery"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.01)',
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid rgba(255, 255, 255, 0.05)', pt: 2 }}>
          <Button onClick={handleCloseWizard} variant="text" sx={{ color: '#9ca3af', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' } }}>
            Cancel
          </Button>
          
          {step > 1 && (
            <Button onClick={() => setStep(step - 1)} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.08)', color: '#9ca3af', '&:hover': { borderColor: 'rgba(255,255,255,0.2)' } }}>
              Back
            </Button>
          )}

          {step < 3 ? (
            <Button
              variant="contained"
              color="primary"
              disabled={step === 2 && !target}
              onClick={() => setStep(step + 1)}
            >
              Next
            </Button>
          ) : (
            <Button type="submit" variant="contained" color="primary" disabled={!name}>
              Create Experiment
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}
