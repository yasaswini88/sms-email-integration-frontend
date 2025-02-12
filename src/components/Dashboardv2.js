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
  Icon
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {
  Add as AddIcon,
  // Refresh as RefreshIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import ConversationDialog from './ConversationDialog';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import Papa from 'papaparse';

export default function Dashboardv2() {
  const theme = useTheme();

  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  const inputValue = localStorage.getItem("email") || "";
  const [selectedFile, setSelectedFile] = useState(null);


  // State management
  const [customers, setCustomers] = useState([]);

  let filteredCustomers = [...customers];
  const [lawyers, setLawyers] = useState([]);
  const [open, setOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    custMail: '',
    custName: '',
    twilioNumber: '',
  });

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [threadDialogOpen, setThreadDialogOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');




  const [firmLawyersDialogOpen, setFirmLawyersDialogOpen] = useState(false);
  const [selectedFirmLawyers, setSelectedFirmLawyers] = useState([]);


  const [selectedThread, setSelectedThread] = useState(null);




  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignee, setAssignee] = useState('');
  const [editCustomer, setEditCustomer] = useState({
    custiId: null,
    custMail: '',
    custName: '',
    twilioNumber: ''
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const [addLawyerDialogOpen, setAddLawyerDialogOpen] = useState(false);
  const [lawyerForm, setLawyerForm] = useState({
    lawyerName: '',
    lawyerMail: ''
  });

  const [selectedCustomerForLawyer, setSelectedCustomerForLawyer] = useState(null);



  useEffect(() => {
    fetchCustomers();
    fetchConversations();
    fetchLawyers();
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


  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://23.23.199.217:8080/api/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

        // 1) Use the selectedCustiId instead of hardcoding
        axios.post(
          `http://23.23.199.217:8080/api/firm-lawyers/bulk-insert?custiId=${selectedCustiId}`,
          parsedResult.data
        )
          .then(response => {
            console.log("Response from POST:", response.data);
            setSnackbarMessage("CSV file uploaded successfully!");
            setSnackbarOpen(true);

            fetchConversations(); // Refresh the UI
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


  function getThreadsWithLatest() {
    const map = new Map();
    for (const convo of conversations) {
      const tId = convo.threadId || 'no-thread';
      if (!map.has(tId)) {
        map.set(tId, convo);
      } else {
        const existing = map.get(tId);
        const existingTime = new Date(existing.timestamp).getTime();
        const currentTime = new Date(convo.timestamp).getTime();
        if (currentTime > existingTime) {
          map.set(tId, convo);
        }
      }
    }
    return Array.from(map.values());
  }

  let threads = getThreadsWithLatest();

  if (role === 'FIRM' && inputValue) {
    filteredCustomers = customers.filter(c => c.custMail === inputValue);
  }

  if (role === 'CLIENT' && inputValue) {
    threads = threads.filter(thread =>
      thread.threadId && thread.threadId.includes(inputValue)
    );
  }

  if (role === 'FIRM' && filteredCustomers.length > 0) {
    const firmTwilio = filteredCustomers[0].twilioNumber; // e.g. "+17579608924"
    // Filter threads by comparing "toNumber" to the firm’s Twilio
    threads = threads.filter(thread => thread.toNumber === firmTwilio);
  }

  // function formatDate(dateString) {
  //   if (!dateString) return '';
  //   const date = new Date(dateString);
  //   return date.toLocaleString('en-US', {
  //     month: 'short', day: 'numeric', year: 'numeric',
  //     hour: 'numeric', minute: '2-digit', hour12: true
  //   });
  // }

  const handleOpenThread = (threadId) => {
    setSelectedThreadId(threadId);
    setThreadDialogOpen(true);
  };

  const handleCloseThread = () => {
    setThreadDialogOpen(false);
    setSelectedThreadId(null);
  };

  const handleOpenDialog = () => setOpen(true);
  const handleCloseDialog = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCustomer = async () => {
    try {
      await axios.post('http://23.23.199.217:8080/api/customers', newCustomer);
      setNewCustomer({ custMail: '', custName: '', twilioNumber: '' });
      setOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
      // If the error is a 500 due to unique constraint, show a friendlier message
      if (error.response && error.response.status === 500) {
        setSnackbarMessage("Could not add customer. Twilio number may already be in use.");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage("Error adding customer.");
        setSnackbarOpen(true);
      }
    }
  };



  const handleAddLawyerClick = (customer) => {
    setSelectedCustomerForLawyer(customer);
    setLawyerForm({ lawyerName: '', lawyerMail: '' });
    setAddLawyerDialogOpen(true);
  };

  // 3) Post new lawyer to the backend 
  const handleCreateLawyer = async () => {
    if (!selectedCustomerForLawyer) return;

    try {
      const custiId = selectedCustomerForLawyer.custiId;
      await axios.post(
        `http://23.23.199.217:8080/api/firm-lawyers/firm/${custiId}`,
        lawyerForm
      );
      setAddLawyerDialogOpen(false);

      // Optionally re-fetch lawyers if you want the UI to update
      // e.g. fetchLawyers(); or do something else
    } catch (error) {
      console.error('Error creating lawyer:', error);
      // handle with a snackbar or error message as you prefer
    }
  };


  const handleEditClick = (customer) => {
    setEditCustomer({
      custiId: customer.custiId,
      custMail: customer.custMail,
      custName: customer.custName,
      twilioNumber: customer.twilioNumber
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

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
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
        setSnackbarMessage("Could not update customer. Twilio number may already be in use.");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage("Error updating customer.");
        setSnackbarOpen(true);
      }
    }
  };


  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };


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

  const handleAssign = async (lawyerId, threadId) => {
    console.log('Assignee:', assignee);
    console.log('Selected Conversation:', selectedConversation);
    try {
      // await axios.put(`http://23.23.199.217:8080/api/customers/assign/${lawyerId}/${conversationId}`);
      await axios.put(`http://23.23.199.217:8080/api/customers/assign/thread/${lawyerId}/${threadId}`);
      setAssignDialogOpen(false);
      fetchConversations();
    } catch (error) {
      console.error('Error assigning conversation:', error);
    }
  };


  const handleViewLawyers = async (customer) => {
    try {
      const response = await axios.get(
        `http://23.23.199.217:8080/api/firm-lawyers/firm/${customer.custiId}`
      );
      setSelectedFirmLawyers(response.data);   // hold the lawyers in state
      setFirmLawyersDialogOpen(true);          // open the dialog
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    }
  };


  const handleResolveClick = async (threadId) => {
    try {
      // Make a PUT request to your new backend endpoint
      await axios.put(`http://23.23.199.217:8080/api/conversations/thread/${threadId}/resolve`);

      fetchConversations();
    } catch (error) {
      console.error("Error marking thread resolved:", error);
    }
  };


  // const threads = getThreadsWithLatest();


  // const allThreads = getThreadsWithLatest();

  // const threads = phoneNumber
  // ? allThreads.filter(thread => 
  //     thread.threadId && thread.threadId.includes(phoneNumber)
  //   )
  // : allThreads;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}


      {/* Customers Section */}

      {(role !== 'CLIENT') && (

        <Box sx={{ mb: 6 }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              <Typography variant="h5" sx={{
                fontWeight: 600,
                color: '#1976d2', // Material-UI primary blue
                textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
              }}>
                Law Firms
              </Typography>
              {/* <Chip
                label={customers.length}
                size="small"
                sx={{ ml: 1, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
              /> */}
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
                    {/* <TableCell sx={{ fontWeight: 600 }}>ID</TableCell> */}
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Twilio Number</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.custiId} hover>
                      {/* <TableCell>{customer.custiId}</TableCell> */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {customer.custMail}
                        </Box>
                      </TableCell>
                      <TableCell>{customer.custName}</TableCell>
                      <TableCell>{customer.twilioNumber}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditClick(customer)}
                        >
                          <EditIcon />
                        </IconButton>
                        {/* <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(customer)}
                      >
                        <DeleteIcon />
                      </IconButton> */}

                        {/* <IconButton
                          color="success"
                          title="Add Lawyer"
                          onClick={() => handleAddLawyerClick(customer)}
                        >
                          <PersonAddIcon />
                        </IconButton> */}



                        <IconButton
                          color="info"
                          onClick={() => handleViewLawyers(customer)}
                          title="View Lawyers"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <input
                          type="file"
                          onChange={(event) => importCsv(event, customer.custiId)}
                          style={{ display: 'none' }}
                          id={`file-upload-${customer.custiId}`}
                        />
                        <label htmlFor={`file-upload-${customer.custiId}`}>
                          <Button
                            variant="outlined"
                            component="span"
                            size="small"
                            sx={{ padding: '4px 10px', fontSize: '0.75rem', minWidth: 'auto' }}
                          >
                            Choose File
                          </Button>
                        </label>



                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

      )}

      {/* Conversations Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MessageIcon color="primary" />
          <Typography variant="h5" sx={{
            fontWeight: 600, color: '#1976d2', // Material-UI primary blue
            textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
          }}>
            Conversations
          </Typography>
          <Chip
            label={threads.length}
            size="small"
            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
          />
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Client Phone Number</TableCell>

                  <TableCell sx={{ fontWeight: 600 }}> Lawyer Email</TableCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {threads.map((thread) => (
                  <TableRow
                    key={thread.threadId}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                    }}
                  >
                    <TableCell>{thread.phoneNumber}</TableCell>

                    <TableCell>{thread.email ?? 'N/A'}</TableCell>


                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Dialog
        open={assignDialogOpen}
        onClose={handleCloseAssignDialog}
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 2 }
        }}>
        <DialogTitle>Assign Conversation</DialogTitle>
        <DialogContent>
          <Select
            label="Assignee"
            name="assignee"
            value={assignee}
            onChange={(event) => {
              // if(event.target.value !== ''){ 
              setAssignee(event.target.value)
              //}
            }}
            fullWidth
          >
            {/* <option value="">Select Assignee</option> */}
            {lawyers.map((lawyer) => (
              <MenuItem key={lawyer.lawyerId} value={lawyer.lawyerId}>
                {lawyer.lawyerName}
              </MenuItem>
            ))}
          </Select>

          <Button onClick={() => handleAssign(assignee, selectedThread)}>Assign</Button>
          {/* <Autocomplete
            title='Assignee'
            options={lawyers}
            sx={{ width: 300 }}
            value={assignee}
            onChange={(event,val) => setAssignee(val)}
            renderInput={(params) => (
              console.log("params",params),
              <TextField
                {...params}
                label={params.lawyerName}
                name="assignee"

              />
            )}
            
            /> */}
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2
        }}>
          Add New Customer
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Customer Email"
            name="custMail"
            value={newCustomer.custMail}
            margin="normal"
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Customer Name"
            name="custName"
            value={newCustomer.custName}
            onChange={handleChange}
            fullWidth
          />
          {/* <TextField
            label="Twilio Number"
            name="twilioNumber"
            value={newCustomer.twilioNumber}
            onChange={handleChange}
            fullWidth
          /> */}
          <Autocomplete
            title="Twilio Number"
            disablePortal
            options={['+17575688750', '+17575551111', '+17579608924']}
            sx={{ width: 300 }}
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
              />
            )}
          />

        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddCustomer}
          // startIcon={<AddIcon />}
          >
            Add Customer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Customer Email"
            name="custMail"

            value={editCustomer.custMail}
            onChange={handleEditFieldChange}
            variant="outlined"
            margin="normal"
            fullWidth
          />
          <TextField
            label="Customer Name"
            name="custName"
            value={editCustomer.custName}
            onChange={handleEditFieldChange}
            variant="outlined"
            fullWidth
          />
          <Autocomplete
            title='Twilio Number'
            disablePortal
            options={['+17575688750', '+17575551111']}
            sx={{ width: 300 }}
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
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateCustomer}
          // startIcon={<EditIcon />}
          >
            Update Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog - NEW OR CHANGED CODE */}
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
          // startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={firmLawyersDialogOpen}
        onClose={() => setFirmLawyersDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          Lawyers for Firm: {selectedFirmLawyers?.[0]?.firm?.custName || ''}
        </DialogTitle>
        <DialogContent>
          {selectedFirmLawyers.length === 0 ? (
            <Typography>No lawyers found for this firm.</Typography>
          ) : (
            selectedFirmLawyers.map((lawyer) => (
              <Box key={lawyer.lawyerId} sx={{ mb: 2 }}>
                {/* <Typography variant="body1">
                  <strong>Name:</strong> {lawyer.lawyerName}
                </Typography> */}
                <Typography variant="body2">
                  <strong>Email:</strong> {lawyer.lawyerMail}
                </Typography>
                <hr />
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFirmLawyersDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>


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


      {/* Conversation Thread Dialog */}
      {selectedThreadId && (
        <ConversationDialog
          open={threadDialogOpen}
          onClose={handleCloseThread}
          threadId={selectedThreadId}
        />
      )}




      {/* Snackbar for error messages */}
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