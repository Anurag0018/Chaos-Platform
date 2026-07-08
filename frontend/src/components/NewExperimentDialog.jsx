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
} from '@mui/material';

export default function NewExperimentDialog({ open, onClose, onCreateExperiment }) {
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

    // Reset form
    setName('');
    setDescription('');
    setType('Pod Kill');
    setNamespace('target-zone');
    setTarget('web-app');
    onClose();
  };

  const experimentTypes = [
    { value: 'Pod Kill', label: 'Pod Kill (Kill Random Pods)' },
    { value: 'Network Chaos', label: 'Network Chaos (Inject Latency)' },
    { value: 'CPU Stress', label: 'CPU Stress (Stress CPU)' },
    { value: 'Memory Stress', label: 'Memory Stress (Stress Memory)' },
    { value: 'Pod Delete', label: 'Pod Delete (Delete Pods)' },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
            New Chaos Experiment
          </Typography>
          <Typography variant="body2" sx={{ color: '#9ca3af', mt: 0.5 }}>
            Configure and register a new chaos engineering scenario.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ mt: 2, pb: 3 }}>
          <Grid container spacing={3}>
            {/* Experiment Name */}
            <Grid item xs={12}>
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
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
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
            </Grid>

            {/* Experiment Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="experiment-type-label">Experiment Type</InputLabel>
                <Select
                  labelId="experiment-type-label"
                  value={type}
                  label="Experiment Type"
                  onChange={(e) => setType(e.target.value)}
                  sx={{ bgcolor: 'rgba(255,255,255,0.01)' }}
                >
                  {experimentTypes.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Namespace */}
            <Grid item xs={12} sm={6}>
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
            </Grid>

            {/* Target Resource */}
            <Grid item xs={12}>
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
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid rgba(255, 255, 255, 0.05)', pt: 2 }}>
          <Button onClick={onClose} variant="text" sx={{ color: '#9ca3af', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' } }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Create Experiment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
