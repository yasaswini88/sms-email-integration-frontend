import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import { Close as CloseIcon, Email as EmailIcon, Sms as SmsIcon } from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';
import RefreshIcon from '@mui/icons-material/Refresh';

function ConversationDialog({ open, onClose, threadId }) {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (open) {
      fetchThreadMessages();
      console.log("Thread ID: ", threadId);
    }
  }, [open]);


  const fetchThreadMessages = async () => {
    try {
      const response = await axios.get(`http://23.23.199.217:8080/api/conversations/${threadId}`);
      const sorted = response.data.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      setMessages(sorted);
    } catch (error) {
      console.error('Error fetching thread messages:', error);
    }
  };

  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  }

  const MessageBubble = ({ message }) => {
    const isSMS = !(message.channel === 'SMS');
    
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: isSMS ? 'flex-end' : 'flex-start',
          mb: 2,
          px: 2
        }}
      >
        <Box
          sx={{
            maxWidth: '70%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isSMS ? 'flex-end' : 'flex-start',
          }}
        >
          <Box sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isSMS && <EmailIcon fontSize="small" color="primary" />}
            {isSMS && <SmsIcon fontSize="small" color="secondary" />}
            <Typography variant="caption" color="text.secondary">
              {isSMS ? message.phoneNumber : message.email?.split('<')[0]?.trim() || message.phoneNumber}
            </Typography>
          </Box>
          
          <Paper
            elevation={1}
            sx={{
              p: 1.5,
              backgroundColor: isSMS ? alpha(theme.palette.primary.main, 0.1) : '#fff',
              borderRadius: 2,
              borderTopLeftRadius: !isSMS ? 0 : undefined,
              borderTopRightRadius: isSMS ? 0 : undefined,
            }}
          >
            <Typography variant="body1">
              {isSMS ? message.message : message.message.replace('The incoming SMS says: ', '')}
            </Typography>
          </Paper>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {moment.utc(message.timestamp).local().format("MMM-DD-YYYY hh:MM:SS A")}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '800px'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          px: 3, 
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">Thread: {threadId}</Typography>
          <Chip 
            label={messages.length + ' messages'} 
            size="small"
            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
          />

        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton aria-label="refresh" size="small" onClick={fetchThreadMessages}>
            <RefreshIcon />
          </IconButton>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent 
        sx={{ 
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: alpha(theme.palette.background.default, 0.5)
        }}
      >
        <Box sx={{ 
          flexGrow: 1,
          overflowY: 'auto',
          py: 2,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ConversationDialog;