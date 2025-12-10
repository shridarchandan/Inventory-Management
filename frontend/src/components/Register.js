import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
} from '@mui/material';
import { useAuth } from '../AuthContext';
import api from '../services/api';

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      login(res.data);
      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Failed to register. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        m: 0,
        py: 0,
        px: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={10} lg={8}>
          <Paper
            elevation={8}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.4)',
            }}
          >
            <Grid container>
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'primary.contrastText',
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Inventory Manager
                  </Typography>
                  
                  <Typography variant="h5" sx={{ mt: 1, mb: 1 }}>
                    Set up your workspace.
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Add products, categories and suppliers so your team always
                    knows what&apos;s in stock.
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.9, mt: 3 }}>
                  Designed for modern inventory teams
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 4 }} component="form" onSubmit={handleSubmit}>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    Create Account
                  </Typography>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  <TextField
                    label="Name"
                    fullWidth
                    margin="normal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={Boolean(emailError)}
                    helperText={emailError}
                    required
                  />
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Register'}
                  </Button>
                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                    }}
                  >
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Already have an account?
                    </Typography>
                    <Link component={RouterLink} to="/login">
                      Login
                    </Link>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Register;

