import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Heading, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Spinner, 
  Alert, 
  AlertIcon, 
  Stack, 
  Text, 
  Button, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  FormControl, 
  FormLabel, 
  Input,
  VStack,
  HStack,
  Container,
  useColorModeValue,
  useBreakpointValue,
  Icon,
  Image,
  Badge,
  Flex,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  CardHeader,
  Divider,
  InputGroup,
  InputLeftElement,
  IconButton,
  Tooltip,
  AlertTitle,
  AlertDescription,
  Select,
  Textarea,
  useToast,
  ButtonGroup
} from '@chakra-ui/react';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaAd, 
  FaCog, 
  FaRunning, 
  FaUserPlus, 
  FaEdit, 
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes,
  FaShieldAlt,
  FaChartLine,
  FaBell,
  FaHeart,
  FaExternalLinkAlt,
  FaCalendar,
  FaMapMarkerAlt,
  FaImage,
  FaLink,
  FaEnvelope,
  FaPhone,
  FaMapPin,
  FaCrown,
  FaUser,
  FaArrowRight
} from 'react-icons/fa';
import api from '../utils/api';
import { useRouter } from 'next/router';

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const toast = useToast();

  // Responsive design values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  // Modal state for Users
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ username: '', email: '', membershipStatus: '', phone: '', address: '', password: '' });
  // Modal state for Events
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({ name: '', date: '', location: '', description: '', applyDeadline: '', imageUrl: '' });
  // Modal state for Ads
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [adForm, setAdForm] = useState({ title: '', content: '', imageUrl: '', link: '', startDate: '', endDate: '' });

  // Error states for modals (must be at top level)
  const [userError, setUserError] = useState('');
  const [eventError, setEventError] = useState('');
  const [adError, setAdError] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Separate pagination for each tab
  const [userPage, setUserPage] = useState(1);
  const [eventPage, setEventPage] = useState(1);
  const [adPage, setAdPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [eventTotalPages, setEventTotalPages] = useState(1);
  const [adTotalPages, setAdTotalPages] = useState(1);
  const [userTotalItems, setUserTotalItems] = useState(0);
  const [eventTotalItems, setEventTotalItems] = useState(0);
  const [adTotalItems, setAdTotalItems] = useState(0);

  // Helper to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Check admin status first
  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsAdmin(false);
        return;
      }
      
      try {
        const res = await api.get('/user/profile', { headers: { Authorization: `Bearer ${token}` } });
        const isAdminUser = res.data.membershipStatus === 'admin';
        setIsAdmin(isAdminUser);
        
        if (!isAdminUser) {
          router.replace('/');
        }
      } catch (err) {
        setIsAdmin(false);
        router.replace('/');
      }
    };
    
    checkAdminStatus();
  }, [router]);

  const fetchData = async (type) => {
    if (!isAdmin) return; // Don't fetch if not admin
    
    setLoading(true);
    setError('');
    try {
      if (type === 'users') {
        const res = await api.get(`/admin/users?page=${userPage}&limit=${itemsPerPage}`, { headers: getAuthHeader() });
        setUsers(res.data.data || []);
        setUserTotalItems(res.data.totalItems || 0);
        setUserTotalPages(res.data.totalPages || 1);
      } else if (type === 'events') {
        const res = await api.get(`/admin/events?page=${eventPage}&limit=${itemsPerPage}`, { headers: getAuthHeader() });
        setEvents(res.data.data || []);
        setEventTotalItems(res.data.totalItems || 0);
        setEventTotalPages(res.data.totalPages || 1);
      } else if (type === 'ads') {
        const res = await api.get(`/admin/ads?page=${adPage}&limit=${itemsPerPage}`, { headers: getAuthHeader() });
        setAds(res.data.data || []);
        setAdTotalItems(res.data.totalItems || 0);
        setAdTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when admin status is confirmed and tab changes
  useEffect(() => {
    if (isAdmin === true) { // Only fetch when admin status is confirmed
      if (tab === 0) fetchData('users');
      if (tab === 1) fetchData('events');
      if (tab === 2) fetchData('ads');
    }
  }, [tab, isAdmin, userPage, eventPage, adPage, itemsPerPage]);

  // Calculate stats
  const totalUsers = userTotalItems;
  const totalEvents = eventTotalItems;
  const totalAds = adTotalItems;
  const premiumUsers = users.filter(user => user.membershipStatus === 'paid').length;
  const activeEvents = events.filter(event => new Date(event.date) > new Date()).length;

  // Pagination handlers
  const handlePageChange = (newPage, type) => {
    if (type === 'users') {
      setUserPage(newPage);
    } else if (type === 'events') {
      setEventPage(newPage);
    } else if (type === 'ads') {
      setAdPage(newPage);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    // Reset to first page when changing items per page
    setUserPage(1);
    setEventPage(1);
    setAdPage(1);
  };

  if (isAdmin === null) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" align="center" justify="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color={mutedTextColor}>認証中...</Text>
        </VStack>
      </Box>
    );
  }
  
  if (!isAdmin) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" align="center" justify="center">
        <Container maxW="container.md">
          <Alert 
            status="error" 
            borderRadius="lg"
            variant="subtle"
            border="1px"
            borderColor="red.200"
          >
            <AlertIcon />
            <Box>
              <AlertTitle>アクセス拒否</AlertTitle>
              <AlertDescription>管理者のみアクセス可能です。</AlertDescription>
            </Box>
          </Alert>
        </Container>
      </Box>
    );
  }

  // User CRUD handlers
  const openEditUserModal = (user) => {
    setEditingUser(user);
    setUserForm({
      username: user.username || '',
      email: user.email || '',
      membershipStatus: user.membershipStatus || '',
      phone: user.phone || '',
      address: user.address || '',
      password: '', // Do not prefill password
    });
    setIsUserModalOpen(true);
  };
  const openCreateUserModal = () => {
    setEditingUser(null);
    setUserForm({ username: '', email: '', membershipStatus: '', phone: '', address: '', password: '' });
    setIsUserModalOpen(true);
  };
  const closeUserModal = () => setIsUserModalOpen(false);
  const handleSaveUser = async () => {
    setUserError('');
    if (!userForm.username || !userForm.email || (!editingUser && !userForm.password)) {
      setUserError('ユーザー名、メールアドレス、パスワードは必須です。');
      return;
    }
    try {
      if (editingUser) {
        await api.post('/admin/users/update', { id: editingUser.id, ...userForm }, { headers: getAuthHeader() });
        toast({
          title: 'ユーザーを更新しました',
          status: 'success',
          duration: 3000,
        });
      } else {
        await api.post('/admin/users/create', userForm, { headers: getAuthHeader() });
        toast({
          title: 'ユーザーを作成しました',
          status: 'success',
          duration: 3000,
        });
      }
      closeUserModal();
      fetchData('users');
    } catch (err) {
      setUserError(err.response?.data?.message || 'ユーザーの保存に失敗しました。');
    }
  };
  const handleDeleteUser = async (id) => {
    if (window.confirm('このユーザーを削除しますか？')) {
      await api.post('/admin/users/delete', { id }, { headers: getAuthHeader() });
      toast({
        title: 'ユーザーを削除しました',
        status: 'info',
        duration: 3000,
      });
      fetchData('users');
    }
  };

  // Event CRUD handlers
  const openEditEventModal = (event) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name || '',
      date: event.date || '',
      location: event.location || '',
      description: event.description || '',
      applyDeadline: event.applyDeadline || '',
      imageUrl: event.imageUrl || '',
    });
    setIsEventModalOpen(true);
  };
  const openCreateEventModal = () => {
    setEditingEvent(null);
    setEventForm({ name: '', date: '', location: '', description: '', applyDeadline: '', imageUrl: '' });
    setIsEventModalOpen(true);
  };
  const closeEventModal = () => setIsEventModalOpen(false);
  const handleSaveEvent = async () => {
    setEventError('');
    if (!eventForm.name || !eventForm.date) {
      setEventError('イベント名と日付は必須です。');
      return;
    }
    try {
      if (editingEvent) {
        await api.post('/admin/events/update', { id: editingEvent.id, ...eventForm }, { headers: getAuthHeader() });
        toast({
          title: 'イベントを更新しました',
          status: 'success',
          duration: 3000,
        });
      } else {
        await api.post('/admin/events/create', eventForm, { headers: getAuthHeader() });
        toast({
          title: 'イベントを作成しました',
          status: 'success',
          duration: 3000,
        });
      }
      closeEventModal();
      fetchData('events');
    } catch (err) {
      setEventError(err.response?.data?.message || 'イベントの保存に失敗しました。');
    }
  };
  const handleDeleteEvent = async (id) => {
    if (window.confirm('このイベントを削除しますか？')) {
      await api.post('/admin/events/delete', { id }, { headers: getAuthHeader() });
      toast({
        title: 'イベントを削除しました',
        status: 'info',
        duration: 3000,
      });
      fetchData('events');
    }
  };

  // Ad CRUD handlers
  const openEditAdModal = (ad) => {
    setEditingAd(ad);
    setAdForm({
      title: ad.title || '',
      content: ad.content || '',
      imageUrl: ad.imageUrl || '',
      link: ad.link || '',
      startDate: ad.startDate || '',
      endDate: ad.endDate || '',
    });
    setIsAdModalOpen(true);
  };
  const openCreateAdModal = () => {
    setEditingAd(null);
    setAdForm({ title: '', content: '', imageUrl: '', link: '', startDate: '', endDate: '' });
    setIsAdModalOpen(true);
  };
  const closeAdModal = () => setIsAdModalOpen(false);
  const handleSaveAd = async () => {
    setAdError('');
    if (!adForm.title) {
      setAdError('広告タイトルは必須です。');
      return;
    }
    try {
      if (editingAd) {
        await api.post('/admin/ads/update', { id: editingAd.id, ...adForm }, { headers: getAuthHeader() });
        toast({
          title: '広告を更新しました',
          status: 'success',
          duration: 3000,
        });
      } else {
        await api.post('/admin/ads/create', adForm, { headers: getAuthHeader() });
        toast({
          title: '広告を作成しました',
          status: 'success',
          duration: 3000,
        });
      }
      closeAdModal();
      fetchData('ads');
    } catch (err) {
      setAdError(err.response?.data?.message || '広告の保存に失敗しました。');
    }
  };
  const handleDeleteAd = async (id) => {
    if (window.confirm('この広告を削除しますか？')) {
      await api.post('/admin/ads/delete', { id }, { headers: getAuthHeader() });
      toast({
        title: '広告を削除しました',
        status: 'info',
        duration: 3000,
      });
      fetchData('ads');
    }
  };

  return (
    <Box minH="100vh" bg={bgColor} py={{ base: 4, md: 8 }}>
      <Container maxW="container.xl">
        <VStack spacing={8}>
          {/* Header Section */}
          <VStack spacing={4} textAlign="center" maxW="2xl">
            <Flex align="center" gap={3}>
              <Box position="relative">
                <Icon as={FaShieldAlt} boxSize={{ base: "48px", md: "64px" }} color="purple.500" />
                <Badge 
                  position="absolute" 
                  top="-2" 
                  right="-2" 
                  colorScheme="purple" 
                  variant="solid" 
                  size="sm"
                  borderRadius="full"
                >
                  <Icon as={FaCog} boxSize={2} />
                </Badge>
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size={{ base: "lg", md: "xl" }} color="purple.600" fontWeight="bold">
                  管理者ダッシュボード
                </Heading>
                <Text fontSize={{ base: "sm", md: "md" }} color={mutedTextColor} fontWeight="medium">
                  RunMap 管理システム
                </Text>
              </VStack>
            </Flex>
            <Text fontSize={{ base: "md", md: "lg" }} color={mutedTextColor} maxW="md">
              ユーザー、イベント、広告の管理とシステム監視
            </Text>
          </VStack>

          {/* Stats Overview */}
          <Grid 
            templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} 
            gap={6} 
            w="full"
            maxW="6xl"
          >
            <Card 
              bg={cardBg} 
              shadow="md" 
              border="1px" 
              borderColor={borderColor}
              p={6}
              textAlign="center"
              _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
              transition="all 0.3s ease"
            >
              <VStack spacing={3}>
                <Icon as={FaUsers} boxSize={8} color="blue.500" />
                <Stat>
                  <StatNumber color="blue.500">{totalUsers}</StatNumber>
                  <StatLabel color={mutedTextColor}>総ユーザー数</StatLabel>
                </Stat>
              </VStack>
            </Card>

            <Card 
              bg={cardBg} 
              shadow="md" 
              border="1px" 
              borderColor={borderColor}
              p={6}
              textAlign="center"
              _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
              transition="all 0.3s ease"
            >
              <VStack spacing={3}>
                <Icon as={FaCrown} boxSize={8} color="green.500" />
                <Stat>
                  <StatNumber color="green.500">{premiumUsers}</StatNumber>
                  <StatLabel color={mutedTextColor}>プレミアム会員</StatLabel>
                </Stat>
              </VStack>
            </Card>

            <Card 
              bg={cardBg} 
              shadow="md" 
              border="1px" 
              borderColor={borderColor}
              p={6}
              textAlign="center"
              _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
              transition="all 0.3s ease"
            >
              <VStack spacing={3}>
                <Icon as={FaCalendarAlt} boxSize={8} color="orange.500" />
                <Stat>
                  <StatNumber color="orange.500">{totalEvents}</StatNumber>
                  <StatLabel color={mutedTextColor}>総イベント数</StatLabel>
                </Stat>
              </VStack>
            </Card>

            <Card 
              bg={cardBg} 
              shadow="md" 
              border="1px" 
              borderColor={borderColor}
              p={6}
              textAlign="center"
              _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
              transition="all 0.3s ease"
            >
              <VStack spacing={3}>
                <Icon as={FaAd} boxSize={8} color="purple.500" />
                <Stat>
                  <StatNumber color="purple.500">{totalAds}</StatNumber>
                  <StatLabel color={mutedTextColor}>総広告数</StatLabel>
                </Stat>
              </VStack>
            </Card>
          </Grid>

          {/* Main Dashboard */}
          <Card 
            bg={cardBg} 
            shadow="xl" 
            border="1px" 
            borderColor={borderColor}
            w="full"
            _hover={{ shadow: '2xl' }}
            transition="all 0.3s ease"
          >
            <CardHeader pb={4}>
              <VStack spacing={2}>
                <Icon as={FaCog} boxSize={8} color="purple.500" />
                <Heading size="md" color={textColor}>管理パネル</Heading>
                <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                  システムの各要素を管理します
                </Text>
              </VStack>
            </CardHeader>
            
            <CardBody pt={0}>
              <Tabs index={tab} onChange={setTab} variant="enclosed" colorScheme="purple">
                <TabList>
                  <Tab>
                    <HStack spacing={2}>
                      <Icon as={FaUsers} />
                      <Text>ユーザー管理</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <Icon as={FaCalendarAlt} />
                      <Text>イベント管理</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <Icon as={FaAd} />
                      <Text>広告管理</Text>
                    </HStack>
                  </Tab>
                </TabList>
                
                <TabPanels>
                  {/* Users Tab */}
                  <TabPanel>
                    {loading ? (
                      <VStack spacing={4} py={8}>
                        <Spinner size="xl" color="blue.500" />
                        <Text color={mutedTextColor}>データを読み込み中...</Text>
                      </VStack>
                    ) : error ? (
                      <Alert 
                        status="error" 
                        mb={4}
                        borderRadius="lg"
                        variant="subtle"
                        border="1px"
                        borderColor="red.200"
                      >
                        <AlertIcon />
                        <Box>
                          <AlertTitle>エラーが発生しました</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Box>
                      </Alert>
                    ) : (
                      <VStack spacing={6} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="md" color={textColor}>ユーザー一覧</Heading>
                          <Button
                            colorScheme="blue"
                            size="sm"
                            leftIcon={<FaUserPlus />}
                            onClick={openCreateUserModal}
                            _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                            transition="all 0.2s"
                          >
                            ユーザー追加
                          </Button>
                        </HStack>
                        
                        <Box overflowX="auto">
                          <Table variant="simple" size="sm" colorScheme="gray">
                            <Thead>
                              <Tr>
                                <Th>ID</Th>
                                <Th>名前</Th>
                                <Th>メールアドレス</Th>
                                <Th>メンバーシップ</Th>
                                <Th>電話番号</Th>
                                <Th>住所</Th>
                                <Th>操作</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {users.map(user => (
                                <Tr key={user.id} _hover={{ bg: 'gray.50' }}>
                                  <Td>{user.id}</Td>
                                  <Td fontWeight="medium">{user.username || user.name}</Td>
                                  <Td>{user.email}</Td>
                                  <Td>
                                    <Badge 
                                      colorScheme={
                                        user.membershipStatus === 'paid' ? 'green' : 
                                        user.membershipStatus === 'admin' ? 'purple' : 'gray'
                                      } 
                                      variant="subtle"
                                    >
                                      {user.membershipStatus}
                                    </Badge>
                                  </Td>
                                  <Td>{user.phone || '-'}</Td>
                                  <Td>{user.address || '-'}</Td>
                                  <Td>
                                    <HStack spacing={2}>
                                      <IconButton
                                        size="sm"
                                        colorScheme="blue"
                                        icon={<FaEdit />}
                                        onClick={() => openEditUserModal(user)}
                                        aria-label="編集"
                                      />
                                      <IconButton
                                        size="sm"
                                        colorScheme="red"
                                        icon={<FaTrash />}
                                        onClick={() => handleDeleteUser(user.id)}
                                        aria-label="削除"
                                      />
                                    </HStack>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                        
                        {users.length === 0 && (
                          <VStack spacing={4} py={8}>
                            <Icon as={FaUsers} boxSize={12} color="gray.400" />
                            <Text color={mutedTextColor}>ユーザーが見つかりませんでした。</Text>
                          </VStack>
                        )}

                        {/* Pagination */}
                        {userTotalPages > 1 && (
                          <VStack spacing={4} pt={6}>
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" color={mutedTextColor}>
                                表示中: {((userPage - 1) * itemsPerPage) + 1} - {Math.min(userPage * itemsPerPage, userTotalItems)} / {userTotalItems}件
                              </Text>
                              <HStack spacing={2}>
                                <Text fontSize="sm" color={mutedTextColor}>表示件数:</Text>
                                <Select
                                  size="sm"
                                  value={itemsPerPage}
                                  onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                                  w="80px"
                                >
                                  <option value={5}>5</option>
                                  <option value={10}>10</option>
                                  <option value={20}>20</option>
                                  <option value={50}>50</option>
                                </Select>
                              </HStack>
                            </HStack>
                            
                            <ButtonGroup size="sm" isAttached variant="outline">
                              <Button
                                onClick={() => handlePageChange(userPage - 1, 'users')}
                                isDisabled={userPage === 1}
                                leftIcon={<Icon as={FaArrowRight} transform="rotate(180deg)" />}
                              >
                                前へ
                              </Button>
                              
                              {Array.from({ length: Math.min(5, userTotalPages) }, (_, i) => {
                                const pageNum = Math.max(1, Math.min(userTotalPages - 4, userPage - 2)) + i;
                                if (pageNum > userTotalPages) return null;
                                
                                return (
                                  <Button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum, 'users')}
                                    colorScheme={pageNum === userPage ? 'blue' : 'gray'}
                                    variant={pageNum === userPage ? 'solid' : 'outline'}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                              
                              <Button
                                onClick={() => handlePageChange(userPage + 1, 'users')}
                                isDisabled={userPage === userTotalPages}
                                rightIcon={<Icon as={FaArrowRight} />}
                              >
                                次へ
                              </Button>
                            </ButtonGroup>
                          </VStack>
                        )}
                      </VStack>
                    )}

                    {/* User Modal */}
                    <Modal isOpen={isUserModalOpen} onClose={closeUserModal} size="lg">
                      <ModalOverlay />
                      <ModalContent>
                        <ModalHeader>
                          <HStack spacing={2}>
                            <Icon as={editingUser ? FaEdit : FaUserPlus} color="blue.500" />
                            <Text>{editingUser ? 'ユーザー編集' : 'ユーザー追加'}</Text>
                          </HStack>
                        </ModalHeader>
                        <ModalBody>
                          <VStack spacing={4}>
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">ユーザー名</FormLabel>
                              <InputGroup>
                                <InputLeftElement>
                                  <Icon as={FaUser} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                  value={userForm.username}
                                  onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                                  placeholder="ユーザー名を入力"
                                />
                              </InputGroup>
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">メールアドレス</FormLabel>
                              <InputGroup>
                                <InputLeftElement>
                                  <Icon as={FaEnvelope} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                  value={userForm.email}
                                  onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                  placeholder="example@email.com"
                                />
                              </InputGroup>
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">メンバーシップ</FormLabel>
                              <Select
                                value={userForm.membershipStatus}
                                onChange={e => setUserForm({ ...userForm, membershipStatus: e.target.value })}
                              >
                                <option value="">選択してください</option>
                                <option value="free">無料会員</option>
                                <option value="paid">プレミアム会員</option>
                                <option value="admin">管理者</option>
                              </Select>
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">電話番号</FormLabel>
                              <InputGroup>
                                <InputLeftElement>
                                  <Icon as={FaPhone} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                  value={userForm.phone}
                                  onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                                  placeholder="090-1234-5678"
                                />
                              </InputGroup>
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">住所</FormLabel>
                              <InputGroup>
                                <InputLeftElement>
                                  <Icon as={FaMapPin} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                  value={userForm.address}
                                  onChange={e => setUserForm({ ...userForm, address: e.target.value })}
                                  placeholder="東京都渋谷区..."
                                />
                              </InputGroup>
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">
                                {editingUser ? '新しいパスワード（変更しない場合は空欄）' : 'パスワード'}
                              </FormLabel>
                              <Input
                                type="password"
                                value={userForm.password}
                                onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                placeholder="パスワードを入力"
                              />
                            </FormControl>
                          </VStack>
                        </ModalBody>
                        {userError && (
                          <Alert status="error" mx={6} mb={4} borderRadius="md">
                            <AlertIcon />
                            {userError}
                          </Alert>
                        )}
                        <ModalFooter>
                          <Button colorScheme="blue" onClick={handleSaveUser} leftIcon={<FaSave />}>
                            保存
                          </Button>
                          <Button ml={3} onClick={closeUserModal} leftIcon={<FaTimes />}>
                            キャンセル
                          </Button>
                        </ModalFooter>
                      </ModalContent>
                    </Modal>
                  </TabPanel>

                  {/* Events Tab */}
                  <TabPanel>
                    {loading ? (
                      <VStack spacing={4} py={8}>
                        <Spinner size="xl" color="orange.500" />
                        <Text color={mutedTextColor}>データを読み込み中...</Text>
                      </VStack>
                    ) : error ? (
                      <Alert 
                        status="error" 
                        mb={4}
                        borderRadius="lg"
                        variant="subtle"
                        border="1px"
                        borderColor="red.200"
                      >
                        <AlertIcon />
                        <Box>
                          <AlertTitle>エラーが発生しました</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Box>
                      </Alert>
                    ) : (
                      <VStack spacing={6} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="md" color={textColor}>イベント一覧</Heading>
                          <Button
                            colorScheme="orange"
                            size="sm"
                            leftIcon={<FaPlus />}
                            onClick={openCreateEventModal}
                            _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                            transition="all 0.2s"
                          >
                            イベント追加
                          </Button>
                        </HStack>
                        
                        <Box overflowX="auto">
                          <Table variant="simple" size="sm" colorScheme="gray">
                            <Thead>
                              <Tr>
                                <Th>ID</Th>
                                <Th>名前</Th>
                                <Th>説明</Th>
                                <Th>日付</Th>
                                <Th>申込締切</Th>
                                <Th>場所</Th>
                                <Th>操作</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {events.map(event => (
                                <Tr key={event.id} _hover={{ bg: 'gray.50' }}>
                                  <Td>{event.id}</Td>
                                  <Td fontWeight="medium">{event.name}</Td>
                                  <Td maxW="200px" noOfLines={2}>{event.description}</Td>
                                  <Td>{event.date?.slice(0, 10)}</Td>
                                  <Td>{event.applyDeadline?.slice(0, 10)}</Td>
                                  <Td>{event.location}</Td>
                                  <Td>
                                    <HStack spacing={2}>
                                      <IconButton
                                        size="sm"
                                        colorScheme="blue"
                                        icon={<FaEdit />}
                                        onClick={() => openEditEventModal(event)}
                                        aria-label="編集"
                                      />
                                      <IconButton
                                        size="sm"
                                        colorScheme="red"
                                        icon={<FaTrash />}
                                        onClick={() => handleDeleteEvent(event.id)}
                                        aria-label="削除"
                                      />
                                    </HStack>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                        
                        {events.length === 0 && (
                          <VStack spacing={4} py={8}>
                            <Icon as={FaCalendarAlt} boxSize={12} color="gray.400" />
                            <Text color={mutedTextColor}>イベントが見つかりませんでした。</Text>
                          </VStack>
                        )}

                        {/* Pagination */}
                        {eventTotalPages > 1 && (
                          <VStack spacing={4} pt={6}>
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" color={mutedTextColor}>
                                表示中: {((eventPage - 1) * itemsPerPage) + 1} - {Math.min(eventPage * itemsPerPage, eventTotalItems)} / {eventTotalItems}件
                              </Text>
                              <HStack spacing={2}>
                                <Text fontSize="sm" color={mutedTextColor}>表示件数:</Text>
                                <Select
                                  size="sm"
                                  value={itemsPerPage}
                                  onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                                  w="80px"
                                >
                                  <option value={5}>5</option>
                                  <option value={10}>10</option>
                                  <option value={20}>20</option>
                                  <option value={50}>50</option>
                                </Select>
                              </HStack>
                            </HStack>
                            
                            <ButtonGroup size="sm" isAttached variant="outline">
                              <Button
                                onClick={() => handlePageChange(eventPage - 1, 'events')}
                                isDisabled={eventPage === 1}
                                leftIcon={<Icon as={FaArrowRight} transform="rotate(180deg)" />}
                              >
                                前へ
                              </Button>
                              
                              {Array.from({ length: Math.min(5, eventTotalPages) }, (_, i) => {
                                const pageNum = Math.max(1, Math.min(eventTotalPages - 4, eventPage - 2)) + i;
                                if (pageNum > eventTotalPages) return null;
                                
                                return (
                                  <Button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum, 'events')}
                                    colorScheme={pageNum === eventPage ? 'blue' : 'gray'}
                                    variant={pageNum === eventPage ? 'solid' : 'outline'}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                              
                              <Button
                                onClick={() => handlePageChange(eventPage + 1, 'events')}
                                isDisabled={eventPage === eventTotalPages}
                                rightIcon={<Icon as={FaArrowRight} />}
                              >
                                次へ
                              </Button>
                            </ButtonGroup>
                          </VStack>
                        )}
                      </VStack>
                    )}

                    {/* Event Modal */}
                    <Modal isOpen={isEventModalOpen} onClose={closeEventModal} size="lg">
                      <ModalOverlay />
                      <ModalContent>
                        <ModalHeader>
                          <HStack spacing={2}>
                            <Icon as={editingEvent ? FaEdit : FaPlus} color="orange.500" />
                            <Text>{editingEvent ? 'イベント編集' : 'イベント追加'}</Text>
                          </HStack>
                        </ModalHeader>
                        <ModalBody>
                          <VStack spacing={4}>
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">イベント名</FormLabel>
                              <Input
                                value={eventForm.name}
                                onChange={e => setEventForm({ ...eventForm, name: e.target.value })}
                                placeholder="イベント名を入力"
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">説明</FormLabel>
                              <Textarea
                                value={eventForm.description}
                                onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                                placeholder="イベントの説明を入力"
                                rows={3}
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">開催日</FormLabel>
                              <Input
                                type="date"
                                value={eventForm.date}
                                onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">申込締切</FormLabel>
                              <Input
                                type="date"
                                value={eventForm.applyDeadline}
                                onChange={e => setEventForm({ ...eventForm, applyDeadline: e.target.value })}
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">場所</FormLabel>
                              <InputGroup>
                                <InputLeftElement>
                                  <Icon as={FaMapMarkerAlt} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                  value={eventForm.location}
                                  onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                                  placeholder="開催場所を入力"
                                />
                              </InputGroup>
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">画像URL</FormLabel>
                              <InputGroup>
                                <InputLeftElement>
                                  <Icon as={FaImage} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                  value={eventForm.imageUrl}
                                  onChange={e => setEventForm({ ...eventForm, imageUrl: e.target.value })}
                                  placeholder="画像URLを入力"
                                />
                              </InputGroup>
                            </FormControl>
                          </VStack>
                        </ModalBody>
                        {eventError && (
                          <Alert status="error" mx={6} mb={4} borderRadius="md">
                            <AlertIcon />
                            {eventError}
                          </Alert>
                        )}
                        <ModalFooter>
                          <Button colorScheme="orange" onClick={handleSaveEvent} leftIcon={<FaSave />}>
                            保存
                          </Button>
                          <Button ml={3} onClick={closeEventModal} leftIcon={<FaTimes />}>
                            キャンセル
                          </Button>
                        </ModalFooter>
                      </ModalContent>
                    </Modal>
                  </TabPanel>

                  {/* Ads Tab */}
                  <TabPanel>
                    {loading ? (
                      <VStack spacing={4} py={8}>
                        <Spinner size="xl" color="purple.500" />
                        <Text color={mutedTextColor}>データを読み込み中...</Text>
                      </VStack>
                    ) : error ? (
                      <Alert 
                        status="error" 
                        mb={4}
                        borderRadius="lg"
                        variant="subtle"
                        border="1px"
                        borderColor="red.200"
                      >
                        <AlertIcon />
                        <Box>
                          <AlertTitle>エラーが発生しました</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Box>
                      </Alert>
                    ) : (
                      <VStack spacing={6} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="md" color={textColor}>広告一覧</Heading>
                          <Button
                            colorScheme="purple"
                            size="sm"
                            leftIcon={<FaPlus />}
                            onClick={openCreateAdModal}
                            _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                            transition="all 0.2s"
                          >
                            広告追加
                          </Button>
                        </HStack>
                        
                        <Box overflowX="auto">
                          <Table variant="simple" size="sm" colorScheme="gray">
                            <Thead>
                              <Tr>
                                <Th>ID</Th>
                                <Th>タイトル</Th>
                                <Th>内容</Th>
                                <Th>開始日</Th>
                                <Th>終了日</Th>
                                <Th>操作</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {ads.map(ad => (
                                <Tr key={ad.id} _hover={{ bg: 'gray.50' }}>
                                  <Td>{ad.id}</Td>
                                  <Td fontWeight="medium">{ad.title}</Td>
                                  <Td maxW="200px" noOfLines={2}>{ad.content}</Td>
                                  <Td>{ad.startDate?.slice(0, 10)}</Td>
                                  <Td>{ad.endDate?.slice(0, 10)}</Td>
                                  <Td>
                                    <HStack spacing={2}>
                                      <IconButton
                                        size="sm"
                                        colorScheme="blue"
                                        icon={<FaEdit />}
                                        onClick={() => openEditAdModal(ad)}
                                        aria-label="編集"
                                      />
                                      <IconButton
                                        size="sm"
                                        colorScheme="red"
                                        icon={<FaTrash />}
                                        onClick={() => handleDeleteAd(ad.id)}
                                        aria-label="削除"
                                      />
                                    </HStack>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                        
                        {ads.length === 0 && (
                          <VStack spacing={4} py={8}>
                            <Icon as={FaAd} boxSize={12} color="gray.400" />
                            <Text color={mutedTextColor}>広告が見つかりませんでした。</Text>
                          </VStack>
                        )}

                        {/* Pagination */}
                        {adTotalPages > 1 && (
                          <VStack spacing={4} pt={6}>
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" color={mutedTextColor}>
                                表示中: {((adPage - 1) * itemsPerPage) + 1} - {Math.min(adPage * itemsPerPage, adTotalItems)} / {adTotalItems}件
                              </Text>
                              <HStack spacing={2}>
                                <Text fontSize="sm" color={mutedTextColor}>表示件数:</Text>
                                <Select
                                  size="sm"
                                  value={itemsPerPage}
                                  onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                                  w="80px"
                                >
                                  <option value={5}>5</option>
                                  <option value={10}>10</option>
                                  <option value={20}>20</option>
                                  <option value={50}>50</option>
                                </Select>
                              </HStack>
                            </HStack>
                            
                            <ButtonGroup size="sm" isAttached variant="outline">
                              <Button
                                onClick={() => handlePageChange(adPage - 1, 'ads')}
                                isDisabled={adPage === 1}
                                leftIcon={<Icon as={FaArrowRight} transform="rotate(180deg)" />}
                              >
                                前へ
                              </Button>
                              
                              {Array.from({ length: Math.min(5, adTotalPages) }, (_, i) => {
                                const pageNum = Math.max(1, Math.min(adTotalPages - 4, adPage - 2)) + i;
                                if (pageNum > adTotalPages) return null;
                                
                                return (
                                  <Button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum, 'ads')}
                                    colorScheme={pageNum === adPage ? 'blue' : 'gray'}
                                    variant={pageNum === adPage ? 'solid' : 'outline'}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                              
                              <Button
                                onClick={() => handlePageChange(adPage + 1, 'ads')}
                                isDisabled={adPage === adTotalPages}
                                rightIcon={<Icon as={FaArrowRight} />}
                              >
                                次へ
                              </Button>
                            </ButtonGroup>
                          </VStack>
                        )}
                      </VStack>
                    )}

                    {/* Ad Modal */}
                    <Modal isOpen={isAdModalOpen} onClose={closeAdModal} size="lg">
                      <ModalOverlay />
                      <ModalContent>
                        <ModalHeader>
                          <HStack spacing={2}>
                            <Icon as={editingAd ? FaEdit : FaPlus} color="purple.500" />
                            <Text>{editingAd ? '広告編集' : '広告追加'}</Text>
                          </HStack>
                        </ModalHeader>
                        <ModalBody>
                          <VStack spacing={4}>
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">タイトル</FormLabel>
                              <Input
                                value={adForm.title}
                                onChange={e => setAdForm({ ...adForm, title: e.target.value })}
                                placeholder="広告タイトルを入力"
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">内容</FormLabel>
                              <Textarea
                                value={adForm.content}
                                onChange={e => setAdForm({ ...adForm, content: e.target.value })}
                                placeholder="広告の内容を入力"
                                rows={3}
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">画像URL</FormLabel>
                              <InputGroup>
                                <InputLeftElement>
                                  <Icon as={FaImage} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                  value={adForm.imageUrl}
                                  onChange={e => setAdForm({ ...adForm, imageUrl: e.target.value })}
                                  placeholder="画像URLを入力"
                                />
                              </InputGroup>
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">リンク</FormLabel>
                              <InputGroup>
                                <InputLeftElement>
                                  <Icon as={FaLink} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                  value={adForm.link}
                                  onChange={e => setAdForm({ ...adForm, link: e.target.value })}
                                  placeholder="リンクURLを入力"
                                />
                              </InputGroup>
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">開始日</FormLabel>
                              <Input
                                type="date"
                                value={adForm.startDate}
                                onChange={e => setAdForm({ ...adForm, startDate: e.target.value })}
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel color={textColor} fontWeight="medium">終了日</FormLabel>
                              <Input
                                type="date"
                                value={adForm.endDate}
                                onChange={e => setAdForm({ ...adForm, endDate: e.target.value })}
                              />
                            </FormControl>
                          </VStack>
                        </ModalBody>
                        {adError && (
                          <Alert status="error" mx={6} mb={4} borderRadius="md">
                            <AlertIcon />
                            {adError}
                          </Alert>
                        )}
                        <ModalFooter>
                          <Button colorScheme="purple" onClick={handleSaveAd} leftIcon={<FaSave />}>
                            保存
                          </Button>
                          <Button ml={3} onClick={closeAdModal} leftIcon={<FaTimes />}>
                            キャンセル
                          </Button>
                        </ModalFooter>
                      </ModalContent>
                    </Modal>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default AdminDashboard; 