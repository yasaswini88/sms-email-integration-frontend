import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Grid, Card, CardContent, Typography, Divider, Grid2, Avatar } from '@mui/material';
import CaseTypeMetric from './Metrics/CaseTypeMetric';
import CaseStatusMetric from './Metrics/CaseStatusMetric';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

export default function FirmDashboardMetrics({ firmId }) {
  const [lawyers, setLawyers] = useState([]);
  const [conversations, setConversations] = useState([]);
  
  // Existing counts
  const [totalLawyers, setTotalLawyers] = useState(0);
  const [totalConversations, setTotalConversations] = useState(0);
  const [smsCount, setSmsCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);

  // NEW: Client assignment counts
  const [lawyerClientCount, setLawyerClientCount] = useState({}); 
  const [totalClientsAssigned, setTotalClientsAssigned] = useState(0);

  useEffect(() => {
    if (firmId) {
      loadMetricsData();
    }
  }, [firmId]);

  const loadMetricsData = async () => {
    try {
      // 1) Fetch all lawyers for this firm
      const lawyerResp = await axios.get(
        `http://23.23.199.217:8080/api/firm-lawyers/firm/${firmId}`
      );
      setLawyers(lawyerResp.data);

      // 2) Fetch all conversations
      const convResp = await axios.get("http://23.23.199.217:8080/api/conversations");
      const allConversations = convResp.data;

      // 3) Filter for firm’s lawyers
      const lawyerIds = lawyerResp.data.map(l => l.lawyerId);
      const firmConvos = allConversations.filter(c =>
        c.assignedLawyerId && lawyerIds.includes(c.assignedLawyerId)
      );
      setConversations(firmConvos);

      // 4) Calculate metrics
      calculateMetrics(lawyerResp.data, firmConvos);
    } catch (error) {
      console.error("Error loading metrics data:", error);
    }
  };

  const calculateMetrics = (lawyerList, convos) => {
    // --- Existing metrics ---
    setTotalLawyers(lawyerList.length);
    setTotalConversations(convos.length);

    const sms = convos.filter(c => c.channel === "SMS").length;
    const email = convos.filter(c => c.channel === "EMAIL").length;
    setSmsCount(sms);
    setEmailCount(email);

    // --- NEW: Count how many unique clients are assigned per lawyer ---
    const clientsPerLawyer = {};
    const allClientsInFirm = new Set();

    convos.forEach(convo => {
      // E.g. phoneNumber identifies the client
      const phone = convo.phoneNumber;
      const lwId = convo.assignedLawyerId;

      if (!clientsPerLawyer[lwId]) {
        clientsPerLawyer[lwId] = new Set();
      }
      clientsPerLawyer[lwId].add(phone);

      // Keep track for total distinct clients for the entire firm
      allClientsInFirm.add(phone);
    });

    // Convert each Set to a count
    const lawyerCountMap = {};
    Object.entries(clientsPerLawyer).forEach(([lwId, phoneSet]) => {
      lawyerCountMap[lwId] = phoneSet.size;
    });

    setLawyerClientCount(lawyerCountMap);
    setTotalClientsAssigned(allClientsInFirm.size);
  };

  return (
    <Grid2 container spacing={2} flexGrow={1}>
        <Grid2 size={{ xs: 12, md: 8 }}>
            <CaseTypeMetric firmId={firmId} />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
            <CaseStatusMetric firmId={firmId} />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 12 }}>
            {/* <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Client Assignments
            </Typography>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2">Total Clients (Assigned)</Typography>
                <Typography variant="h4">{totalClientsAssigned}</Typography>
              </CardContent>
            </Card>
            <Grid2 container spacing={2}>
              {lawyers.map(lawyer => {
                const count = lawyerClientCount[lawyer.lawyerId] || 0;
                return (
                  <Grid2 item xs={12} sm={6} md={4} key={lawyer.lawyerId}>
                    <Card>
                      <CardContent>
                        <Avatar>{lawyer.lawyerName?.charAt(0)}</Avatar>
                        <Typography variant="subtitle1">{lawyer.lawyerName}</Typography>
                        <Typography color="text.secondary">{lawyer.lawyerMail}</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body1">
                          Clients Assigned: <strong>{count}</strong>
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid2>
                );
              })}
            </Grid2>
          </Box> */}
        

        </Grid2>
    </Grid2>
  );
}
