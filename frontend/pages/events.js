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
  useToast
} from '@chakra-ui/react';
import Link from 'next/link';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState([]);
  const [date, setDate] = useState('');
  const toast = useToast();

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
      // For filter dropdown
      setLocations([...new Set(res.data.events.map(e => e.location))]);
    } catch (err) {
      setError('Failed to load events');
      toast({ title: 'Failed to load events', status: 'error', duration: 2000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [page, location, date]);

  return (
    <Box minH="100vh" bg="#f9fafb">
      <Box maxW="900px" mx="auto" py={12} px={4}>
        <Heading mb={8} color="blue.600" textAlign="center">Marathon Events</Heading>
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
          <Text color="gray.500" textAlign="center">No events found.</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {events.map(event => (
              <Box key={event.id} bg="white" borderRadius="xl" boxShadow="md" p={6} _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.2s">
                <VStack align="start" spacing={3}>
                  <Heading size="md" color="blue.500">
                    <Link href={`/events/${event.id}`}>{event.name}</Link>
                  </Heading>
                  <Text color="gray.600" noOfLines={2}>{event.description}</Text>
                  <Text fontWeight={500} color="gray.700">📍 {event.location}</Text>
                  <Text color="gray.500">🗓 {event.date?.slice(0, 10)}</Text>
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
      </Box>
    </Box>
  );
} 