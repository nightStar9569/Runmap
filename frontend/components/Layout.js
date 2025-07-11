import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, Image, Text, Link as ChakraLink, useToast } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Switch,
  Tooltip
} from '@chakra-ui/react';
import { FaUser, FaPage4, FaSignInAlt, FaSignOutAlt, FaCreditCard, FaBell } from 'react-icons/fa';
import api from '../utils/api';

export default function Layout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState('free');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const router = useRouter();
  const toast = useToast();

  // Helper to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Sync isLoggedIn state with localStorage and route changes
  useEffect(() => {
    const checkLogin = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    };
    checkLogin();
    router.events?.on && router.events.on('routeChangeComplete', checkLogin);
    return () => {
      router.events?.off && router.events.off('routeChangeComplete', checkLogin);
    };
  }, [router.events]);

  // Fetch user profile when logged in
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile', { headers: getAuthHeader() });
        setNotificationsEnabled(res.data.notificationEnabled);
        setMembershipStatus(res.data.membershipStatus);
      } catch (err) {
        setNotificationsEnabled(false);
        setMembershipStatus('free');
      }
    };
    if (isLoggedIn) fetchProfile();
  }, [isLoggedIn]);

  return (
    <Box minH="100vh" bg="#f9fafb" display="flex" flexDirection="column" justifyContent="space-between" overflowX="hidden">
      {/* Header */}
      <Box as="nav" w="100vw" px={8} py={3} bg="blue.800" boxShadow="sm" display="flex" alignItems="center" justifyContent="space-between" position="relative" left="50%" right="50%" ml="-50vw" mr="-50vw">
        <Flex align="center">
          <Image src="/image/_1.png" alt="Logo" boxSize="40px" borderRadius="50%" mr={3} />
          <Heading size="md" color="white" letterSpacing="wider">RunMap</Heading>
        </Flex>
        <Flex align="center" gap={6}>
          <ChakraLink as={Link} href="/mypage" color="white" fontWeight={600} display="flex" alignItems="center" gap={2}>
            <FaPage4 />
          </ChakraLink>
          {membershipStatus === 'admin' && (
            <ChakraLink as={Link} href="/admin" color="white" fontWeight={600} display="flex" alignItems="center" gap={2}>
              <FaCreditCard />
            </ChakraLink>
          )}
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="User settings"
              icon={<FaUser />}
              variant="ghost"
              color="white"
              _hover={{ bg: 'blue.700' }}
            />
            <MenuList>
              <MenuItem
                icon={isLoggedIn ? <FaSignOutAlt /> : <FaSignInAlt />}
                onClick={() => {
                  if (!isLoggedIn) router.push('/login');
                  else {
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('accessToken');
                    setIsLoggedIn(false);
                    router.push('/');
                  }
                }}
              >
                {isLoggedIn ? 'Log out' : 'Log in'}
              </MenuItem>
              <MenuItem
                icon={<FaCreditCard />}
                onClick={() => router.push('/payment')}
              >
                Payment Page
              </MenuItem>
              <MenuItem icon={<FaBell />} closeOnSelect={false}>
                Notification Settings
                <Tooltip
                  label={membershipStatus !== 'paid' ? 'Upgrade to paid membership to enable notifications' : ''}
                  isDisabled={membershipStatus === 'paid'}
                  hasArrow
                  placement="left"
                >
                  <Switch
                    ml={3}
                    isChecked={notificationsEnabled}
                    isDisabled={membershipStatus !== 'paid' && membershipStatus !== 'admin'}
                    onChange={async () => {
                      if (membershipStatus !== 'paid' && membershipStatus !== 'admin') {
                        toast({
                          title: 'Only paid members and admin can enable notifications.',
                          status: 'info',
                          duration: 2000,
                        });
                        return;
                      }
                      const newState = !notificationsEnabled;
                      setNotificationsEnabled(newState); // Optimistically update
                      try {
                        const res = await api.put(
                          '/user/notifications/toggle',
                          { enabled: newState },
                          { headers: getAuthHeader() }
                        );
                        if (res.data.notificationEnabled !== undefined) {
                          setNotificationsEnabled(res.data.notificationEnabled);
                        }
                        toast({
                          title: 'Notification setting updated.',
                          status: 'success',
                          duration: 1500,
                        });
                      } catch (err) {
                        setNotificationsEnabled(!newState); // Roll back
                        toast({
                          title: err.response?.data?.message || 'Failed to update notification setting',
                          status: 'error',
                          duration: 2000,
                        });
                      }
                    }}
                  />
                </Tooltip>
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box flex={1} w="100%" maxW="100vw">
        {children}
      </Box>

      {/* Footer */}
      <Box as="footer" py={6} textAlign="center" bg="gray.100" mt={10}>
        <Text color="gray.600" fontSize="sm">
          &copy; {new Date().getFullYear()} RunMap. All rights reserved. |{' '}
          <ChakraLink as={Link} href="/privacy-policy" color="blue.500">Privacy Policy</ChakraLink> |{' '}
          <ChakraLink as={Link} href="/terms" color="blue.500">Terms of Service</ChakraLink>
        </Text>
      </Box>
    </Box>
  );
}
