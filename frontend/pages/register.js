import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Link,
  VStack,
  useToast
} from '@chakra-ui/react';
import NextLink from 'next/link';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const usernameRef = useRef(null);
  const toast = useToast();

  const validate = () => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email address';
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (phone && !/^\+?\d{7,15}$/.test(phone)) return 'Invalid phone number';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      if (usernameRef.current) usernameRef.current.focus();
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', { username, email, password, phone, address });
      setSuccess('Registration successful! You can now log in.');
      toast({ title: 'Registration successful!', status: 'success', duration: 1500, isClosable: true });
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="#f9fafb">
      <VStack spacing={6} maxW="600px" mx="auto" py={20} px={4}>
        <Box w="100%" bg="white" p={10} borderRadius="xl" boxShadow="xl">
          <Heading mb={6} color="blue.500" textAlign="center">Register</Heading>
          <form onSubmit={handleSubmit} autoComplete="on">
            <FormControl mb={5} isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoFocus
              />
            </FormControl>
            <FormControl mb={5} isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </FormControl>
            <FormControl mb={5} isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl mb={5}>
              <FormLabel>Phone (optional)</FormLabel>
              <Input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. +(090)12345678"
              />
            </FormControl>
            <FormControl mb={5}>
              <FormLabel>Address (optional)</FormLabel>
              <Input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter your address"
              />
            </FormControl>
            {error && (
              <Alert status="error" mb={4} borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
            {success && (
              <Alert status="success" mb={4} borderRadius="md">
                <AlertIcon />
                {success}
              </Alert>
            )}
            <Box display="flex" justifyContent="center" pt={6}>
              <Button
                colorScheme="blue"
                type="submit"
                width="50%"
                isLoading={loading}
                onClick={handleSubmit}
              >
                Register
              </Button>
            </Box>
          </form>
          <Text mt={6} textAlign="center">
            Already have an account?{' '}
            <Link as={NextLink} href="/login" color="blue.500" fontWeight={600}>
              Login
            </Link>
          </Text>
        </Box>
      </VStack>
    </Box>
  );
} 