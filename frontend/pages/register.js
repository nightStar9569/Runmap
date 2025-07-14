import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Link,
  VStack,
  HStack,
  useToast,
  Container,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Icon,
  useColorModeValue,
  useBreakpointValue,
  Image,
  Badge,
  Flex,
  Spinner,
  IconButton,
  Tooltip,
  Progress,
  Grid,
  GridItem
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { 
  FaEye, 
  FaEyeSlash, 
  FaEnvelope, 
  FaLock, 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt,
  FaUserPlus,
  FaRunning,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaStar
} from 'react-icons/fa';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const usernameRef = useRef(null);
  const toast = useToast();

  // Responsive design values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  // Calculate form completion progress
  const formFields = [username, email, password, phone, address];
  const completedFields = formFields.filter(field => field.trim() !== '').length;
  const progressPercentage = (completedFields / formFields.length) * 100;

  const validate = () => {
    if (!username) return 'ユーザー名が必要です';
    if (username.length < 3) return 'ユーザー名は3文字以上で入力してください';
    if (!email) return 'メールアドレスが必要です';
    if (!/\S+@\S+\.\S+/.test(email)) return '有効なメールアドレスを入力してください';
    if (!password) return 'パスワードが必要です';
    if (password.length < 8) return 'パスワードは8文字以上で入力してください';
    if (phone && !/^\+?\d{7,15}$/.test(phone)) return '有効な電話番号を入力してください';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      if (usernameRef.current) usernameRef.current.focus();
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', { username, email, password, phone, address });
      setSuccess('登録に成功しました！ログインできます。');
      toast({ 
        title: '登録に成功しました！', 
        description: 'ログインページに移動します',
        status: 'success', 
        duration: 3000, 
        isClosable: true 
      });
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg={bgColor} py={{ base: 4, md: 8 }}>
      <Container maxW="container.lg">
        <VStack spacing={8}>
          {/* Header Section */}
          <VStack spacing={4} textAlign="center" maxW="2xl">
            <Flex align="center" gap={3}>
              <Box position="relative">
                <Image 
                  src="/image/_1.png" 
                  alt="RunMap Logo" 
                  boxSize={{ base: "48px", md: "64px" }} 
                  borderRadius="full"
                  border="3px"
                  borderColor="blue.500"
                />
                <Badge 
                  position="absolute" 
                  top="-2" 
                  right="-2" 
                  colorScheme="green" 
                  variant="solid" 
                  size="sm"
                  borderRadius="full"
                >
                  <Icon as={FaRunning} boxSize={2} />
                </Badge>
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size={{ base: "lg", md: "xl" }} color="blue.600" fontWeight="bold">
                  RunMap
                </Heading>
                <Text fontSize={{ base: "sm", md: "md" }} color={mutedTextColor} fontWeight="medium">
                  マラソン大会検索サイト
                </Text>
              </VStack>
            </Flex>
            <Text fontSize={{ base: "lg", md: "xl" }} color={textColor} fontWeight="medium">
              新規アカウント作成
            </Text>
            <Text color={mutedTextColor} maxW="md">
              RunMapのアカウントを作成して、マラソン大会の検索やお気に入り機能を利用しましょう
            </Text>
          </VStack>

          {/* Registration Form */}
          <Card 
            bg={cardBg} 
            shadow="xl" 
            border="1px" 
            borderColor={borderColor}
            w="full"
            maxW="2xl"
            _hover={{ shadow: '2xl' }}
            transition="all 0.3s ease"
          >
            <CardHeader pb={4}>
              <VStack spacing={3}>
                <Icon as={FaUserPlus} boxSize={8} color="blue.500" />
                <Heading size="md" color={textColor}>アカウント情報</Heading>
                <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                  以下の情報を入力してアカウントを作成してください
                </Text>
                
                {/* Progress Bar */}
                <VStack spacing={2} w="full">
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color={mutedTextColor}>フォーム完成度</Text>
                    <Text fontSize="sm" fontWeight="medium" color="blue.500">
                      {Math.round(progressPercentage)}%
                    </Text>
                  </HStack>
                  <Progress 
                    value={progressPercentage} 
                    colorScheme="blue" 
                    size="sm" 
                    borderRadius="full"
                    w="full"
                  />
                </VStack>
              </VStack>
            </CardHeader>
            
            <CardBody pt={0}>
              <form onSubmit={handleSubmit} autoComplete="on">
                <VStack spacing={6}>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} w="full">
                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel color={textColor} fontWeight="medium">
                          ユーザー名
                        </FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Icon as={FaUser} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            ref={usernameRef}
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="ユーザー名を入力"
                            size="lg"
                            bg="white"
                            borderColor={borderColor}
                            _focus={{ 
                              borderColor: 'blue.500', 
                              boxShadow: '0 0 0 1px #3182ce',
                              bg: 'white'
                            }}
                            _hover={{ borderColor: 'blue.300' }}
                            autoFocus
                          />
                        </InputGroup>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel color={textColor} fontWeight="medium">
                          メールアドレス
                        </FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Icon as={FaEnvelope} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            size="lg"
                            bg="white"
                            borderColor={borderColor}
                            _focus={{ 
                              borderColor: 'blue.500', 
                              boxShadow: '0 0 0 1px #3182ce',
                              bg: 'white'
                            }}
                            _hover={{ borderColor: 'blue.300' }}
                          />
                        </InputGroup>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <FormControl isRequired>
                    <FormLabel color={textColor} fontWeight="medium">
                      パスワード
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaLock} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="8文字以上で入力"
                        size="lg"
                        bg="white"
                        borderColor={borderColor}
                        _focus={{ 
                          borderColor: 'blue.500', 
                          boxShadow: '0 0 0 1px #3182ce',
                          bg: 'white'
                        }}
                        _hover={{ borderColor: 'blue.300' }}
                      />
                      <InputRightElement>
                        <Tooltip label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}>
                          <IconButton
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(v => !v)}
                            color="gray.500"
                            _hover={{ color: 'blue.500' }}
                          />
                        </Tooltip>
                      </InputRightElement>
                    </InputGroup>
                    <Text fontSize="xs" color={mutedTextColor} mt={1}>
                      パスワードは8文字以上で、英数字を含めてください
                    </Text>
                  </FormControl>

                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} w="full">
                    <GridItem>
                      <FormControl>
                        <FormLabel color={textColor} fontWeight="medium">
                          電話番号（任意）
                        </FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Icon as={FaPhone} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="090-1234-5678"
                            size="lg"
                            bg="white"
                            borderColor={borderColor}
                            _focus={{ 
                              borderColor: 'blue.500', 
                              boxShadow: '0 0 0 1px #3182ce',
                              bg: 'white'
                            }}
                            _hover={{ borderColor: 'blue.300' }}
                          />
                        </InputGroup>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel color={textColor} fontWeight="medium">
                          住所（任意）
                        </FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Icon as={FaMapMarkerAlt} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            type="text"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder="東京都渋谷区..."
                            size="lg"
                            bg="white"
                            borderColor={borderColor}
                            _focus={{ 
                              borderColor: 'blue.500', 
                              boxShadow: '0 0 0 1px #3182ce',
                              bg: 'white'
                            }}
                            _hover={{ borderColor: 'blue.300' }}
                          />
                        </InputGroup>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  {error && (
                    <Alert 
                      status="error" 
                      borderRadius="lg"
                      variant="subtle"
                      border="1px"
                      borderColor="red.200"
                    >
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="medium">登録エラー</Text>
                        <Text fontSize="sm">{error}</Text>
                      </Box>
                    </Alert>
                  )}

                  {success && (
                    <Alert 
                      status="success" 
                      borderRadius="lg"
                      variant="subtle"
                      border="1px"
                      borderColor="green.200"
                    >
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="medium">登録成功</Text>
                        <Text fontSize="sm">{success}</Text>
                      </Box>
                    </Alert>
                  )}

                  <Button
                    colorScheme="blue"
                    type="submit"
                    size="lg"
                    w="full"
                    isLoading={loading}
                    loadingText="登録中..."
                    leftIcon={loading ? <Spinner size="sm" /> : <FaUserPlus />}
                    rightIcon={!loading && <FaArrowRight />}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.2s"
                  >
                    アカウントを作成
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Login Link */}
          <Card 
            bg={cardBg} 
            shadow="md" 
            border="1px" 
            borderColor={borderColor}
            w="full"
            maxW="2xl"
          >
            <CardBody textAlign="center">
              <VStack spacing={3}>
                <Text color={mutedTextColor}>
                  すでにアカウントをお持ちの方は
                </Text>
                <Button
                  as={NextLink}
                  href="/login"
                  colorScheme="teal"
                  variant="outline"
                  size="lg"
                  w="full"
                  leftIcon={<FaUser />}
                  _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                  transition="all 0.2s"
                >
                  ログイン
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Benefits Section */}
          <VStack spacing={6} maxW="4xl" w="full">
            <Heading size="md" color={textColor} textAlign="center">
              アカウント作成のメリット
            </Heading>
            
            <Grid 
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} 
              gap={6} 
              w="full"
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
                <VStack spacing={4}>
                  <Icon as={FaStar} boxSize={8} color="yellow.500" />
                  <Text fontWeight="bold" color={textColor}>お気に入り機能</Text>
                  <Text fontSize="sm" color={mutedTextColor}>
                    気になるマラソン大会をお気に入りに登録して、いつでも確認できます
                  </Text>
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
                <VStack spacing={4}>
                  <Icon as={FaCheckCircle} boxSize={8} color="green.500" />
                  <Text fontWeight="bold" color={textColor}>申込管理</Text>
                  <Text fontSize="sm" color={mutedTextColor}>
                    申し込んだ大会を管理し、申込状況を簡単に確認できます
                  </Text>
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
                <VStack spacing={4}>
                  <Icon as={FaShieldAlt} boxSize={8} color="blue.500" />
                  <Text fontWeight="bold" color={textColor}>セキュリティ</Text>
                  <Text fontSize="sm" color={mutedTextColor}>
                    安全なアカウント管理で、あなたの情報を保護します
                  </Text>
                </VStack>
              </Card>
            </Grid>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
} 