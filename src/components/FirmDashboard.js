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
import { Tabs, Tab } from "@mui/material";

import Papa from 'papaparse';

export default function FirmDashboard() {


    const role = localStorage.getItem("role");
    const firmId = localStorage.getItem("firmId") || "";
    const email = localStorage.getItem("email") || "";
    const lawyerId = localStorage.getItem("lawyerId") || "";

    const [selectedTab, setSelectedTab] = useState("ACTIVE");



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
    const [caseTypeDialogOpen, setCaseTypeDialogOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    // we will store the convo object or thread ID
    const [newCaseType, setNewCaseType] = useState("");


    // Load data function
    useEffect(() => {
        if (!firmId) return;
        loadData();       // we'll call it here
    }, [firmId]);

    // 1) Define loadData at the top-level inside your component:

    const loadCsvData = async () => {
        try {
            const response = await fetch("/lawyers.csv");
            const csvText = await response.text();
            const parsedResult = Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
            });

            // Get the logged-in user's firmId
            const userFirmId = localStorage.getItem("firmId") || "";

            // Filter lawyers based on the logged-in user's firmId
            const filteredLawyers = parsedResult.data.filter(
                (lawyer) => lawyer.firmId === userFirmId
            );

            setLawyers(filteredLawyers);
        } catch (error) {
            console.error("Error fetching or parsing CSV:", error);
        }
    };



    const loadData = async () => {
        try {
            // 1) Fetch CSV
            // const csvResponse = await fetch("/lawyers.csv");
            // const csvText = await csvResponse.text();
            // const parsedResult = Papa.parse(csvText, {
            //     header: true,
            //     skipEmptyLines: true,
            // });
            // setLawyers(parsedResult.data);

            const lawyerResp = await axios.get(`http://23.23.199.217:8080/api/firm-lawyers/firm/${firmId}`);
            setLawyers(lawyerResp.data);

            // 2) Fetch firm name
            const firmResp = await axios.get(
                `http://23.23.199.217:8080/api/customers/${firmId}`
            );
            setFirmName(firmResp.data.custName);

            // 3) Fetch conversations
            // const convResp = await axios.get("http://23.23.199.217:8080/api/conversations");
            const convResp = await axios.get(`http://23.23.199.217:8080/api/conversations/firm/${firmId}`);
            const allConversations = convResp.data;

            // 4) Filter by the CSV’s lawyer emails
            // const firmLawyerEmails = parsedResult.data.map((l) => l.lawyerMail);
            // const filtered = allConversations.filter((convo) =>
            //     firmLawyerEmails.includes(convo.email)
            // );



            // 5) Show only ACTIVE
            // const activeOnly = filtered.filter((convo) => convo.status === "ACTIVE");

            // // 6) Group & set state
            // const grouped = activeOnly.reduce((acc, convo) => {
            //     if (!acc[convo.conversationThreadId]) acc[convo.conversationThreadId] = [];
            //     acc[convo.conversationThreadId].push(convo);
            //     return acc;
            // }, {});
            // setGroupedConversations(grouped);

            // const latestConversations = Object.values(grouped).map((msgs) =>
            //     msgs.reduce((latest, msg) =>
            //         new Date(latest.timestamp) > new Date(msg.timestamp) ? latest : msg
            //     )
            // );
            // setConversations(latestConversations);

            // const grouped = filtered.reduce((acc, convo) => {
            //     if (!acc[convo.conversationThreadId]) acc[convo.conversationThreadId] = [];
            //     acc[convo.conversationThreadId].push(convo);
            //     return acc;
            // }, {});


   // 4) Group / set state with the full conversation list
  const grouped = allConversations.reduce((acc, c) => {
    if (!acc[c.conversationThreadId]) acc[c.conversationThreadId] = [];
    acc[c.conversationThreadId].push(c);
       return acc;
  }, {});

            // Store all grouped conversations
            setGroupedConversations(grouped);


            const latestConversations = Object.values(grouped).map((msgs) =>
                msgs.reduce((latest, msg) =>
                    new Date(latest.timestamp) > new Date(msg.timestamp) ? latest : msg
                )
            );
            setConversations(latestConversations);



        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    useEffect(() => {
        if (!firmId) return;
        loadData();
    }, [firmId]);



    useEffect(() => {
        if (!firmId) return;
        loadData(); // calls our top-level loadData
        loadCsvData();
    }, [firmId]);


    let finalConversations = conversations;

    // if (role === "LAWYER") {
    //     const numericlawyereId = parseInt(lawyerId, 10);
    //     finalConversations = finalConversations.filter(
    //         (convo) => {
    //             const matchLawyer = (convo.assignedLawyerId === numericlawyereId);
    //             const matchStatus = (convo.status === "ACTIVE" || convo.status === "RESOLVED");
    //             return matchLawyer && matchStatus;


    //         }
    //     );

    // }

    // if (role === "LAWYER") {
    //     const numericlawyerId = parseInt(lawyerId, 10);
    //     finalConversations = conversations.filter(
    //         (convo) => convo.assignedLawyerId === numericlawyerId && convo.status === selectedTab
    //     );
    // } else {
    //     // If role is not LAWYER, show all conversations for the firm
    //     finalConversations = conversations.filter(
    //         (c) => c.status === selectedTab
    //     );
    // }

    if (role === "LAWYER") {
        const numericlawyerId = parseInt(lawyerId, 10);
        finalConversations = conversations.filter(
            (convo) => convo.assignedLawyerId === numericlawyerId && convo.status === selectedTab
        );
    } else {
        // Ensure firm users see correctly grouped and filtered conversations
        finalConversations = Object.values(groupedConversations)
            .map((msgs) => {
                // Ensure we always get the latest message per thread
                return msgs.reduce((latest, msg) =>
                    new Date(latest.timestamp) > new Date(msg.timestamp) ? latest : msg
                );
            })
            .filter((convo) => convo.status === selectedTab); // Correctly filter based on the selected tab
    }



    // finalConversations = conversations.filter(
    //     (c) => c.status === selectedTab
    // );


    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

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

    function handleOpenCaseTypeDialog(convo) {
        setSelectedCase(convo);
        setNewCaseType(convo.caseType || "UnKnown");
        setCaseTypeDialogOpen(true);
    }

    function handleCloseCaseTypeDialog() {
        setCaseTypeDialogOpen(false);
        setSelectedCase(null);
        setNewCaseType("");
    }


    const CASE_TYPES = ["Personal Injury", "Family Law", "Criminal", "Employment"];

    async function handleSaveCaseType() {
        if (!selectedCase) return;
        try {
            // call our new backend endpoint
            await axios.put(
                `http://23.23.199.217:8080/api/conversations/thread/${selectedCase.conversationThreadId}/caseType`,
                {
                    caseType: newCaseType
                }
            );
            // close dialog
            setCaseTypeDialogOpen(false);
            setSelectedCase(null);

            // reload data or update local state
            loadData();

        } catch (err) {
            console.error("Error updating case type: ", err);
        }
    }


    return (
        <Container maxWidth="xl" sx={{ py: 2 }}>

            {/* <FirmDashboardMetrics firmId={firmId} /> */}




            {/* Lawyers Section */}
            {(role === "LAWYER" || role === "FIRM") && (
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ mb: 6, display: "flex", alignItems: "center", gap: 2 }}>
                        <PersonIcon color="primary" />
                        <Typography variant="h5" sx={{
                            fontWeight: 600,
                            color: '#1976d2',
                            textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
                        }}>
                            Name of the Firm:
                        </Typography>
                        <Typography variant="h6" sx={{
                            fontWeight: 500, color: '#1976d2',
                            textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
                        }}>
                            {firmName || "Loading..."}
                        </Typography>
                    </Box>

                    <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                        {/* <TableCell sx={{ fontWeight: 600 }}>Lawyer Name</TableCell> */}
                                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {lawyers.map((lawyer) => (
                                        <TableRow key={lawyer.lawyerId} hover>
                                            {/* <TableCell>{lawyer.lawyerName}</TableCell> */}
                                            <TableCell>{lawyer.lawyerMail}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            )}

            {/* Conversations Section */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    // If you want them to line up horizontally:
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab label="Active" value="ACTIVE" />
                    {/* <Tab label="Resolved" value="RESOLVED" /> */}
                </Tabs>
            </Box>
            <Box sx={{ mb: 4 }}>
                <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <MessageIcon color="primary" />
                    <Typography variant="h5" sx={{
                        fontWeight: 600,
                        color: '#1976d2',
                        textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
                    }}>
                        Conversations Between Lawyers and Clients
                    </Typography>
                    {/* <Chip
                        label={conversations.length}
                        size="small"
                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                    /> */}
                </Box>

                {role === "LAWYER" && (

                    <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                        <TableCell sx={{ fontWeight: 600 }}>Client Phone Number</TableCell>
                                        {/* <TableCell sx={{ fontWeight: 600 }}>Case Type</TableCell> */}
                                        <TableCell sx={{ fontWeight: 600 }}>Assigned Lawyer Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Assigned Lawyer Email</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>

                                        {/* Only show Actions column if the role is LAWYER */}
                                        {role === "LAWYER" && <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {finalConversations.map((convo) => (
                                        <TableRow key={convo.id} hover>
                                            <TableCell>{convo.phoneNumber}</TableCell>

                                            {/* <TableCell>
                                                {convo.caseType}{" "}
                                                <Button
                                                    variant="CONTAINED"
                                                    size="small"
                                                    onClick={() => handleOpenCaseTypeDialog(convo)}
                                                >
                                                    Change
                                                </Button>
                                            </TableCell> */}

                                            <TableCell>{convo.assignedLawyerName || "Not Assigned"}</TableCell>
                                            <TableCell>{convo.email || "N/A"}</TableCell>
                                            <TableCell>{convo.status}</TableCell>

                                            {role === "LAWYER" && (
                                                <TableCell>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => handleViewThread(convo.threadId)}
                                                    >
                                                        View
                                                    </Button>

                                                    {/* <Button
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ ml: 1 }}
                                                        onClick={() => handleOpenAssignDialog(convo.conversationThreadId)}
                                                        disabled={Boolean(convo.assignedLawyerId)}
                                                    >
                                                        Assign
                                                    </Button> */}
                                                    {/* 
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        sx={{
                                                            ml: 1,
                                                            borderRadius: 2,
                                                            textTransform: "none",
                                                            fontWeight: 600,
                                                            padding: "4px 12px",
                                                            "&:hover": {
                                                                backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                                                                transform: "scale(1.02)",
                                                                transition: "transform 0.2s ease-in-out"
                                                            },
                                                            "&:active": {
                                                                transform: "scale(0.98)"
                                                            }
                                                        }}
                                                        onClick={() => handleResolveClick(convo.conversationThreadId)}
                                                    >
                                                        Resolve
                                                    </Button> */}
                                                    {convo.status !== "RESOLVED" && (
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            size="small"
                                                            sx={{
                                                                ml: 1,
                                                                borderRadius: 2,
                                                                textTransform: "none",
                                                                fontWeight: 600,
                                                                padding: "4px 12px",
                                                                "&:hover": {
                                                                    backgroundColor: (theme) =>
                                                                        alpha(theme.palette.error.main, 0.1),
                                                                    transform: "scale(1.02)",
                                                                    transition: "transform 0.2s ease-in-out"
                                                                },
                                                                "&:active": {
                                                                    transform: "scale(0.98)"
                                                                }
                                                            }}
                                                            onClick={() => handleResolveClick(convo.conversationThreadId)}
                                                        >
                                                            Resolve
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>

                            </Table>
                        </TableContainer>
                    </Paper>
                )}

                {role === "FIRM" && (
                    <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                        <TableCell sx={{ fontWeight: 600 }}>Client Phone Number</TableCell>
                                        {/* <TableCell sx={{ fontWeight: 600 }}>Case Type</TableCell> */}
                                        {/* <TableCell sx={{ fontWeight: 600 }}>Assigned Lawyer Name</TableCell> */}
                                        <TableCell sx={{ fontWeight: 600 }}>Assigned Lawyer Email</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {finalConversations.map((convo) => (
                                        <TableRow key={convo.id} hover>
                                            {/* 1) Client Phone */}
                                            <TableCell>{convo.phoneNumber}</TableCell>


                                            {/* <TableCell>
                                                {convo.caseType}{" "}
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    onClick={() => handleOpenCaseTypeDialog(convo)}
                                                >
                                                    Change
                                                </Button>
                                            </TableCell> */}

                                            {/* 2) Assigned Lawyer Name */}
                                            {/* <TableCell>{convo.assignedLawyerName || "Not Assigned"}</TableCell> */}

                                            {/* 3) Assigned Lawyer Email */}
                                            <TableCell>{convo.email || "N/A"}</TableCell>

                                            {/* 4) Status */}
                                            <TableCell>{convo.status}</TableCell>

                                            {/* 5) Actions: same as your old code (View, Assign, Resolve) */}
                                            <TableCell>
                                                {/* <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleViewThread(convo.threadId)}
                                                >
                                                    View
                                                </Button> */}

                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{ ml: 1 }}
                                                    onClick={() =>
                                                        handleOpenAssignDialog(convo.conversationThreadId)
                                                    }
                                                    disabled={Boolean(convo.assignedLawyerId)}
                                                >
                                                    Assign
                                                </Button>

                                                {/* <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    sx={{
                                                        ml: 1,
                                                        borderRadius: 2,
                                                        textTransform: "none",
                                                        fontWeight: 600,
                                                        padding: "4px 12px",
                                                        "&:hover": {
                                                            backgroundColor: (theme) =>
                                                                alpha(theme.palette.error.main, 0.1),
                                                            transform: "scale(1.02)",
                                                            transition: "transform 0.2s ease-in-out"
                                                        },
                                                        "&:active": {
                                                            transform: "scale(0.98)"
                                                        }
                                                    }}
                                                    onClick={() =>
                                                        handleResolveClick(convo.conversationThreadId)
                                                    }
                                                >
                                                    Resolve
                                                </Button> */}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
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
                            {lawyer.lawyerMail}
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


            <Dialog
                open={caseTypeDialogOpen}
                onClose={handleCloseCaseTypeDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Change Case Type</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Select a new case type for this conversation:
                    </Typography>
                    <Select
                        value={newCaseType}
                        onChange={(e) => setNewCaseType(e.target.value)}
                        fullWidth
                    >
                        {CASE_TYPES.map((ct) => (
                            <MenuItem key={ct} value={ct}>
                                {ct}
                            </MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCaseTypeDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveCaseType}>
                        Save
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
