import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!/^\+?[1-9]\d{9,14}$/.test(phoneNumber)) {
      setError(true);
      setSnackbarOpen(true);
      return;
    }

    // Simulate successful login
    console.log("Login successful with phone number:", phoneNumber);
    navigate("/dashboard", { state: { phoneNumber } });
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          Login
        </Typography>

        <TextField
          fullWidth
          label="Phone Number"
          variant="outlined"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          error={error}
          helperText={error ? "Enter a valid phone number" : ""}
          sx={{ mb: 2 }}
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleLogin}
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </Paper>

      {/* Snackbar for error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error">Invalid phone number. Please try again.</Alert>
      </Snackbar>
    </Container>
  );
}
