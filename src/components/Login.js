import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Box,
  useTheme,
  InputAdornment,
  IconButton,
  Link,
  Divider
} from "@mui/material";
import { Visibility, VisibilityOff, Scale, LockOutlined, EmailOutlined } from "@mui/icons-material";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const theme = useTheme();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleLogin = async () => {
    let role = "";
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (trimmedEmail === "Anusha" && trimmedPassword === "Anusha") {
      role = "ADMIN";
      localStorage.setItem("email", trimmedEmail);
      localStorage.setItem("role", role);
      localStorage.removeItem("firmId"); 
      navigate("/dashboardv3", {
        state: { inputValue: trimmedEmail, role },
      });
      return;
    }

    if (!emailRegex.test(trimmedEmail) || trimmedPassword === "") {
      setError(true);
      setSnackbarOpen(true);
      return;
    }

    try {
      const loginResponse = await axios.post("http://23.23.199.217:8080/api/login", {
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (loginResponse.data === "PASSWORD_OK_NEED_CODE") {
        navigate("/verifyCode", {
          state: { email: trimmedEmail },
        });
        return;
      }

      if (loginResponse.data && loginResponse.data.firm) {
        const firmId = loginResponse.data.firm.custi_id;
        const lawyerRole = loginResponse.data.lawyerRole;
        const lawyerId = loginResponse.data.lawyerId;

        localStorage.setItem("email", trimmedEmail);
        localStorage.setItem("role", lawyerRole);
        localStorage.setItem("firmId", firmId);
        localStorage.setItem("lawyerId", lawyerId);

        navigate("/FirmDashboard", {
          state: {
            inputValue: trimmedEmail,
            role: lawyerRole,
            firmId: firmId,
            lawyerRole: lawyerRole,
          },
        });
        return;
      }

      setError(true);
      setSnackbarOpen(true);

    } catch (error) {
      console.error("Error calling login API:", error);
      setError(true);
      setSnackbarOpen(true);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container 
      maxWidth={false}
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        backgroundImage: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: 2
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Scale sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1976d2',
              letterSpacing: '0.5px'
            }}
          >
            Law Pilot
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            width: '100%',
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            backgroundColor: '#fff',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              fontWeight: 600,
              textAlign: 'center',
              color: '#2c3e50'
            }}
          >
            Welcome Back
          </Typography>

          <TextField
            fullWidth
            label="Email or 'Anusha'"
            variant="outlined"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(false);
            }}
            onKeyPress={handleKeyPress}
            error={error}
            helperText={error ? "Enter a valid email or 'Anusha'" : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined sx={{ color: '#666' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#fff',
                '&:hover fieldset': {
                  borderColor: '#1976d2',
                },
              }
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            onKeyPress={handleKeyPress}
            error={error}
            helperText={error ? "Enter a valid password" : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ color: '#666' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 4,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#fff',
                '&:hover fieldset': {
                  borderColor: '#1976d2',
                },
              }
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            sx={{
              py: 1.8,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              backgroundColor: '#1976d2',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                backgroundColor: '#1565c0',
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
              }
            }}
          >
            Sign In
          </Button>

      
        </Paper>

        {/* <Typography
          variant="body2"
          sx={{
            mt: 3,
            color: '#666',
            textAlign: 'center'
          }}
        >
          © {new Date().getFullYear()} Law Pilot. All rights reserved.
        </Typography> */}
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          sx={{
            width: '100%',
            backgroundColor: theme.palette.error.light,
            color: theme.palette.error.dark
          }}
        >
          Invalid email or password. Please try again.
        </Alert>
      </Snackbar>
    </Container>
  );
}