import { useState, useEffect } from 'react';
import { Box, Heading, Text, Button, useToast, Flex } from '@chakra-ui/react';
import api from '../utils/api';
import { useRouter } from 'next/router';

export default function PaymentPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState('free');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  // Helper to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile', { headers: getAuthHeader() });
        setMembershipStatus(res.data.membershipStatus);
        setIsAdmin(res.data.membershipStatus === 'admin');
      } catch {
        setMembershipStatus('free');
        setIsAdmin(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await api.post('/user/upgrade', {}, { headers: getAuthHeader() });
      setMembershipStatus(res.data.membershipStatus);
      toast({ title: 'Membership upgraded!', status: 'success', duration: 2000 });
      // Optionally, redirect or refresh profile elsewhere
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Upgrade failed', status: 'error', duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="#f9fafb">
      <Box maxW="500px" w="100%" p={6} bg="white" borderRadius="md" boxShadow="md" textAlign="center">
        <Heading mb={7} textAlign="center">Upgrade Membership</Heading>
        <Text mb={5} textAlign="center">Current status: <b>
          {isAdmin ? 'Admin' : membershipStatus === 'paid' ? 'Paid Member' : 'Free Member'}</b></Text>
        {isAdmin ? (
          <Text color="green.500" fontWeight="bold" textAlign="center">You are admin, so no need to pay!</Text>
        ) : membershipStatus === 'paid' ? (
          <Text color="green.500" fontWeight="bold" textAlign="center">You are already a paid member!</Text>
        ) : (
          <Button colorScheme="blue" onClick={handleUpgrade} isLoading={loading} mx="auto">
            Upgrade to Paid
          </Button>
        )}
      </Box>
    </Flex>
  );
}