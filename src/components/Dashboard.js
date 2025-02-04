import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Paper, Box, Chip, IconButton, Divider,
  useTheme, alpha
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Message as MessageIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import ConversationDialog from './ConversationDialog';
import moment from 'moment';

export default function Dashboard() {
  const theme = useTheme();
  
  // State management
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    custMail: '',
    custName: '',
    twilioNumber: '',
  });
  const [conversations, setConversations] = useState([]);
  const [threadDialogOpen, setThreadDialogOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchConversations();
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

  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  }

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
    }
  };

  const threads = getThreadsWithLatest();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
   

      {/* Customers Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Customers
            </Typography>
            <Chip 
              label={customers.length}
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
            Add Customer
          </Button>
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Twilio Number</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.custiId} hover>
                    <TableCell>{customer.custiId}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {customer.custMail}
                      </Box>
                    </TableCell>
                    <TableCell>{customer.custName}</TableCell>
                    <TableCell>{customer.twilioNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Conversations Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MessageIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
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
                  <TableCell sx={{ fontWeight: 600 }}>Thread ID</TableCell>
                  {/* <TableCell sx={{ fontWeight: 600 }}>Channel</TableCell> */}
                  <TableCell sx={{ fontWeight: 600 }}>Latest Message</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {threads.map((thread) => (
                  <TableRow
                    key={thread.id}
                    hover
                    onClick={() => handleOpenThread(thread.threadId)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {thread.threadId}
                      </Box>
                    </TableCell>
                    {/* <TableCell>
                      <Chip 
                        label={thread.channel}
                        size="small"
                        color={thread.channel.toLowerCase() === 'sms' ? 'primary' : 'secondary'}
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell> */}
                    <TableCell sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {thread.message}
                    </TableCell>
                    <TableCell>{moment.utc(thread.timestamp).local().format("MMM-DD-YYYY hh:MM:SS A")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

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
            title='Twilio Number'
            disablePortal
            options={['+17575688750','+17575551111']}
            sx={{ width: 300 }}
            freeSolo = {false}
            value={newCustomer.twilioNumber}
            renderInput={(params) => <TextField {...params} label="Twilio Number" />}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={handleAddCustomer}
            startIcon={<AddIcon />}
          >
            Add Customer
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
    </Container>
  );
}