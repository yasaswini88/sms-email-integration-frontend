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
  useTheme
} from "@mui/material";
import axios from "axios";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = async () => {
    let role = "";
    const trimmedValue = phoneNumber.trim();

    if (trimmedValue === "Anusha") {
      role = "ADMIN";
      navigate("/dashboard", {
        state: { inputValue: trimmedValue, role },
      });
      return;
    }

    if (phoneRegex.test(trimmedValue)) {
      role = "CLIENT";
      navigate("/dashboard", {
        state: { inputValue: trimmedValue, role },
      });
      return;
    }

    if (emailRegex.test(trimmedValue)) {
      try {
        const loginResponse = await axios.post("http://23.23.199.217:8080/api/login", {
          email: trimmedValue,
        });

        if (loginResponse.data && loginResponse.data.firm) {
          const firmId = loginResponse.data.firm.custi_id;
          role = "FIRM";
          navigate("/FirmDashboard", {
            state: {
              inputValue: trimmedValue,
              role,
              firmId: firmId,
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
      return;
    }

    setError(true);
    setSnackbarOpen(true);
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
            label="Phone Number or Email or 'Anusha'"
            variant="outlined"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setError(false);
            }}
            onKeyPress={handleKeyPress}
            error={error}
            helperText={error ? "Enter a valid phone number, email, or 'Anusha'" : ""}
            sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#fff', '&:hover fieldset': { borderColor: '#1976d2' }, '&.Mui-focused fieldset': { borderColor: '#1976d2' } } }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            sx={{ py: 1.8, borderRadius: 2, textTransform: 'none', fontSize: '1.1rem', fontWeight: 500, backgroundColor: '#1976d2', boxShadow: '0 3px 10px rgba(25, 118, 210, 0.25)', transition: 'all 0.2s ease-in-out', '&:hover': { backgroundColor: '#1565c0', boxShadow: '0 6px 15px rgba(25, 118, 210, 0.35)', transform: 'translateY(-1px)' }, '&:active': { transform: 'translateY(1px)', boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)' } }}
          >
            Login
          </Button>
        </Paper>
      </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="error" sx={{ width: '100%', alignItems: 'center', backgroundColor: theme.palette.error.light, color: theme.palette.error.dark, '& .MuiAlert-icon': { color: theme.palette.error.dark } }}>
          Invalid input. Please try again.
        </Alert>
      </Snackbar>
    </Container>
  );
}
