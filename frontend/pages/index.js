import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  Box,
  Heading,
  Input,
  Button,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Select,
  Spinner,
  Flex,
  Link as ChakraLink,
  Image,
  useToast,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FaUser, FaPage4, FaSignInAlt, FaSignOutAlt, FaCreditCard, FaBell, FaPager } from 'react-icons/fa';
import { useRouter } from 'next/router';

export default function Home() {
  // Event search/list state
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState([]);
  const [date, setDate] = useState('');

  // Placeholder for authentication stat
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState('free');
  const toast = useToast();
  const router = useRouter();

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 6 };
      if (location) params.location = location;
      if (date) params.date = date;
      const res = await api.get('/events', { params });
      let filtered = res.data.events;
      if (search) {
        filtered = filtered.filter(e =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          (e.description && e.description.toLowerCase().includes(search.toLowerCase()))
        );
      }
      setEvents(filtered);
      setTotalPages(res.data.totalPages);
      setLocations([...new Set(res.data.events.map(e => e.location))]);
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkLogin = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    };
    checkLogin();
    router.events.on('routeChangeComplete', checkLogin);
    return () => {
      router.events.off('routeChangeComplete', checkLogin);
    };
  }, [router.events]);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [page, search, location, date]);

  // Fetch user profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        setNotificationsEnabled(res.data.notificationEnabled);
        setMembershipStatus(res.data.membershipStatus);
      } catch (err) {
        // Not logged in or error
        setNotificationsEnabled(false);
        setMembershipStatus('free');
      }
    };
    if (isLoggedIn) fetchProfile();
  }, [isLoggedIn]);

  return (
    <Box minH="100vh" bg="#f9fafb" display="flex" flexDirection="column" overflowX="hidden" justifyContent="space-between">

      {/* Top Section */}
      <Box as="header" p={0} textAlign="center" bg="white" boxShadow="sm" w="100vw" position="relative" left="50%" right="50%" ml="-50vw" mr="-50vw">
        <Box py={10}>
          <Heading color="blue.600" mb={2}>マラソン大会検索サイト</Heading>
          <Text fontSize="xl" color="gray.600" py={10}>気になる大会がすぐ見つかる、走る人の検索地図</Text>
          <Image src="/image/_1.png" alt="Hero" w="100vw" maxH="320px" objectFit="cover" borderRadius="none" />

        </Box>
      </Box>

      {/* Middle Section: Event Search & List */}
      <Box flex={1} maxW="900px" mx="auto" py={10} px={4}>
        <Flex mb={6} gap={4} flexWrap="wrap" justify="center">
          <Input
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            maxW="250px"
            bg="white"
          />
          <Select
            placeholder="Filter by location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            maxW="200px"
            bg="white"
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </Select>
          <Input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            maxW="180px"
            bg="white"
          />
          <Button onClick={() => { setSearch(''); setLocation(''); setDate(''); setPage(1); }} colorScheme="gray" variant="outline">Clear</Button>
        </Flex>
        {loading ? (
          <Flex justify="center" align="center" minH="200px"><Spinner size="xl" /></Flex>
        ) : error ? (
          <Text color="red.500" textAlign="center">{error}</Text>
        ) : events.length === 0 ? (
          <Text color="red.500" textAlign="center">No events found.</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {events.map(event => (
              <Box key={event.id} bg="white" borderRadius="xl" boxShadow="md" p={6} _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.2s">
                <VStack align="start" spacing={3} alignItems="center">
                  <Heading size="md" color="blue.500">
                    <Link href={`/events/${event.id}`}>{event.name}</Link>
                  </Heading>
                  <Text color="gray.600" noOfLines={2}>{event.description}</Text>
                  <Text fontWeight={500} color="gray.700">📍 {event.location}</Text>
                  <Text color="gray.500">🗓 Start from {event.date?.slice(0, 10)}</Text>
                  <Text color="gray.500">Apply for by {event.applyDeadline?.slice(5, 10)}</Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        )}
        {/* Pagination */}
        <HStack mt={10} justify="center">
          <Button onClick={() => setPage(p => Math.max(1, p - 1))} isDisabled={page === 1}>Prev</Button>
          <Text fontWeight={600} color="blue.600">Page {page} of {totalPages}</Text>
          <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} isDisabled={page === totalPages}>Next</Button>
        </HStack>

        <Box mt={6}>
          <a
            href="https://games.athleteranking.com/gamepref.php"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Button colorScheme="teal" size="lg" variant="solid">
              外部イベントリストを見る（AthleteRanking.com）
            </Button>
          </a>
        </Box>
      </Box>
    </Box>
  );
}