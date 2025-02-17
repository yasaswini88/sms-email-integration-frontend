import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Paper, Box, Chip, IconButton,
  useTheme, alpha, Snackbar, Alert,
  Select,
  MenuItem,
  Link,
  Divider,
  Avatar,
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import Papa from 'papaparse';

import 'moment-timezone';
import { Search as SearchIcon } from '@mui/icons-material';





export default function Dashboardv2() {
  const theme = useTheme();

  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  const inputValue = localStorage.getItem("email") || "";
  const [selectedFile, setSelectedFile] = useState(null);

  const [selectedFirm, setSelectedFirm] = useState(null);


  // State management
  const [customers, setCustomers] = useState([]);
  const [lawyers, setLawyers] = useState([]);

  const [open, setOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    custMail: '',
    custName: '',
    twilioNumber: '',
    firmAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // For “Add Customer” CSV
  const [csvFile, setCsvFile] = useState(null);

  // For editing a customer
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState({
    custiId: null,
    custMail: '',
    custName: '',
    twilioNumber: '',
    firmAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // For deleting a customer
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // For adding a lawyer to a firm
  const [addLawyerDialogOpen, setAddLawyerDialogOpen] = useState(false);
  const [lawyerForm, setLawyerForm] = useState({
    lawyerName: '',
    lawyerMail: ''
  });
  const [selectedCustomerForLawyer, setSelectedCustomerForLawyer] = useState(null);

  // For showing the list of lawyers in a firm
  const [firmLawyersDialogOpen, setFirmLawyersDialogOpen] = useState(false);
  const [selectedFirmLawyers, setSelectedFirmLawyers] = useState([]);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Loading
  const [isLoading, setIsLoading] = useState(false);

  // ------------- NEW STATES FOR MESSAGES/EMAILS -------------
  const [selectedTab, setSelectedTab] = useState('messages'); // "messages" or "emails"
  const [messages, setMessages] = useState([]);
  const [emails, setEmails] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  // ----------------------------------------------------------

  useEffect(() => {
    fetchCustomers();
    fetchLawyers();
    fetchMessages();
    fetchEmails();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://23.23.199.217:8080/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLawyers = async () => {
    setIsLoading(true);
    try {

      const response = await axios.get('http://23.23.199.217:8080/api/customers/1/lawyers');
      setLawyers(response.data);
      console.log("Lawyers", response.data);
    } catch (error) {
      console.error('Error fetching lawyers', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW: fetch messages in descending order
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://23.23.199.217:8080/api/messages/descending');
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW: fetch emails in descending order
  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://23.23.199.217:8080/api/descending');
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // CSV import (bulk-insert)
  const importCsv = (event, selectedCustiId) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target.result;
        const parsedResult = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });

        console.log("Parsed CSV Data:", parsedResult.data);

        axios.post(
          `http://23.23.199.217:8080/api/firm-lawyers/bulk-insert?custiId=${selectedCustiId}`,
          parsedResult.data
        )
          .then(response => {
            console.log("Response from POST:", response.data);
            setSnackbarMessage("CSV file uploaded successfully!");
            setSnackbarOpen(true);
          })
          .catch(error => {
            console.error("Error importing CSV:", error);
            setSnackbarMessage("Error uploading CSV file. Please try again.");
            setSnackbarOpen(true);
          });
      };
      reader.readAsText(file);
    }
  };

  const handleCSVFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]); // store the single CSV file
    }
  };

  // --------------- CUSTOMERS (FIRMS) SECTION ---------------
  let filteredCustomers = [...customers];
  if (role === 'FIRM' && inputValue) {
    filteredCustomers = customers.filter(c => c.custMail === inputValue);
  }

  // 1) Open "Add Customer" dialog
  const handleOpenDialog = () => setOpen(true);
  const handleCloseDialog = () => setOpen(false);

  // 2) Track form inputs for new Customer
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 3) Actually add the Customer
  const handleAddCustomer = async () => {
    try {
      // CREATE the new customer (firm)
      const createResponse = await axios.post(
        'http://23.23.199.217:8080/api/customers',
        newCustomer
      );
      const createdFirm = createResponse.data; // This is your CustomerDto

      // Clear out the form
      setNewCustomer({
        custMail: '',
        custName: '',
        twilioNumber: '',
        firmAddress: '',
        city: '',
        state: '',
        zipCode: ''
      });

      // If user selected a CSV, parse and do a bulk insert
      if (csvFile) {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          const csvText = e.target.result;
          // parse with Papa
          const parsedResult = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
          });
          // Now call your bulk-insert endpoint
          axios.post(
            `http://23.23.199.217:8080/api/firm-lawyers/bulk-insert?custiId=${createdFirm.custiId}`,
            parsedResult.data
          )
            .then(response => {
              console.log("Bulk insert success:", response.data);
              setSnackbarMessage("Firm created and CSV uploaded successfully!");
              setSnackbarOpen(true);
            })
            .catch(error => {
              console.error("Error in bulk insert:", error);
              setSnackbarMessage("Firm created, but CSV failed to upload.");
              setSnackbarOpen(true);
            });
        };
        fileReader.readAsText(csvFile);
      } else {
        // No CSV file => just show success
        setSnackbarMessage("Firm created successfully (No CSV uploaded).");
        setSnackbarOpen(true);
      }

      // Close the dialog, refresh
      setOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
      if (error.response && error.response.status === 500) {
        setSnackbarMessage("Could not add customer. Twilio number may already be in use.");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage("Error adding customer.");
        setSnackbarOpen(true);
      }
    }
  };

  // --------------- ADD LAWYER ---------------
  const handleAddLawyerClick = (customer) => {
    setSelectedCustomerForLawyer(customer);
    setLawyerForm({ lawyerName: '', lawyerMail: '' });
    setAddLawyerDialogOpen(true);
  };

  const handleCreateLawyer = async () => {
    if (!selectedCustomerForLawyer) return;
    try {
      const custiId = selectedCustomerForLawyer.custiId;
      await axios.post(
        `http://23.23.199.217:8080/api/firm-lawyers/firm/${custiId}`,
        lawyerForm
      );
      setAddLawyerDialogOpen(false);
      // Optionally re-fetch lawyers
    } catch (error) {
      console.error('Error creating lawyer:', error);
      setSnackbarMessage("Error creating lawyer");
      setSnackbarOpen(true);
    }
  };

  // --------------- EDIT CUSTOMER ---------------
  const handleEditClick = (customer) => {
    setEditCustomer({
      custiId: customer.custiId,
      custMail: customer.custMail,
      custName: customer.custName,
      twilioNumber: customer.twilioNumber,
      firmAddress: customer.firmAddress,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode
    });
    setEditDialogOpen(true);
  };
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };
  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;
    setEditCustomer((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleUpdateCustomer = async () => {
    try {
      await axios.put(
        `http://23.23.199.217:8080/api/customers/${editCustomer.custiId}`,
        editCustomer
      );
      setEditDialogOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      if (error.response && error.response.status === 500) {
        setSnackbarMessage("Could not update customer. Twilio number may be in use.");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage("Error updating customer.");
        setSnackbarOpen(true);
      }
    }
  };

  // --------------- DELETE CUSTOMER ---------------
  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      await axios.delete(
        `http://23.23.199.217:8080/api/customers/${customerToDelete.custiId}`
      );
      setDeleteDialogOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  // --------------- VIEW FIRM'S LAWYERS ---------------
  const handleViewLawyers = async (customer) => {
    try {
      const response = await axios.get(
        `http://23.23.199.217:8080/api/firm-lawyers/firm/${customer.custiId}`
      );
      setSelectedFirmLawyers(response.data);
      setFirmLawyersDialogOpen(true);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    }
  };

  // --------------- TABS HANDLING ---------------
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Helper to find the firm name by matching phoneNumber or custiId
  const getFirmNameByTwilio = (twilioNum) => {
    const match = customers.find(c => c.twilioNumber === twilioNum);
    return match ? match.custName : 'Unknown';
  };
  const getFirmNameByCustId = (custiId) => {
    const match = customers.find(c => c.custiId === custiId);
    return match ? match.custName : 'Unknown';
  };

  // --------------- SNACKBAR ---------------
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };



  const filteredMessages = messages.filter(msg => {
    const firmName = getFirmNameByTwilio(msg.toNumber);
    const lowerSearch = searchTerm.toLowerCase();

    return (
      (!selectedFirm || firmName === selectedFirm) &&  // Filter by selected firm
      (msg.fromNumber.toLowerCase().includes(lowerSearch) ||
        msg.toNumber.toLowerCase().includes(lowerSearch) ||
        firmName.toLowerCase().includes(lowerSearch))
    );
  });

  const filteredEmails = emails.filter(em => {
    const firmName = getFirmNameByCustId(em.custiId);
    const lowerSearch = searchTerm.toLowerCase();

    return (
      (!selectedFirm || firmName === selectedFirm) &&  // Filter by selected firm
      (em.clientPhoneNumber.toLowerCase().includes(lowerSearch) ||
        (em.lawyerEmail && em.lawyerEmail.toLowerCase().includes(lowerSearch)) ||
        firmName.toLowerCase().includes(lowerSearch))
    );
  });




  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* ------------------- LAW FIRMS SECTION ------------------- */}
      {role !== 'CLIENT' && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              <Typography variant="h5" sx={{
                fontWeight: 600,
                color: '#1976d2',
                textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
              }}>
                Law Firms
              </Typography>
              <Chip
                label={filteredCustomers.length}
                size="small"
                sx={{ ml: 1, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{ borderRadius: 2 }}
            >
              Add Firm
            </Button>
          </Box>

          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Twilio Number</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.custiId} hover>
                      <TableCell
                        onClick={() => setSelectedFirm(customer.custName)}  // Set selected firm
                        sx={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }} // Make it look clickable
                      >
                        {customer.custName}
                      </TableCell>
                      <TableCell>{customer.twilioNumber}</TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleEditClick(customer)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="info" onClick={() => handleViewLawyers(customer)}>
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* --------------- TABS FOR MESSAGES/EMAILS --------------- */}
      <Box sx={{ mb: 4 }}>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
  onClick={() => setSelectedFirm(null)}
