// auth.js
'use client'
import { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Box, Stack, TextField, Button, Typography } from '@mui/material';

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      alert("Sign Up Successful!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      alert("Login Successful!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      alert("Logged out successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f5f5f5"
      sx={{
        backgroundImage: `url('/images/background.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backdropFilter: 'blur(10px)', 
        backgroundColor: 'rgba(255, 255, 255, 0.5)', 
        borderRadius: '8px',
      }}
    >
      <Stack
        direction="column"
        width="400px"
        p={4}
        spacing={3}
        sx={{
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)', // For a consistent blur effect
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slightly transparent background
        }}
      >
        {user ? (
          <Stack direction="column" alignItems="center" spacing={2}>
            <Typography variant="h6">Welcome, {user.email}</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogOut}
              sx={{ bgcolor: '#1E88E5', color: 'white' }}
            >
              Log Out
            </Button>
          </Stack>
        ) : (
          <Stack direction="column" spacing={2}>
  <Typography
    variant="h4"
    align="center"
    sx={{ color: '#3949AB', fontWeight: 'bold' }}
  >
    Welcome to Ebot!
  </Typography>
  <Typography variant="body1" align="center" sx={{ color: '#1E88E5' }}>
    Sign Up to get started or Login if you&apos;ve already signed up.
  </Typography>
  <TextField
    type="email"
    label="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    fullWidth
    sx={{
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
  <TextField
    type="password"
    label="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    fullWidth
    sx={{
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
    sx={{
      bgcolor: '#3949AB',
      color: 'white',
      '&:hover': {
        bgcolor: '#303F9F',
      },
    }}
    onClick={handleSignUp}
  >
    Sign Up
  </Button>
  <Button
    variant="contained"
    sx={{
      bgcolor: '#1E88E5',
      color: 'white',
      '&:hover': {
        bgcolor: '#1565C0',
      },
    }}
    onClick={handleLogIn}
  >
    Log In
  </Button>
</Stack>

        )}
      </Stack>
    </Box>
  );
}
