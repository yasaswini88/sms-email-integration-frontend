import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Box, Paper, TextField, Typography, Button } from "@mui/material";

export default function VerifyCode() {
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [codeExpired, setCodeExpired] = useState(false); // NEW state

  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};

  const handleVerify = async () => {
    try {
      const response = await axios.post("http://23.23.199.217:8080/api/login/verifyCode", {
        email,
        code,
      });

      if (response.data && response.data.firm) {
        // On success, store in localStorage
        const firmId = response.data.firm.custi_id;
        const lawyerRole = response.data.lawyerRole;
        const lawyerId = response.data.lawyerId;

        localStorage.setItem("email", response.data.lawyerMail);
        localStorage.setItem("role", lawyerRole);
        localStorage.setItem("firmId", firmId);
        localStorage.setItem("lawyerId", lawyerId);

        // Navigate to your dashboard
        navigate("/FirmDashboard", {
          state: {
            inputValue: response.data.lawyerMail,
            role: lawyerRole,
            firmId: firmId,
            lawyerRole: lawyerRole,
          },
        });
      } else {
        setErrorMessage("Invalid response from server.");
      }
    } catch (err) {
      console.error("Error verifying code:", err);
      if (err.response && err.response.data) {
        const msg = err.response.data;
        setErrorMessage(msg);

        // If message is "Code expired", set codeExpired = true
        if (msg === "Code expired") {
          setCodeExpired(true);
        }
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    }
  };

  const handleResend = async () => {
    try {
      await axios.post("http://23.23.199.217:8080/api/login/resendCode", { email });
      setInfoMessage("A new code has been sent to your email.");
      setErrorMessage(null); 
      setCodeExpired(false); // reset codeExpired, so user can verify again
    } catch (err) {
      console.error("Error resending code:", err);
      setInfoMessage(null);
      if (err.response && err.response.data) {
        setErrorMessage(err.response.data);
      } else {
        setErrorMessage("An unknown error occurred while resending code.");
      }
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h5" gutterBottom>
            Enter Your 4-Digit Code
          </Typography>

          <TextField
            label="Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            fullWidth
          />

          {/* Error or info messages */}
          {errorMessage && (
            <Typography color="error" sx={{ mb: 1 }}>
              {errorMessage}
            </Typography>
          )}
          {infoMessage && (
            <Typography color="primary" sx={{ mb: 1 }}>
              {infoMessage}
            </Typography>
          )}

          {/* 1) If the code is expired, show Verify button as disabled (or hide entirely) */}
          <Button 
            variant="contained" 
            onClick={handleVerify} 
            sx={{ mb: 2 }}
            disabled={codeExpired} // DISABLE if code is expired
          >
            Verify
          </Button>

          {/* 2) Only show the Resend button if code is expired */}
          {codeExpired && (
            <Button variant="outlined" onClick={handleResend}>
              Resend code
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
