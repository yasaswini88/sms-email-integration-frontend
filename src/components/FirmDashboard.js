import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Box,
    alpha,
    useTheme,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
} from "@mui/material";
import { Person as PersonIcon, Message as MessageIcon } from "@mui/icons-material";
import moment from "moment";
import ConversationDialog from "./ConversationDialog";
import FirmDashboardMetrics from './FirmDashboardMetrics';

import Papa from 'papaparse';
export default function FirmDashboard() {
    const { state } = useLocation();
    const { firmId, role, inputValue } = state || {};
    const theme = useTheme();

    const [lawyers, setLawyers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [groupedConversations, setGroupedConversations] = useState({});
    const [selectedThreadId, setSelectedThreadId] = useState(null);
    const [threadDialogOpen, setThreadDialogOpen] = useState(false);
    const [firmName, setFirmName] = useState("");
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [assignee, setAssignee] = useState("");
    const [selectedThread, setSelectedThread] = useState(null);

    // Load data function
    useEffect(() => {
        if (!firmId) return;
        loadData();       // we'll call it here
    }, [firmId]);

    // 1) Define loadData at the top-level inside your component:
    const loadData = async () => {
        try {
            // Fetch firm name
            const firmResp = await axios.get(
                `http://23.23.199.217:8080/api/customers/${firmId}`
            );
            setFirmName(firmResp.data.custName);

            // Fetch lawyers
            const lawyerResp = await axios.get(
                `http://23.23.199.217:8080/api/customers/${firmId}/lawyers`
            );
            setLawyers(lawyerResp.data);

            // Fetch all conversations
            // Fetch all conversations
            const convResp = await axios.get("http://23.23.199.217:8080/api/conversations");
            const allConversations = convResp.data;

            // Filter for this firm's lawyers
            const firmLawyerEmails = lawyerResp.data.map((l) => l.lawyerMail);
            const filtered = allConversations.filter((convo) =>
                firmLawyerEmails.includes(convo.email)
            );

            // NEW: Filter out any conversations whose thread status is "INACTIVE"
            const activeOnly = filtered.filter((convo) => convo.status === "ACTIVE");

            // Group messages by conversationThreadId
            const grouped = activeOnly.reduce((acc, convo) => {
                if (!acc[convo.conversationThreadId]) acc[convo.conversationThreadId] = [];
                acc[convo.conversationThreadId].push(convo);
                return acc;
            }, {});
            setGroupedConversations(grouped);

            // Store the latest conversation per thread
            const latestConversations = Object.values(grouped).map((msgs) =>
                msgs.reduce((latest, msg) =>
                    new Date(latest.timestamp) > new Date(msg.timestamp) ? latest : msg
                )
            );
            setConversations(latestConversations);

        } catch (error) {
            console.error("Error loading firm data:", error);
        }
    };

    useEffect(() => {
        if (!firmId) return;
        loadData(); // calls our top-level loadData
    }, [firmId]);

    const handleViewThread = (threadId) => {
        setSelectedThreadId(threadId);
        setThreadDialogOpen(true);
    };

    const handleCloseThreadDialog = () => {
        setThreadDialogOpen(false);
        setSelectedThreadId(null);
    };

    const handleOpenAssignDialog = (threadId) => {
        setSelectedThread(threadId);
        setAssignDialogOpen(true);
    };

    const handleCloseAssignDialog = () => {
        setAssignDialogOpen(false);
        setSelectedThread(null);
    };

    const handleAssign = async (lawyerId, threadId) => {
        if (!lawyerId || !threadId) return;

        try {
            await axios.put(
                `http://23.23.199.217:8080/api/customers/assign/thread/${lawyerId}/${threadId}`
            );
            setAssignDialogOpen(false);
            loadData(); // Reload data after assigning
        } catch (error) {
            console.error("Error assigning conversation:", error);
        }
    };

    const handleResolveClick = async (threadId) => {
        try {
            // Make a PUT request to your new backend endpoint
            await axios.put(`http://23.23.199.217:8080/api/conversations/thread/${threadId}/resolve`);

            loadData();
        } catch (error) {
            console.error("Error marking thread resolved:", error);
        }
    };


    return (
        <Container maxWidth="xl" sx={{ py: 2 }}>

            <FirmDashboardMetrics firmId={firmId} />

            {/* Lawyers Section */}
            <Box sx={{ mb: 6 }}>
                <Box sx={{ mb: 6, display: "flex", alignItems: "center", gap: 2 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Name of the Firm:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        {firmName || "Loading..."}
                    </Typography>
                </Box>

                <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Lawyer Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lawyers.map((lawyer) => (
                                    <TableRow key={lawyer.lawyerId} hover>
                                        <TableCell>{lawyer.lawyerName}</TableCell>
                                        <TableCell>{lawyer.lawyerMail}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            {/* Conversations Section */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <MessageIcon color="primary" />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Conversations Between Lawyers and Clients
                    </Typography>
                    <Chip
                        label={conversations.length}
                        size="small"
                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                    />
                </Box>

                <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Thread ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Latest Message</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {conversations.map((convo) => (
                                    <TableRow key={convo.threadId} hover>
                                        <TableCell>{convo.threadId}</TableCell>
                                        <TableCell>{convo.message}</TableCell>
                                        <TableCell>
                                            {moment
                                                .utc(convo.timestamp)
                                                .local()
                                                .format("MMM-DD-YYYY hh:mm A")}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleViewThread(convo.threadId)}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                sx={{ ml: 1 }}
                                                onClick={() => handleOpenAssignDialog(convo.conversationThreadId)}
                                                disabled={Boolean(convo.assignedLawyerId)}
                                            >
                                                Assign
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                sx={{
                                                    ml: 1,
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    padding: '4px 12px',
                                                    '&:hover': {
                                                        backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                                                        transform: 'scale(1.02)',
                                                        transition: 'transform 0.2s ease-in-out'
                                                    },
                                                    '&:active': {
                                                        transform: 'scale(0.98)'
                                                    }
                                                }}
                                                onClick={() => handleResolveClick(convo.conversationThreadId)}
                                            >
                                                Resolve
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            {convo.assignedLawyerName ? convo.assignedLawyerName : 'Not Assigned'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            {/* Assign Dialog */}
            <Dialog
                open={assignDialogOpen}
                onClose={handleCloseAssignDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Assign Thread</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Select a lawyer to assign the thread:
                    </Typography>
                    <Select
                        value={assignee}
                        onChange={(e) => setAssignee(e.target.value)}
                        fullWidth
                    >
                        {lawyers.map((lawyer) => (
                            <MenuItem key={lawyer.lawyerId} value={lawyer.lawyerId}>
                                {lawyer.lawyerName}
                            </MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAssignDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => handleAssign(assignee, selectedThread)}
                        disabled={!assignee}
                    >
                        Assign
                    </Button>
                </DialogActions>
            </Dialog>



            {/* Thread Dialog */}
            <ConversationDialog
                open={threadDialogOpen}
                onClose={handleCloseThreadDialog}
                threadId={selectedThreadId}
            />
        </Container>
    );
}