>
  <PersonIcon color="primary" />
  <Typography variant="h5" sx={{
    fontWeight: 600,
    color: selectedFirm ? '#ff5722' : '#1976d2', // Change color if filtered
    textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
  }}>
    {selectedFirm ? ` ${selectedFirm}` : 'Law Firms'}
  </Typography>
</Box>

        <Box
          sx={{
            mb: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Left: Tabs */}
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Messages" value="messages" />
            <Tab label="Emails" value="emails" />
          </Tabs>

          {/* Right: Search bar */}
          {/* Right: Search bar */}
          <TextField
            variant="outlined"
            size="small"
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by phone, email, or firm name"
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />
              ),
            }}
            sx={{
              width: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#64748b',
                  }
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2563eb',
                    borderWidth: '2px',
                  }
                }
              },
              '& .MuiInputLabel-root': {
                color: '#64748b',
                '&.Mui-focused': {
                  color: '#2563eb'
                }
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e2e8f0'
              }
            }}
          />
        </Box>

        {/* -- MESSAGES TABLE -- */}
        {selectedTab === 'messages' && (
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Client Phone Number</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>To Phone Number</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Firm Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMessages.map((msg) => {
                    const firmName = getFirmNameByTwilio(msg.toNumber);
                    return (
                      <TableRow key={msg.msgId} hover>
                        <TableCell>{msg.fromNumber}</TableCell>
                        <TableCell>{msg.toNumber}</TableCell>
                        <TableCell>{firmName}</TableCell>
                        <TableCell>
                          {moment(msg.receivedAt)
                            .tz("America/New_York")
                            .format("YYYY-MM-DD HH:mm:ss")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* -- EMAILS TABLE -- */}
        {selectedTab === 'emails' && (
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Client Phone Number</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Lawyer Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Firm Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmails.map((em) => {
                    const firmName = getFirmNameByCustId(em.custiId);
                    return (
                      <TableRow key={em.id}>
                        <TableCell>{em.clientPhoneNumber}</TableCell>
                        <TableCell>{em.lawyerEmail || 'N/A'}</TableCell>
                        <TableCell>{firmName}</TableCell>
                        <TableCell>
                          {moment(em.receivedAt)
                            .tz("America/New_York")
                            .format("YYYY-MM-DD HH:mm:ss")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>

      {/* =============== ADD FIRM (CUSTOMER) DIALOG =============== */}
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            bgcolor: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAddIcon sx={{ color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
              Add New Customer
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            size="small"
            sx={{
              color: '#64748b',
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 600,
                color: '#2c3e50',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <PersonIcon sx={{ fontSize: 20, color: '#1976d2' }} />
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Customer Email"
                    name="custMail"
                    value={newCustomer.custMail}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <EmailIcon sx={{ mr: 1, color: '#64748b' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Customer Name"
                    name="custName"
                    value={newCustomer.custName}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ mr: 1, color: '#64748b' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Address Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 600,
                color: '#2c3e50',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <LocationIcon sx={{ fontSize: 20, color: '#1976d2' }} />
                Address Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    name="firmAddress"
                    value={newCustomer.firmAddress}
                    onChange={handleChange}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="City"
                    name="city"
                    value={newCustomer.city}
                    onChange={handleChange}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="State"
                    name="state"
                    value={newCustomer.state}
                    onChange={handleChange}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Zip Code"
                    name="zipCode"
                    value={newCustomer.zipCode}
                    onChange={handleChange}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Contact Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 600,
                color: '#2c3e50',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <PhoneIcon sx={{ fontSize: 20, color: '#1976d2' }} />
                Contact Details
              </Typography>
              <Autocomplete
                disablePortal
                options={['+17575688750', '+17575551111', '+17579608924']}
                freeSolo={false}
                value={newCustomer.twilioNumber}
                onChange={(_, selectedValue) => {
                  setNewCustomer(prev => ({
                    ...prev,
                    twilioNumber: selectedValue || ''
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Twilio Number"
                    name="twilioNumber"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {/* File Upload Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 600,
                color: '#2c3e50',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <UploadIcon sx={{ fontSize: 20, color: '#1976d2' }} />
                Upload Documents
              </Typography>
              <Box
                sx={{
                  border: '2px dashed #e0e0e0',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: '#f8f9fa',
                  '&:hover': {
                    borderColor: '#1976d2',
                    bgcolor: '#f1f5f9'
                  }
                }}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVFileChange}
                  style={{ display: 'none' }}
                  id="csv-file-input"
                />
                <label htmlFor="csv-file-input">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    sx={{
                      textTransform: 'none',
                      color: '#64748b',
                      borderColor: '#64748b',
                      '&:hover': {
                        borderColor: '#1976d2',
                        color: '#1976d2'
                      }
                    }}
                  >
                    Upload CSV File
                  </Button>
                </label>
                <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
                  Supported format: .CSV
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                bgcolor: '#f1f5f9'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddCustomer}
            startIcon={<PersonAddIcon />}
            sx={{
              textTransform: 'none',
              bgcolor: '#1976d2',
              fontWeight: 500,
              px: 3,
              '&:hover': {
                bgcolor: '#1565c0'
              }
            }}
          >
            Add Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* =============== EDIT FIRM DIALOG =============== */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            bgcolor: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon sx={{ color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
              Edit Customer
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseEditDialog}
            size="small"
            sx={{
              color: '#64748b',
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 600,
                color: '#2c3e50',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <PersonIcon sx={{ fontSize: 20, color: '#1976d2' }} />
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Customer Email"
                    name="custMail"
                    value={editCustomer.custMail}
                    onChange={handleEditFieldChange}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <EmailIcon sx={{ mr: 1, color: '#64748b' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Customer Name"
                    name="custName"
                    value={editCustomer.custName}
                    onChange={handleEditFieldChange}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ mr: 1, color: '#64748b' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Address Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 600,
                color: '#2c3e50',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <LocationIcon sx={{ fontSize: 20, color: '#1976d2' }} />
                Address Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    name="firmAddress"
                    value={editCustomer.firmAddress}
                    onChange={handleEditFieldChange}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="City"
                    name="city"
                    value={editCustomer.city}
                    onChange={handleEditFieldChange}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="State"
                    name="state"
                    value={editCustomer.state}
                    onChange={handleEditFieldChange}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Zip Code"
                    name="zipCode"
                    value={editCustomer.zipCode}
                    onChange={handleEditFieldChange}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Contact Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 600,
                color: '#2c3e50',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <PhoneIcon sx={{ fontSize: 20, color: '#1976d2' }} />
                Contact Details
              </Typography>
              <Autocomplete
                disablePortal
                options={['+17575688750', '+17575551111', '+17579608924']}
                freeSolo={false}
                value={editCustomer.twilioNumber}
                onChange={(_, val) => {
                  setEditCustomer(prev => ({
                    ...prev,
                    twilioNumber: val || ''
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Twilio Number"
                    name="twilioNumber"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        }
                      }
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={handleCloseEditDialog}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                bgcolor: '#f1f5f9'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateCustomer}
            startIcon={<EditIcon />}
            sx={{
              textTransform: 'none',
              bgcolor: '#1976d2',
              fontWeight: 500,
              px: 3,
              '&:hover': {
                bgcolor: '#1565c0'
              }
            }}
          >
            Update Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* =============== DELETE CONFIRMATION DIALOG =============== */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this customer?
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* =============== FIRM LAWYERS DIALOG =============== */}
      <Dialog
        open={firmLawyersDialogOpen}
        onClose={() => setFirmLawyersDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2.5,
            bgcolor: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon sx={{ color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
              {selectedFirmLawyers?.[0]?.firm?.custName || 'Firm Details'}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setFirmLawyersDialogOpen(false)}
            size="small"
            sx={{
              color: '#64748b',
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedFirmLawyers.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4
              }}
            >
              <Typography
                sx={{
                  color: '#64748b',
                  fontWeight: 500,
                  textAlign: 'center'
                }}
              >
                No lawyers found for this firm.
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3,
                  p: 2,
                  bgcolor: '#f8f9fa',
                  borderRadius: 1
                }}
              >
                <EmailIcon sx={{ color: '#1976d2' }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 0.5 }}>
                    Firm Email
                  </Typography>
                  <Typography sx={{ color: '#1e293b', fontWeight: 500 }}>
                    {selectedFirmLawyers[0]?.firm?.custMail || 'Unknown'}
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: '#2c3e50',
                  mb: 2
                }}
              >
                Associated Lawyers
              </Typography>

              {selectedFirmLawyers.map((lawyer, index) => (
                <Box
                  key={lawyer.lawyerId}
                  sx={{
                    mb: index !== selectedFirmLawyers.length - 1 ? 2 : 0,
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      bgcolor: '#f8f9fa',
                      borderColor: '#1976d2',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#1976d2',
                        width: 40,
                        height: 40,
                      }}
                    >
                      {lawyer.lawyerMail?.charAt(0).toUpperCase() || 'L'}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: '#64748b', mb: 0.5 }}
                      >
                        Lawyer Email
                      </Typography>
                      <Typography sx={{ color: '#1e293b', fontWeight: 500 }}>
                        {lawyer.lawyerMail}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </>
          )}
        </DialogContent>

        <Divider />

        <DialogActions
          sx={{
            p: 2.5,
            bgcolor: '#f8f9fa',
            borderTop: '1px solid #e0e0e0'
          }}
        >
          <Button
            onClick={() => setFirmLawyersDialogOpen(false)}
            variant="contained"
            sx={{
              textTransform: 'none',
              px: 3,
              py: 1,
              borderRadius: 1,
              bgcolor: '#1976d2',
              '&:hover': {
                bgcolor: '#1565c0',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* =============== ADD LAWYER DIALOG =============== */}
      <Dialog
        open={addLawyerDialogOpen}
        onClose={() => setAddLawyerDialogOpen(false)}
      >
        <DialogTitle>Add Lawyer for {selectedCustomerForLawyer?.custName}</DialogTitle>
        <DialogContent>
          <TextField
            label="Lawyer Name"
            value={lawyerForm.lawyerName}
            onChange={(e) =>
              setLawyerForm((prev) => ({
                ...prev,
                lawyerName: e.target.value,
              }))
            }
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label="Lawyer Email"
            value={lawyerForm.lawyerMail}
            onChange={(e) =>
              setLawyerForm((prev) => ({
                ...prev,
                lawyerMail: e.target.value,
              }))
            }
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddLawyerDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateLawyer} variant="contained">
            Add Lawyer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for error/success messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.includes("Error") ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
