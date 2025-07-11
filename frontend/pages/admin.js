import React, { useEffect, useState } from 'react';
import { Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, Spinner, Alert, AlertIcon, Stack, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, FormControl, FormLabel, Input } from '@chakra-ui/react';
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

  // Modal state for Users
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ username: '', email: '', membershipStatus: '', phone: '' });
  // Modal state for Events
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({ name: '', date: '', location: '', status: '' });
  // Modal state for Ads
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [adForm, setAdForm] = useState({ title: '', content: '', imageUrl: '', link: '', startDate: '', endDate: '' });

  // Error states for modals (must be at top level)
  const [userError, setUserError] = useState('');
  const [eventError, setEventError] = useState('');
  const [adError, setAdError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsAdmin(false);
      return;
    }
    api.get('/user/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setIsAdmin(res.data.membershipStatus === 'admin' ? true : false);
        if (res.data.membershipStatus !== 'admin') {
          router.replace('/'); // or show an error
        }
      })
      .catch(() => {
        setIsAdmin(false);
        router.replace('/');
      });
  }, []);

  const fetchData = async (type) => {
    setLoading(true);
    setError('');
    try {
      if (type === 'users') {
        const res = await api.get('/admin/users', { headers: getAuthHeader() });
        setUsers(res.data || []);
      } else if (type === 'events') {
        const res = await api.get('/admin/events', { headers: getAuthHeader() });
        setEvents(res.data || []);
      } else if (type === 'ads') {
        const res = await api.get('/admin/ads', { headers: getAuthHeader() });
        setAds(res.data || []);
      }
    } catch (err) {
      setError('データの取得に失敗しました');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (tab === 0) fetchData('users');
    if (tab === 1) fetchData('events');
    if (tab === 2) fetchData('ads');
    // eslint-disable-next-line
  }, [tab]);

  if (isAdmin === null) {
    return <Spinner />; // or loading indicator
  }
  if (!isAdmin) {
    return <Box p={8} textAlign="center"><Alert status="error">管理者のみアクセス可能です。</Alert></Box>;
  }

  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

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
      setUserError('Username, email, and password are required.');
      return;
    }
    try {
      if (editingUser) {
        await api.post('/admin/users/update', { id: editingUser.id, ...userForm }, { headers: getAuthHeader() });
      } else {
        await api.post('/admin/users/create', userForm, { headers: getAuthHeader() });
      }
      closeUserModal();
      fetchData('users');
    } catch (err) {
      setUserError(err.response?.data?.message || 'Failed to save user.');
    }
  };
  const handleDeleteUser = async (id) => {
    await api.post('/admin/users/delete', { id }, { headers: getAuthHeader() });
    fetchData('users');
  };

  // Event CRUD handlers
  const openEditEventModal = (event) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name || '',
      date: event.date || '',
      location: event.location || '',
      status: event.status || '',
      description: event.description || '',
      imageUrl: event.imageUrl || '',
    });
    setIsEventModalOpen(true);
  };
  const openCreateEventModal = () => {
    setEditingEvent(null);
    setEventForm({ name: '', date: '', location: '', status: '', description: '', imageUrl: '' });
    setIsEventModalOpen(true);
  };
  const closeEventModal = () => setIsEventModalOpen(false);
  const handleSaveEvent = async () => {
    setEventError('');
    if (!eventForm.name || !eventForm.date) {
      setEventError('Event name and date are required.');
      return;
    }
    try {
      if (editingEvent) {
        await api.post('/admin/events/update', { id: editingEvent.id, ...eventForm }, { headers: getAuthHeader() });
      } else {
        await api.post('/admin/events/create', eventForm, { headers: getAuthHeader() });
      }
      closeEventModal();
      fetchData('events');
    } catch (err) {
      setEventError(err.response?.data?.message || 'Failed to save event.');
    }
  };
  const handleDeleteEvent = async (id) => {
    await api.post('/admin/events/delete', { id }, { headers: getAuthHeader() });
    fetchData('events');
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
      setAdError('Ad title is required.');
      return;
    }
    try {
      if (editingAd) {
        await api.post('/admin/ads/update', { id: editingAd.id, ...adForm }, { headers: getAuthHeader() });
      } else {
        await api.post('/admin/ads/create', adForm, { headers: getAuthHeader() });
      }
      closeAdModal();
      fetchData('ads');
    } catch (err) {
      setAdError(err.response?.data?.message || 'Failed to save ad.');
    }
  };
  const handleDeleteAd = async (id) => {
    await api.post('/admin/ads/delete', { id }, { headers: getAuthHeader() });
    fetchData('ads');
  };

  return (
    <Box maxW="1100px" mx="auto" p={{ base: 4, md: 8 }}>
      <Heading as="h1" size="xl" mb={8} textAlign="center">Admin Dashboard</Heading>
      <Tabs index={tab} onChange={setTab} variant="enclosed">
        <TabList>
          <Tab>Users</Tab>
          <Tab>Events</Tab>
          <Tab>Ads</Tab>
        </TabList>
        <TabPanels>
          {/* Users Tab */}
          <TabPanel>
            {loading ? <Spinner /> : error ? (
              <Alert status="error" mb={4}><AlertIcon />{error}</Alert>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm" textAlign="center" colorScheme='gray'>
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Membership</Th>
                      <Th>Phone</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map(user => (
                      <Tr key={user.id}>
                        <Td>{user.id}</Td>
                        <Td>{user.username || user.name}</Td>
                        <Td>{user.email}</Td>
                        <Td>{user.membershipStatus}</Td>
                        <Td>{user.phone}</Td>
                        <Td>{user.address}</Td>
                        <Td>
                          <Button size="xs" colorScheme="blue" onClick={() => openEditUserModal(user)}>Edit</Button>
                          <Button size="xs" colorScheme="red" ml={2} onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                <Button colorScheme='blue' marginTop="10px" size='sm' mt={4} onClick={openCreateUserModal}>Add User</Button>
                {users.length === 0 && <Text color="gray.500" mt={4}>No users found.</Text>}
              </Box>
            )}
            {/* User Modal */}
            <Modal isOpen={isUserModalOpen} onClose={closeUserModal}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>{editingUser ? 'Edit User' : 'Add User'}</ModalHeader>
                <ModalBody>
                  <FormControl mb={3}>
                    <FormLabel>Name</FormLabel>
                    <Input value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Email</FormLabel>
                    <Input value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Membership</FormLabel>
                    <Input value={userForm.membershipStatus} onChange={e => setUserForm({ ...userForm, membershipStatus: e.target.value })} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Phone</FormLabel>
                    <Input value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Address</FormLabel>
                    <Input value={userForm.address} onChange={e => setUserForm({ ...userForm, address: e.target.value })} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Password</FormLabel>
                    <Input value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
                  </FormControl>
                </ModalBody>
                {userError && <Text color="red.500" mb={2}>{userError}</Text>}
                <ModalFooter>
                  <Button colorScheme="blue" onClick={handleSaveUser}>Save</Button>
                  <Button ml={3} onClick={closeUserModal}>Cancel</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </TabPanel>
          {/* Events Tab */}
          <TabPanel>
            {loading ? <Spinner /> : error ? (
              <Alert status="error" mb={4}><AlertIcon />{error}</Alert>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm" textAlign="center" border="1px solid #000" colorScheme='gray'>
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Name</Th>
                      <Th>description</Th>
                      <Th>date</Th>
                      <Th>applyDeadline</Th>
                      <Th>location</Th>
                      <Th>imageUrl</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {events.map(event => (
                      <Tr key={event.id}>
                        <Td>{event.id}</Td>
                        <Td>{event.name}</Td>
                        <Td>{event.description}</Td>
                        <Td>{event.date}</Td>
                        <Td>{event.applyDeadline}</Td>
                        <Td>{event.location}</Td>
                        <Td>{event.imageUrl}</Td>
                        <Td>
                          <Button size="xs" colorScheme="blue" onClick={() => openEditEventModal(event)}>Edit</Button>
                          <Button size="xs" colorScheme="red" ml={2} onClick={() => handleDeleteEvent(event.id)}>Delete</Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                <Button colorScheme='blue' marginTop="10px" size='sm' mt={4} onClick={openCreateEventModal}>Add Event</Button>
                {events.length === 0 && <Text color="gray.500" mt={4}>No events found.</Text>}
              </Box>
            )}
            {/* Event Modal */}
            <Modal isOpen={isEventModalOpen} onClose={closeEventModal}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>{editingEvent ? 'Edit Event' : 'Add Event'}</ModalHeader>
                <ModalBody>
                  <FormControl mb={3}>
                    <FormLabel>Name</FormLabel>
                    <Input value={eventForm.name} onChange={e => setEventForm({ ...eventForm, name: e.target.value })} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Description</FormLabel>
                    <Input value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Date</FormLabel>
                    <Input value={eventForm.date} type="date" onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Apply Deadline</FormLabel>
                    <Input value={eventForm.applyDeadline} type="date" onChange={e => setEventForm({ ...eventForm, applyDeadline: e.target.value })} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Location</FormLabel>
                    <Input value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Image URL</FormLabel>
                    <Input value={eventForm.imageUrl} onChange={e => setEventForm({ ...eventForm, imageUrl: e.target.value })} />
                  </FormControl>
                </ModalBody>
                {eventError && <Text color="red.500" mb={2}>{eventError}</Text>}
                <ModalFooter>
                  <Button colorScheme="blue" onClick={handleSaveEvent}>Save</Button>
                  <Button ml={3} onClick={closeEventModal}>Cancel</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </TabPanel>
          {/* Ads Tab */}
          <TabPanel>
            {loading ? <Spinner /> : error ? (
              <Alert status="error" mb={4}><AlertIcon />{error}</Alert>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm" textAlign="center" border="1px solid #000" colorScheme='gray'>
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Title</Th>
                      <Th>Content</Th>
                      <Th>imageUrl</Th>
                      <Th>link</Th>
                      <Th>startDate</Th>
                      <Th>endDate</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {ads.map(ad => (
                      <Tr key={ad.id}>
                        <Td>{ad.id}</Td>
                        <Td>{ad.title}</Td>
                        <Td>{ad.content}</Td>
                        <Td>{ad.imageUrl}</Td>
                        <Td>{ad.link}</Td>
                        <Td>{ad.startDate}</Td>
                        <Td>{ad.endDate}</Td>
                        <Td>
                          <Button size="xs" colorScheme="blue" onClick={() => openEditAdModal(ad)}>Edit</Button>
                          <Button size="xs" colorScheme="red" ml={2} onClick={() => handleDeleteAd(ad.id)}>Delete</Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                <Button colorScheme='blue' marginTop="10px" size='sm' mt={4} onClick={openCreateAdModal}>Add Ad</Button>
                {ads.length === 0 && <Text color="gray.500" mt={4}>No ads found.</Text>}
              </Box>
            )}
            {/* Ad Modal */}
            <Modal isOpen={isAdModalOpen} onClose={closeAdModal}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>{editingAd ? 'Edit Ad' : 'Add Ad'}</ModalHeader>
                <ModalBody>
                  <FormControl mb={3}>
                    <FormLabel>Title</FormLabel>
                    <Input value={adForm.title} onChange={e => setAdForm({ ...adForm, title: e.target.value })} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Content</FormLabel>
                    <Input value={adForm.content} onChange={e => setAdForm({ ...adForm, content: e.target.value })} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Image URL</FormLabel>
                    <Input value={adForm.imageUrl} onChange={e => setAdForm({ ...adForm, imageUrl: e.target.value })} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Link</FormLabel>
                    <Input value={adForm.link} onChange={e => setAdForm({ ...adForm, link: e.target.value })} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>Start Date</FormLabel>
                    <Input value={adForm.startDate} type="date" onChange={e => setAdForm({ ...adForm, startDate: e.target.value })} />
                  </FormControl>
                  <FormControl mb={3}>
                    <FormLabel>End Date</FormLabel>
                    <Input value={adForm.endDate} type="date" onChange={e => setAdForm({ ...adForm, endDate: e.target.value })} />
                  </FormControl>
                </ModalBody>
                {adError && <Text color="red.500" mb={2}>{adError}</Text>}
                <ModalFooter>
                  <Button colorScheme="blue" onClick={handleSaveAd}>Save</Button>
                  <Button ml={3} onClick={closeAdModal}>Cancel</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdminDashboard; 