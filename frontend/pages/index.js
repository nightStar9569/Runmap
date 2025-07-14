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

  // Authentication and user state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState('free');
  const [favorites, setFavorites] = useState([]);
  const [appliedEvents, setAppliedEvents] = useState([]);
  const toast = useToast();
  const router = useRouter();

  // Responsive design values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const cardColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 });
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 6 };
      if (location) params.location = location;
      if (date) params.date = date;
      if (search) params.search = search;
      const res = await api.get('/events', { params });
      setEvents(res.data.events);
      setTotalPages(res.data.totalPages);
      setLocations([...new Set(res.data.events.map(e => e.location))]);
    } catch (err) {
      setError('イベントの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // Check login status
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

  // Fetch events
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [page, search, location, date]);

  // Fetch user profile and favorites
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get('/user/profile');
        setNotificationsEnabled(res.data.notificationEnabled);
        setMembershipStatus(res.data.membershipStatus);
        
        // Fetch favorites if user is logged in
        if (res.data.membershipStatus === 'paid' || res.data.membershipStatus === 'admin') {
          const favRes = await api.get('/user/favorites');
          setFavorites(favRes.data || []);
        }
        
        // Fetch user's event applications
        const applicationsRes = await api.get('/events/user/applications');
        setAppliedEvents(applicationsRes.data.map(app => app.eventId));
      } catch (err) {
        // Not logged in or error
        setNotificationsEnabled(false);
        setMembershipStatus('free');
        setFavorites([]);
        setAppliedEvents([]);
      }
    };
    if (isLoggedIn) fetchUserData();
  }, [isLoggedIn]);

  // Handle apply for event
  const handleApplyForEvent = async (eventId) => {
    if (!isLoggedIn) {
      toast({
        title: 'ログインが必要です',
        description: 'イベントに申し込むにはログインしてください',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      router.push('/login');
      return;
    }

    try {
      await api.post('/events/apply', { eventId });
      setAppliedEvents(prev => [...prev, eventId]);
      toast({
        title: '申し込み完了',
        description: 'イベントへの申し込みが完了しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: '申し込みエラー',
        description: err.response?.data?.message || '申し込みに失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle add to favorites
  const handleAddToFavorites = async (eventId) => {
    if (!isLoggedIn) {
      toast({
        title: 'ログインが必要です',
        description: 'お気に入りに追加するにはログインしてください',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      router.push('/login');
      return;
    }

    if (membershipStatus !== 'paid' && membershipStatus !== 'admin') {
      toast({
        title: 'プレミアム会員が必要です',
        description: 'お気に入り機能はプレミアム会員のみ利用できます',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      router.push('/payment');
      return;
    }

    // For admin users, show a toast that they can use the feature
    if (membershipStatus === 'admin') {
      toast({
        title: '管理者権限でアクセス',
        description: '管理者としてお気に入り機能を利用できます',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }

    try {
      if (favorites.some(fav => fav.Event?.id === eventId || fav.eventId === eventId)) {
        // Remove from favorites
        await api.delete(`/user/favorites/${eventId}`);
        setFavorites(prev => prev.filter(fav => fav.Event?.id !== eventId && fav.eventId !== eventId));
        toast({
          title: 'お気に入りから削除',
          description: 'イベントをお気に入りから削除しました',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
      } else {
        // Add to favorites
        await api.post('/user/favorites', { eventId });
        setFavorites(prev => [...prev, { eventId: eventId }]);
        toast({
          title: 'お気に入りに追加',
          description: 'イベントをお気に入りに追加しました',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'エラー',
        description: err.response?.data?.message || 'お気に入りの操作に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Check if event is in favorites
  const isEventInFavorites = (eventId) => {
    return favorites.some(fav => fav.Event?.id === eventId || fav.eventId === eventId);
  };

  // Check if event is applied
  const isEventApplied = (eventId) => {
    return appliedEvents.includes(eventId);
  };

  // Get days until event
  const getDaysUntilEvent = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status badge color
  const getStatusColor = (daysUntil) => {
    if (daysUntil < 0) return 'red';
    if (daysUntil <= 7) return 'orange';
    if (daysUntil <= 30) return 'yellow';
    return 'green';
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Hero Section */}
      <Box 
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        py={{ base: 12, md: 20 }}
        position="relative"
        overflow="hidden"
      >
        {/* Background Pattern */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          backgroundImage="url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
        />
        
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={6} textAlign="center">
            <Icon as={FaRunning} boxSize={16} color="white" />
            <Heading 
              size="2xl" 
              fontWeight="bold"
              bgGradient="linear(to-r, white, blue.100)"
              bgClip="text"
              fontFamily={fontFamily.display}
            >
              マラソン大会検索サイト
            </Heading>
            <Text fontSize="xl" maxW="2xl" opacity="0.9" fontFamily={fontFamily.body}>
              気になる大会がすぐ見つかる、走る人の検索地図
            </Text>
            <HStack spacing={4} wrap="wrap" justify="center">
              <Badge colorScheme="blue" variant="solid" px={3} py={1} borderRadius="full">
                <Icon as={FaTrophy} mr={2} />
                最新イベント
              </Badge>
              <Badge colorScheme="green" variant="solid" px={3} py={1} borderRadius="full">
                <Icon as={FaUsers} mr={2} />
                コミュニティ
              </Badge>
              <Badge colorScheme="purple" variant="solid" px={3} py={1} borderRadius="full">
                <Icon as={FaClock} mr={2} />
                リアルタイム
              </Badge>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Search Section */}
      <Container maxW="container.xl" py={8}>
        <Card bg={cardBg} shadow="lg" border="1px" borderColor={borderColor}>
          <CardHeader pb={4}>
            <Heading size="md" textAlign="center" fontFamily={fontFamily.heading}>
              <Icon as={FaSearch} mr={2} />
              イベントを検索
            </Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
              <GridItem>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="イベント名で検索..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    bg="white"
                    borderColor={borderColor}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  />
                </InputGroup>
              </GridItem>
              
              <GridItem>
                <InputGroup>
                  <Select
                    placeholder="開催地を選択"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    bg="white"
                    borderColor={borderColor}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </Select>
                </InputGroup>
              </GridItem>
              
              <GridItem>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FaCalendarAlt} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    bg="white"
                    borderColor={borderColor}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  />
                </InputGroup>
              </GridItem>
              
              <GridItem>
                <Button
                  leftIcon={<FaFilter />}
                  onClick={() => { setSearch(''); setLocation(''); setDate(''); setPage(1); }}
                  colorScheme="gray"
                  variant="outline"
                  w="full"
                  h="40px"
                >
                  クリア
                </Button>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
      </Container>

      {/* Events Section */}
      <Container maxW="container.xl" py={8}>
        {loading ? (
          <Flex justify="center" align="center" minH="400px">
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text color="gray.600" fontFamily={fontFamily.body}>イベントを読み込み中...</Text>
            </VStack>
          </Flex>
        ) : error ? (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <AlertTitle>エラーが発生しました</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : events.length === 0 ? (
          <Card bg={cardBg} textAlign="center" py={12}>
            <VStack spacing={4}>
              <Icon as={FaSearch} boxSize={12} color="gray.400" />
              <Heading size="md" color="gray.600" fontFamily={fontFamily.heading}>イベントが見つかりませんでした</Heading>
              <Text color="gray.500" fontFamily={fontFamily.body}>検索条件を変更してお試しください</Text>
            </VStack>
          </Card>
        ) : (
          <>
            {/* Results Header */}
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="lg" fontFamily={fontFamily.heading}>
                イベント一覧 ({events.length}件)
              </Heading>
              <Badge colorScheme="blue" variant="subtle" px={3} py={1}>
                ページ {page} / {totalPages}
              </Badge>
            </Flex>

            {/* Events Grid */}
            <SimpleGrid columns={cardColumns} spacing={6} mb={8}>
              {events.map(event => {
                const daysUntil = getDaysUntilEvent(event.date);
                const statusColor = getStatusColor(daysUntil);
                
                return (
                  <Card 
                    key={event.id} 
                    bg={cardBg} 
                    shadow="md" 
                    border="1px" 
                    borderColor={borderColor}
                    _hover={{ 
                      shadow: 'xl', 
                      transform: 'translateY(-4px)',
                      borderColor: 'blue.300'
                    }} 
                    transition="all 0.3s ease"
                    overflow="hidden"
                  >
                    <CardHeader pb={2}>
                      <VStack align="stretch" spacing={3}>
                        <Flex justify="space-between" align="start">
                          <Badge colorScheme={statusColor} variant="solid" fontSize="xs">
                            {daysUntil < 0 ? '終了' : daysUntil === 0 ? '今日' : `${daysUntil}日前`}
                          </Badge>
                          {isEventApplied(event.id) && (
                            <Badge colorScheme="green" variant="solid" fontSize="xs">
                              <Icon as={FaCheck} mr={1} />
                              申込済み
                            </Badge>
                          )}
                        </Flex>
                        
                        <Heading size="md" color="blue.600" lineHeight="1.3" fontFamily={fontFamily.heading}>
                          <Link href={`/events/${event.id}`} passHref>
                            <ChakraLink _hover={{ textDecoration: 'none' }}>
                              {event.name}
                            </ChakraLink>
                          </Link>
                        </Heading>
                      </VStack>
                    </CardHeader>

                    <CardBody pt={0}>
                      <VStack align="stretch" spacing={4}>
                        <Text color="gray.600" noOfLines={2} fontSize="sm" lineHeight="1.5">
                          {event.description}
                        </Text>
                        
                        <VStack align="stretch" spacing={2}>
                          <HStack spacing={2} color="gray.700">
                            <Icon as={FaMapMarkerAlt} color="blue.500" />
                            <Text fontSize="sm" fontWeight="500">{event.location}</Text>
                          </HStack>
                          
                          <HStack spacing={2} color="gray.600">
                            <Icon as={FaCalendarAlt} color="green.500" />
                            <Text fontSize="sm">
                              {event.date?.slice(0, 10)} から開始
                            </Text>
                          </HStack>
                          
                          <HStack spacing={2} color="gray.600">
                            <Icon as={FaClock} color="orange.500" />
                            <Text fontSize="sm">
                              {event.applyDeadline?.slice(5, 10)} まで申込受付
                            </Text>
                          </HStack>
                        </VStack>
                      </VStack>
                    </CardBody>

                    <Divider />

                    <CardFooter pt={4}>
                      <VStack spacing={3} w="full">
                        <Button
                          size="sm"
                          colorScheme={isEventApplied(event.id) ? "green" : "blue"}
                          variant={isEventApplied(event.id) ? "solid" : "outline"}
                          leftIcon={isEventApplied(event.id) ? <FaCheck /> : null}
                          onClick={() => handleApplyForEvent(event.id)}
                          isDisabled={isEventApplied(event.id)}
                          w="full"
                          fontSize="xs"
                          h="36px"
                        >
                          {isEventApplied(event.id) ? '申し込み済み' : 'このイベントに申し込む'}
                        </Button>
                        
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          leftIcon={isEventInFavorites(event.id) ? <FaHeart /> : <FaRegHeart />}
                          onClick={() => handleAddToFavorites(event.id)}
                          w="full"
                          fontSize="xs"
                          h="36px"
                        >
                          {isEventInFavorites(event.id) ? 'お気に入り済み' : 'お気に入りに追加'}
                        </Button>
                      </VStack>
                    </CardFooter>
                  </Card>
                );
              })}
            </SimpleGrid>

            {/* Pagination */}
            <Flex justify="center" align="center" gap={4}>
              <Button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                isDisabled={page === 1}
                leftIcon={<Icon as={FaPage4} />}
                variant="outline"
              >
                前へ
              </Button>
              
              <HStack spacing={2}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={page === pageNum ? "solid" : "outline"}
                      colorScheme={page === pageNum ? "blue" : "gray"}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </HStack>
              
              <Button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                isDisabled={page === totalPages}
                rightIcon={<Icon as={FaPage4} />}
                variant="outline"
              >
                次へ
              </Button>
            </Flex>
          </>
        )}
      </Container>

      {/* External Link Section */}
      <Container maxW="container.xl" py={8}>
        <Card bg={cardBg} shadow="lg" border="1px" borderColor={borderColor}>
          <CardBody textAlign="center">
            <VStack spacing={4}>
              <Icon as={FaExternalLinkAlt} boxSize={8} color="blue.500" />
              <Heading size="md">外部イベントリスト</Heading>
              <Text color="gray.600">
                より多くのマラソンイベントを確認できます
              </Text>
              <Button
                as="a"
                href="https://games.athleteranking.com/gamepref.php"
                target="_blank"
                rel="noopener noreferrer"
                colorScheme="teal"
                size="lg"
                leftIcon={<FaExternalLinkAlt />}
                rightIcon={<FaExternalLinkAlt />}
              >
                AthleteRanking.com で見る
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}