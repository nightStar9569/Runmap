import { useState } from 'react';
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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const validate = () => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email address';
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('isLoggedIn', 'true');
      toast({ title: 'Login successful!', status: 'success', duration: 1500, isClosable: true });
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="#f9fafb">
      <VStack spacing={6} maxW="400px" mx="auto" py={20} px={4}>
        <Box w="100%" bg="white" p={8} borderRadius="xl" boxShadow="lg">
          <Heading mb={6} color="blue.500" textAlign="center">Login</Heading>
          <form onSubmit={handleSubmit} autoComplete="on">
            <FormControl mb={4} isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoFocus
              />
            </FormControl>
            <FormControl mb={4} isRequired>
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
            {error && (
              <Alert status="error" mb={4} borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
            <Box display="flex" justifyContent="center">
              <Button
                colorScheme="blue"
                type="submit"
                width="50%"
                mt={4}
                isLoading={loading}
              >
                Login
              </Button>
            </Box>
          </form>
          <Text mt={6} textAlign="center">
            Don't have an account?{' '}
            <Link as={NextLink} href="/register" color="blue.500" fontWeight={600}>
              Register
            </Link>
          </Text>
        </Box>
      </VStack>
    </Box>
  );
} 