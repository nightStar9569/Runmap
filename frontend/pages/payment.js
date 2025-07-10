import { useState, useEffect } from 'react';
import { Box, Heading, Text, Button, useToast } from '@chakra-ui/react';
import api from '../utils/api';
import { useRouter } from 'next/router';

export default function PaymentPage() {
  const [membershipStatus, setMembershipStatus] = useState('free');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        setMembershipStatus(res.data.membershipStatus);
      } catch {
        setMembershipStatus('free');
      }
    };
    fetchProfile();
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await api.post('/user/upgrade');
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
    <Box maxW="500px" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
      <Heading mb={4}>Upgrade Membership</Heading>
      <Text mb={4}>Current status: <b>{membershipStatus === 'paid' ? 'Paid Member' : 'Free Member'}</b></Text>
      {membershipStatus === 'paid' ? (
        <Text color="green.500" fontWeight="bold">You are already a paid member!</Text>
      ) : (
        <Button colorScheme="blue" onClick={handleUpgrade} isLoading={loading}>
          Upgrade to Paid
        </Button>
      )}
    </Box>
  );
}