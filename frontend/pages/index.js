import { useState, useEffect } from 'react';
import api from '../utils/api';
import { fontFamily } from '../utils/fonts';
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
  Container,
  Badge,
  Icon,
  useColorModeValue,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Divider,
  InputGroup,
  InputLeftElement,
  useBreakpointValue,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import Link from 'next/link';
import { 
  FaUser, 
  FaPage4, 
  FaSignInAlt, 
  FaSignOutAlt, 
  FaCreditCard, 
  FaBell, 
  FaPager, 
  FaHeart, 
  FaRegHeart, 
  FaCheck,
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFilter,
  FaExternalLinkAlt,
  FaRunning,
  FaTrophy,
  FaUsers,
  FaClock
} from 'react-icons/fa';
import { useRouter } from 'next/router';

export default function Home() {
  const [cities, setCities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/admin/cities-grouped');
        setCities(res.data);
      } catch (err) {
        setError('都道府県リストの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  return (
    <Box maxW="900px" mx="auto" mt={10}>
      <Heading as="h2" size="lg" mb={6}>
        都道府県別検索
      </Heading>
      <Text mb={4}>ご覧になりたい都道府県をクリックしてください</Text>
      {loading ? (
        <Spinner />
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <VStack align="start" spacing={6}>
          {Object.keys(cities).map(region => (
            <Box key={region}>
              <Text fontWeight="bold" mb={1}>{region}</Text>
              <HStack spacing={3} flexWrap="wrap">
                {cities[region].map(city => (
                  <Link
                    key={city.id}
                    href={{ pathname: '/events', query: { cityId: city.id, cityName: city.name } }}
                    passHref
                  >
                    <ChakraLink color="blue.600" _hover={{ textDecoration: 'underline' }}>
                      {city.name}
                    </ChakraLink>
                  </Link>
                ))}
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}