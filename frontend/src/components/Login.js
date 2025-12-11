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

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

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
      const res = await api.post('/auth/login', { email, password });
      login(res.data);
      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Failed to login. Please try again.';
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
                  bgcolor: 'primary.main',
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
                    Stay on top of your stock.
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Monitor low stock items, suppliers and categories from a
                    single, modern dashboard.
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.8, mt: 3 }}>
                  Secure JWT authentication · Role-ready design!
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 4 }} component="form" onSubmit={handleSubmit}>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    Login
                  </Typography>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
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
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                    }}
                  >
                    <Link component={RouterLink} to="/register">
                      Create account
                    </Link>
                    <Link component={RouterLink} to="/forgot-password">
                      Forgot password?
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

export default Login;

