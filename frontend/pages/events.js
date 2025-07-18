import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import {
  Box, Heading, Text, Spinner, Table, Thead, Tbody, Tr, Th, Td, Input, Button, VStack, HStack, Link as ChakraLink, useColorModeValue, Checkbox, CheckboxGroup, Stack, IconButton, Skeleton, Badge, Image as ChakraImage, Select
} from '@chakra-ui/react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

function groupEventsByMonth(events) {
  const groups = {};
  events.forEach(event => {
    if (!event.date) return;
    const date = new Date(event.date);
    const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    if (!groups[monthKey]) groups[monthKey] = [];
    groups[monthKey].push(event);
  });
  return groups;
}

const raceTypes = [
  { key: 'fiveKm', label: '5km' },
  { key: 'tenKm', label: '10km' },
  { key: 'half', label: 'ハーフ' },
  { key: 'full', label: 'マラソン' },
  { key: 'ultra', label: 'ウルトラ' },
  { key: 'elementary', label: '小学生' },
  { key: 'parent', label: '親子' },
  { key: 'timed', label: '時間走' },
  { key: 'relay', label: '駅伝' },
  { key: 'trail', label: 'トレイル' },
];

const defaultNoResultsImg = 'https://undraw.co/api/illustrations/undraw_empty_re_opql.svg';

