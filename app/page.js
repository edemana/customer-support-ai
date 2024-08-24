'use client'

import { Box, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from '../firebase'; // Firebase configuration file
import { useTranslation } from 'next-i18next';
import { addDoc, collection } from "firebase/firestore";
import { signOut } from "firebase/auth";
import i18next from 'i18next';
import Auth from "./auth"; // Ensure to import your auth component
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const { t } = useTranslation('common');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Ebot. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    return <Auth />;
  }

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true)

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const sendFeedback = async (messageId, rating) => {
    try {
      await addDoc(collection(db, "feedback"), {
        messageId,
        rating,
        userId: user.uid,
        createdAt: new Date(),
      });
      console.log('Feedback submitted successfully');
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const downloadChat = () => {
    const chatContent = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
    const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-${new Date().toISOString()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLanguageChange = (lang) => {
    i18next.changeLanguage(lang);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        backgroundImage: `url('/images/background.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Stack
        direction={'column'}
        width="700px"
        height="800px"
        border="1px"
        p={4}
        spacing={3}
        sx={{
          backdropFilter: 'blur(10px)', 
          backgroundColor: 'rgba(255, 255, 255, 0.5)', 
          borderRadius: '8px',
        }}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              flexDirection="column"
              alignItems={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box
                bgcolor={message.role === 'assistant' ? '#E3F2FD' : '#3949AB'} 
                color={message.role === 'assistant' ? '#0D47A1' : 'white'} 
                borderRadius={16}
                p={4} 
                fontSize="1rem"
                lineHeight={2} 
                sx={{ whiteSpace: 'pre-wrap' }} 
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </Box>
              {message.role === 'assistant' && (
                <Box mt={1}>
                  <Button onClick={() => sendFeedback(index, 'positive')}>👍</Button>
                  <Button onClick={() => sendFeedback(index, 'negative')}>👎</Button>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              bgcolor: '#ffff',
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#1E88E5',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1565C0',
                },
              },
            }}
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              bgcolor: '#1E88E5',
              color: 'white',
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
        <Stack direction={'row'} justifyContent="space-between">
          <Button onClick={handleLogout} sx={{ bgcolor: '#f44336', color: 'white' }}>
            Logout
          </Button>
          <Button onClick={downloadChat} sx={{ bgcolor: '#4caf50', color: 'white' }}>
            Download Chat
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
