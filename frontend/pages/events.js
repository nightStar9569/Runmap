import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import {
  Box, Heading, Text, Spinner, Table, Thead, Tbody, Tr, Th, Td, Select, Button, VStack, HStack, Link as ChakraLink
} from '@chakra-ui/react';
import Link from 'next/link';

function getDefaultDateRange() {
  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(now.getFullYear() + 1);
  return {
    start: `${now.getFullYear()}-01-01`,
    end: `${nextYear.getFullYear()}-12-31`,
  };
}

export default function EventsPage() {
  const router = useRouter();
  const { cityId, cityName } = router.query;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(1);
  const [endYear, setEndYear] = useState(new Date().getFullYear() + 1);
  const [endMonth, setEndMonth] = useState(12);

  const fetchEvents = async () => {
    if (!cityId) return;
    setLoading(true);
    setError('');
    try {
      const start = `${startYear}-${String(startMonth).padStart(2, '0')}-01`;
      const end = `${endYear}-${String(endMonth).padStart(2, '0')}-31`;
      const res = await api.get('/event/by-city-date', {
        params: { cityId, start, end },
      });
      setEvents(res.data);
    } catch (err) {
      setError('大会リストの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [cityId, startYear, startMonth, endYear, endMonth]);

  const years = [];
  const thisYear = new Date().getFullYear();
  for (let y = thisYear - 1; y <= thisYear + 2; y++) years.push(y);

  return (
    <Box maxW="1000px" mx="auto" mt={10}>
      <Heading as="h2" size="lg" mb={6}>
        大会一覧
      </Heading>
      <Text mb={4}>ご覧になりたい大会をクリックしてください</Text>
      <HStack mb={4} spacing={4}>
        <Select value={cityId} isReadOnly width="150px">
          <option value={cityId}>{cityName || '都道府県'}</option>
        </Select>
        <Select value={startYear} onChange={e => setStartYear(Number(e.target.value))} width="100px">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </Select>
        <Select value={startMonth} onChange={e => setStartMonth(Number(e.target.value))} width="80px">
          {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
        </Select>
        <Text>～</Text>
        <Select value={endYear} onChange={e => setEndYear(Number(e.target.value))} width="100px">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </Select>
        <Select value={endMonth} onChange={e => setEndMonth(Number(e.target.value))} width="80px">
          {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
        </Select>
        <Button onClick={fetchEvents} colorScheme="blue">検索</Button>
        <Button onClick={() => router.push('/')} colorScheme="gray">都道府県一覧へ</Button>
      </HStack>
      {loading ? (
        <Spinner />
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="md">
            <Thead bg="blue.900">
              <Tr>
                <Th color="white">期日</Th>
                <Th color="white">大会名</Th>
                <Th color="white">期間</Th>
                <Th color="white">競技場名</Th>
              </Tr>
            </Thead>
            <Tbody>
              {events.length === 0 ? (
                <Tr><Td colSpan={4}>該当する大会がありません</Td></Tr>
              ) : events.map(event => (
                <Tr key={event.id}>
                  <Td>{event.date ? event.date.slice(0, 10) : ''}</Td>
                  <Td>
                    <Link href={`/events/${event.id}`} passHref>
                      <ChakraLink color="blue.700" fontWeight="bold">{event.name}</ChakraLink>
                    </Link>
                  </Td>
                  <Td>{event.description || ''}</Td>
                  <Td>{event.location || (event.City && event.City.name) || ''}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
} 