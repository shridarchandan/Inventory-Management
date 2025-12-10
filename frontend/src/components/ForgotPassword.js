import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import api from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', {
        email,
        newPassword,
      });
      setSuccess('If this email exists, the password has been updated.');
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Failed to reset password. Please try again.';
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
                  bgcolor: 'primary.dark',
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
                  <Typography variant="overline" sx={{ opacity: 0.9 }}>
                    Security
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1, mb: 1 }}>
                    Reset your password safely.
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Use a strong password to keep your inventory data protected at
                    all times.
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.9, mt: 3 }}>
                  Passwords are hashed on the server · No plain-text storage
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 4 }} component="form" onSubmit={handleSubmit}>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    Reset Password
                  </Typography>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {success}
                    </Alert>
                  )}
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <TextField
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={loading}
                  >
                    {loading ? 'Updating password...' : 'Update password'}
                  </Button>
                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      justifyContent: 'flex-end',
                      fontSize: '0.85rem',
                    }}
                  >
                    <Link component={RouterLink} to="/login">
                      Back to login
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

export default ForgotPassword;

