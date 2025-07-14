import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import { fontFamily } from '../utils/fonts';
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
  Icon,
  useColorModeValue,
  useBreakpointValue,
  Image,
  Badge,
  Flex,
  Spinner,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { 
  FaEye, 
  FaEyeSlash, 
  FaEnvelope, 
  FaLock, 
  FaSignInAlt, 
  FaUserPlus, 
  FaRunning,
  FaShieldAlt,
  FaMobile,
  FaDesktop,
  FaHeart,
  FaBell
} from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  // Responsive design values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  const validate = () => {
    if (!email) return 'メールアドレスが必要です';
    if (!/\S+@\S+\.\S+/.test(email)) return '有効なメールアドレスを入力してください';
    if (!password) return 'パスワードが必要です';
    if (password.length < 8) return 'パスワードは8文字以上で入力してください';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('isLoggedIn', 'true');
      toast({ 
        title: 'ログインに成功しました！', 
        description: 'RunMapへようこそ！',
        status: 'success', 
        duration: 3000, 
        isClosable: true 
      });
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'ログインに失敗しました');
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
                <Heading size={{ base: "lg", md: "xl" }} color="blue.600" fontWeight="bold" fontFamily={fontFamily.heading}>
                  RunMap
                </Heading>
                <Text fontSize={{ base: "sm", md: "md" }} color={mutedTextColor} fontWeight="medium" fontFamily={fontFamily.body}>
                  マラソン大会検索サイト
                </Text>
              </VStack>
            </Flex>
            <Text fontSize={{ base: "lg", md: "xl" }} color={textColor} fontWeight="medium" fontFamily={fontFamily.heading}>
              アカウントにログイン
            </Text>
            <Text color={mutedTextColor} maxW="md" fontFamily={fontFamily.body}>
              マラソン大会の検索、お気に入り登録、通知機能を利用するにはログインしてください
            </Text>
          </VStack>

          {/* Login Form */}
          <Card 
            bg={cardBg} 
            shadow="xl" 
            border="1px" 
            borderColor={borderColor}
            w="full"
            maxW="md"
            _hover={{ shadow: '2xl' }}
            transition="all 0.3s ease"
          >
            <CardHeader pb={4}>
              <VStack spacing={2}>
                <Icon as={FaSignInAlt} boxSize={8} color="blue.500" />
                <Heading size="md" color={textColor} fontFamily={fontFamily.heading}>ログイン</Heading>
                <Text fontSize="sm" color={mutedTextColor} textAlign="center" fontFamily={fontFamily.body}>
                  メールアドレスとパスワードを入力してください
                </Text>
              </VStack>
            </CardHeader>
            
            <CardBody pt={0}>
              <form onSubmit={handleSubmit} autoComplete="on">
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel color={textColor} fontWeight="medium" fontFamily={fontFamily.body}>
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
                        autoFocus
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color={textColor} fontWeight="medium" fontFamily={fontFamily.body}>
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
                        placeholder="パスワードを入力"
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
                  </FormControl>

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
                        <Text fontWeight="medium">ログインエラー</Text>
                        <Text fontSize="sm">{error}</Text>
                      </Box>
                    </Alert>
                  )}

                  <Button
                    colorScheme="blue"
                    type="submit"
                    size="lg"
                    w="full"
                    isLoading={loading}
                    loadingText="ログイン中..."
                    leftIcon={loading ? <Spinner size="sm" /> : <FaSignInAlt />}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.2s"
                  >
                    ログイン
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Registration Link */}
          <Card 
            bg={cardBg} 
            shadow="md" 
            border="1px" 
            borderColor={borderColor}
            w="full"
            maxW="md"
          >
            <CardBody textAlign="center">
              <VStack spacing={3}>
                <Text color={mutedTextColor}>
                  アカウントをお持ちでない方は
                </Text>
                <Button
                  as={NextLink}
                  href="/register"
                  colorScheme="teal"
                  variant="outline"
                  size="lg"
                  w="full"
                  leftIcon={<FaUserPlus />}
                  _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                  transition="all 0.2s"
                >
                  新規登録
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Features Section */}
          <VStack spacing={6} maxW="4xl" w="full">
            <Heading size="md" color={textColor} textAlign="center" fontFamily={fontFamily.heading}>
              ログインすると利用できる機能
            </Heading>
            
            <HStack 
              spacing={6} 
              wrap="wrap" 
              justify="center"
              w="full"
            >
              <Card 
                bg={cardBg} 
                shadow="md" 
                border="1px" 
                borderColor={borderColor}
                p={4}
                minW={{ base: "full", sm: "200px" }}
                textAlign="center"
                _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                transition="all 0.3s ease"
              >
                <VStack spacing={3}>
                  <Icon as={FaHeart} boxSize={6} color="red.500" />
                  <Text fontWeight="medium" color={textColor}>お気に入り登録</Text>
                  <Text fontSize="sm" color={mutedTextColor}>
                    気になる大会をお気に入りに登録
                  </Text>
                </VStack>
              </Card>

              <Card 
                bg={cardBg} 
                shadow="md" 
                border="1px" 
                borderColor={borderColor}
                p={4}
                minW={{ base: "full", sm: "200px" }}
                textAlign="center"
                _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                transition="all 0.3s ease"
              >
                <VStack spacing={3}>
                  <Icon as={FaBell} boxSize={6} color="blue.500" />
                  <Text fontWeight="medium" color={textColor}>通知機能</Text>
                  <Text fontSize="sm" color={mutedTextColor}>
                    大会の申込締切や開始日を通知
                  </Text>
                </VStack>
              </Card>

              <Card 
                bg={cardBg} 
                shadow="md" 
                border="1px" 
                borderColor={borderColor}
                p={4}
                minW={{ base: "full", sm: "200px" }}
                textAlign="center"
                _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                transition="all 0.3s ease"
              >
                <VStack spacing={3}>
                  <Icon as={FaShieldAlt} boxSize={6} color="green.500" />
                  <Text fontWeight="medium" color={textColor}>セキュリティ</Text>
                  <Text fontSize="sm" color={mutedTextColor}>
                    安全なアカウント管理
                  </Text>
                </VStack>
              </Card>
            </HStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
} 