export default function EventsPage() {
  const router = useRouter();
  const { cityId, cityName } = router.query;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Filters
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRaceTypes, setSelectedRaceTypes] = useState([]);

  // Debounce filters
  const [debouncedFilters, setDebouncedFilters] = useState({});
  const debounceTimeout = useRef();
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedFilters({ name, location, startDate, endDate, selectedRaceTypes });
      setCurrentPage(1); // Reset to page 1 on filter change
    }, 400);
    return () => clearTimeout(debounceTimeout.current);
  }, [name, location, startDate, endDate, selectedRaceTypes]);

  // Fetch events when filters or page changes
  useEffect(() => {
    if (!cityId) return;
    setLoading(true);
    setError('');
    const params = { cityId, page: currentPage, limit };
    if (debouncedFilters.name) params.name = debouncedFilters.name;
    if (debouncedFilters.location) params.location = debouncedFilters.location;
    if (debouncedFilters.startDate) params.startDate = debouncedFilters.startDate;
    if (debouncedFilters.endDate) params.endDate = debouncedFilters.endDate;
    (debouncedFilters.selectedRaceTypes || []).forEach(type => { params[type] = true; });
    api.get('/events/by-city-date', { params })
      .then(res => {
        setEvents(res.data.events || res.data); // support both array and paginated object
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => setError('大会リストの取得に失敗しました'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [cityId, debouncedFilters, currentPage, limit]);

  // When the user clicks the search button, immediately update debounced filters and reset page
  const handleSearch = () => {
    setCurrentPage(1);
    setDebouncedFilters({ name, location, startDate, endDate, selectedRaceTypes });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const clearFilters = () => {
    setName('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setSelectedRaceTypes([]);
    setCurrentPage(1);
  };

  // Highlight active filters
  const activeFilters = [
    name && { label: `大会名: ${name}` },
    location && { label: `開催地: ${location}` },
    startDate && { label: `開始日: ${startDate}` },
    endDate && { label: `終了日: ${endDate}` },
    ...selectedRaceTypes.map(type => ({ label: raceTypes.find(r => r.key === type)?.label })),
  ].filter(Boolean);

  return (
    <Box maxW="1200px" mx="auto" mt={10}>
      <Heading as="h2" size="lg" mb={6}>
        {cityName ? `${cityName}のマラソン大会一覧` : '大会一覧'}
      </Heading>
      <Text mb={4}>ご覧になりたい大会をクリックしてください</Text>
      {/* Sticky Filters Bar */}
      <Box mb={6} position="sticky" top="0" zIndex={10} p={4} bg={useColorModeValue('gray.50', 'gray.800')} borderRadius="md" boxShadow="sm">
        <VStack align="start" spacing={4}>
          <HStack spacing={4} w="100%">
            <Input aria-label="大会名" placeholder="大会名" value={name} onChange={e => setName(e.target.value)} width="200px" />
            <Input aria-label="開催地" placeholder="開催地" value={location} onChange={e => setLocation(e.target.value)} width="200px" />
            <Input aria-label="開始日" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} width="160px" />
            <Text>～</Text>
            <Input aria-label="終了日" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} width="160px" />
            <Button colorScheme="blue" aria-label="検索" onClick={handleSearch}>検索</Button>
            <Button colorScheme="gray" aria-label="フィルターをクリア" onClick={clearFilters}>クリア</Button>
          </HStack>
          <CheckboxGroup value={selectedRaceTypes} onChange={setSelectedRaceTypes}>
            <Stack direction="row" spacing={4} wrap="wrap">
              {raceTypes.map(type => (
                <Checkbox key={type.key} value={type.key}>{type.label}</Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
          {/* Active Filters Badges */}
          <HStack spacing={2} flexWrap="wrap">
            {activeFilters.map((f, i) => (
              <Badge key={i} colorScheme="blue" px={2} py={1} borderRadius="md">{f.label}</Badge>
            ))}
          </HStack>
        </VStack>
      </Box>
      {loading ? (
        <Box>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height="40px" mb={2} borderRadius="md" />
          ))}
        </Box>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <Box overflowX="auto">
          {Object.entries(groupEventsByMonth(events)).length === 0 ? (
            <VStack py={10} spacing={4} w="100%">
              <ChakraImage src={defaultNoResultsImg} alt="No results" boxSize="120px" />
              <Text fontSize="lg" color="gray.500">該当する大会がありません</Text>
            </VStack>
          ) : Object.entries(groupEventsByMonth(events)).map(([month, monthEvents]) => (
            <Box key={month} mb={8}>
              <Box bg={useColorModeValue('gray.100', 'gray.700')} px={2} py={1} borderRadius="md" mb={2} fontWeight="bold">{month}の大会</Box>
              <Box overflowX="auto">
                <Table variant="simple" size="sm" sx={{ minWidth: '900px' }}>
                  <Thead bg="blue.900" position="sticky" top={0} zIndex={1}>
                    <Tr>
                      <Th color="white">開催日</Th>
                      <Th color="white">大会名</Th>
                      <Th color="white">開催地</Th>
                      <Th color="white">5km</Th>
                      <Th color="white">10km</Th>
                      <Th color="white">ハーフ</Th>
                      <Th color="white">マラソン</Th>
                      <Th color="white">ウルトラ</Th>
                      <Th color="white">小学生</Th>
                      <Th color="white">親子</Th>
                      <Th color="white">時間走</Th>
                      <Th color="white">駅伝</Th>
                      <Th color="white">トレイル</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {monthEvents.map(event => (
                      <Tr key={event.id}>
                        <Td>{event.date ? event.date.slice(0, 10) : ''}</Td>
                        <Td>
                          <Link href={`${event.link_url}`} passHref>
                            <ChakraLink color="blue.700" fontWeight="bold">{event.name}</ChakraLink>
                          </Link>
                        </Td>
                        <Td>{event.location || (event.City && event.City.name) || ''}</Td>
                        <Td>{event.fiveKm ? '◯' : ''}</Td>
                        <Td>{event.tenKm ? '◯' : ''}</Td>
                        <Td>{event.half ? '◯' : ''}</Td>
                        <Td>{event.full ? '◯' : ''}</Td>
                        <Td>{event.ultra ? '◯' : ''}</Td>
                        <Td>{event.elementary ? '◯' : ''}</Td>
                        <Td>{event.parent ? '◯' : ''}</Td>
                        <Td>{event.timed ? '◯' : ''}</Td>
                        <Td>{event.relay ? '◯' : ''}</Td>
                        <Td>{event.trail ? '◯' : ''}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          ))}
          {/* Pagination Controls */}
          <HStack justify="center" mt={6} spacing={2}>
            <IconButton icon={<ChevronLeftIcon />} aria-label="前のページ" onClick={() => handlePageChange(currentPage - 1)} isDisabled={currentPage === 1} />
            <Text>{currentPage} / {totalPages}</Text>
            <IconButton icon={<ChevronRightIcon />} aria-label="次のページ" onClick={() => handlePageChange(currentPage + 1)} isDisabled={currentPage === totalPages} />
            <Select width="80px" value={limit} onChange={e => { setLimit(Number(e.target.value)); setCurrentPage(1); }} aria-label="表示件数">
              {[10, 20, 50].map(n => <option key={n} value={n}>{n}件</option>)}
            </Select>
          </HStack>
        </Box>
      )}
    </Box>
  );
} 