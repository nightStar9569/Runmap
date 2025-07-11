import { Box, Heading, Text, Stack, FormControl, FormLabel, Input, Button, Divider, SimpleGrid, Card, CardBody, CardHeader, useToast, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const MyPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [profile, setProfile] = useState({});
  const [membership, setMembership] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  // Helper to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch profile and favorites
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('ログインが必要です');
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/user/profile', { headers: { Authorization: `Bearer ${token}` } });
        setProfile({
          name: res.data.username || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
        });
        setMembership(res.data.membershipStatus || 'free');
        // Only fetch favorites if paid
        if (res.data.membershipStatus === 'paid') {
          const favRes = await api.get('/user/favorites', { headers: { Authorization: `Bearer ${token}` } });
          setFavorites((favRes.data || []).map(f => f.Event || f));
        } else {
          setFavorites([]);
        }
      } catch (err) {
        setError('ユーザープロフィールの取得に失敗しました');
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        username: profile.name,
        email: profile.email,
        phone: profile.phone,
      };
      const res = await api.put('/user/profile/update', payload, { headers: getAuthHeader() });
      toast({ title: 'プロフィールが更新されました', status: 'success', duration: 2000, isClosable: true });
      // Optionally update membership if changed
      if (res.data.user && res.data.user.membershipStatus) {
        setMembership(res.data.user.membershipStatus);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'プロフィール更新に失敗しました');
    }
    setSaving(false);
  };

  if (loading) return <Box p={8} textAlign="center"><Spinner size="xl" /><Text mt={4}>読み込み中...</Text></Box>;

  return (
    <Box maxW="900px" mx="auto" p={{ base: 4, md: 8 }}>
      <Heading as="h1" size="xl" mb={8} textAlign="center">マイページ</Heading>
      <Stack spacing={8}>
        {/* Membership Status */}
        <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="md" bg="white">
          <Heading as="h2" size="md" mb={2}>メンバーシップステータス</Heading>
          <Text fontSize="lg" color={membership === 'paid' ? 'teal.600' : 'gray.500'} fontWeight="bold">
            {membership === 'paid' ? '有料会員' : '無料会員'}
          </Text>
        </Box>
        {/* Favorite Events (only for paid users) */}
        <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="md" bg="white">
          <Heading as="h2" size="md" mb={4}>お気に入りイベント</Heading>
          <Divider mb={4} />
          {membership !== 'paid' ? (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              お気に入りイベントは有料会員のみ利用できます。
            </Alert>
          ) : favorites.length === 0 ? (
            <Text color="gray.500">お気に入りイベントがありません。</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {favorites.map(event => (
                <Card key={event.id} borderWidth={1} borderRadius="md" boxShadow="sm" _hover={{ boxShadow: 'md', borderColor: 'teal.400' }}>
                  <CardHeader pb={0}>
                    <Heading as="h3" size="sm">{event.name}</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.600">日付: {event.date}</Text>
                    <Text fontSize="sm" color="gray.600">場所: {event.location}</Text>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Box>
        {/* Profile Management */}
        <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="md" bg="white">
          <Heading as="h2" size="md" mb={4}>プロフィール管理</Heading>
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />{error}
            </Alert>
          )}
          <form onSubmit={handleProfileSave}>
            <Stack spacing={4} maxW="400px">
              <FormControl>
                <FormLabel>名前</FormLabel>
                <Input name="name" value={profile.name} onChange={handleProfileChange} />
              </FormControl>
              <FormControl>
                <FormLabel>メールアドレス</FormLabel>
                <Input name="email" value={profile.email} onChange={handleProfileChange} />
              </FormControl>
              <FormControl>
                <FormLabel>電話番号</FormLabel>
                <Input name="phone" value={profile.phone} onChange={handleProfileChange} />
              </FormControl>
              <Button type="submit" colorScheme="teal" w="full" isLoading={saving}>保存</Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Box>
  );
};

export default MyPage; 