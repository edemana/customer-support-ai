'use client'

import { Box, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useSession } from "next-auth/react"

export default function Home() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Ed's support assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageId, rating }),
    });

    if (!response.ok) {
      console.error('Failed to send feedback');
    }
  };

  if (!session) {
    return <div>Please sign in to use the chat.</div>
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#000000"
    >
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid #333"
        p={2}
        spacing={3}
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
                bgcolor={message.role === 'assistant' ? '#1E88E5' : '#3949AB'}
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
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
              bgcolor: '#ffffff',
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#1E88E5',
                },
                '&:hover fieldset': {
                  borderColor: '#1565C0',
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
              '&:hover': {
                bgcolor: '#1565C0',
              },
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}