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
  IconButton
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
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

    // If user enters "Anusha", authenticate directly as ADMIN
    if (trimmedEmail === "Anusha" && trimmedPassword === "Anusha") {
      role = "ADMIN";

      localStorage.setItem("email", trimmedEmail);
      localStorage.setItem("role", role);
      localStorage.removeItem("firmId"); 

      navigate("/dashboardv2", {
        state: { inputValue: trimmedEmail, role },
      });
      return;
    }

    // Ensure both fields are filled for non-"Anusha" cases
    if (!emailRegex.test(trimmedEmail) || trimmedPassword === "") {
      setError(true);
      setSnackbarOpen(true);
      return;
    }

    // API Call to authenticate email and password
    // ...
try {
  const loginResponse = await axios.post("http://23.23.199.217:8080/api/login", {
    email: trimmedEmail,
    password: trimmedPassword,
  });

  // 1) Check if the server says we need a code
  if (loginResponse.data === "PASSWORD_OK_NEED_CODE") {
    // This means the password is correct, 
    // but we have to prompt the user to enter the 4-digit code
    navigate("/verifyCode", {
      state: { email: trimmedEmail },
    });
    return;
  }

  // 2) If we get a direct object with "firm", 
  //    that means no 2-step is needed (maybe for an admin or "Anusha"?)
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

  // 3) If no success or recognized response => show error
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
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={2} sx={{ width: '100%', p: { xs: 3, sm: 4 }, borderRadius: 3, backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 500, textAlign: 'center', color: '#1976d2' }}>Login</Typography>

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
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' } }}
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
            sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff' } }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            sx={{ py: 1.8, borderRadius: 2, textTransform: 'none', fontSize: '1.1rem', fontWeight: 500, backgroundColor: '#1976d2' }}
          >
            Login
          </Button>
        </Paper>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="error" sx={{ width: '100%', backgroundColor: theme.palette.error.light, color: theme.palette.error.dark }}>
          Invalid email or password. Please try again.
        </Alert>
      </Snackbar>
    </Container>
  );
}