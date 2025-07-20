import { useState, useEffect, memo, useMemo } from "react";
import api from "../utils/api";
import { fontFamily } from "../utils/fonts";
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
  // Image,
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
  Skeleton,
  Image,
} from "@chakra-ui/react";
import Link from "next/link";
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
  FaClock,
} from "react-icons/fa";
import { useRouter } from "next/router";

import NextImage from "next/image";
import { motion } from 'framer-motion';

export default function Home() {
  const [cities, setCities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Memoized city image map for performance
  const cityImageMap = useMemo(
    () => ({
      北海道: "/image/hokkaido.png",
      青森県: "/image/aomori.png",
      岩手県: "/image/iwate.png",
      宮城県: "/image/miyagi.png",
      秋田県: "/image/akita.png",
      山形県: "/image/yamagata.png",
      福島県: "/image/fukushima.png",
      茨城県: "/image/ibaraki.png",
      栃木県: "/image/tochigi.png",
      群馬県: "/image/gunma.png",
      埼玉県: "/image/saitama.png",
      千葉県: "/image/chiba.png",
      東京都: "/image/tokyo.png",
      神奈川県: "/image/kanagawa.png",
      新潟県: "/image/niigata.png",
      富山県: "/image/toyama.png",
      石川県: "/image/ishikawa.png",
      福井県: "/image/fukui.png",
      山梨県: "/image/yamanashi.png",
      長野県: "/image/nagano.png",
      岐阜県: "/image/gifu.png",
      静岡県: "/image/shizuoka.png",
      愛知県: "/image/aichi.png",
      三重県: "/image/mie.png",
      滋賀県: "/image/shiga.png",
      京都府: "/image/kyoto.png",
      大阪府: "/image/osaka.png",
      兵庫県: "/image/hyogo.png",
      奈良県: "/image/nara.png",
      和歌山県: "/image/wakayama.png",
      鳥取県: "/image/tottori.png",
      島根県: "/image/shimane.png",
      岡山県: "/image/okayama.png",
      広島県: "/image/hiroshima.png",
      山口県: "/image/yamaguchi.png",
      徳島県: "/image/tokushima.png",
      香川県: "/image/kagawa.png",
      愛媛県: "/image/ehime.png",
      高知県: "/image/kochi.png",
      福岡県: "/image/fukuoka.png",
      佐賀県: "/image/saga.png",
      長崎県: "/image/nagasaki.png",
      熊本県: "/image/kumamoto.png",
      大分県: "/image/oita.png",
      宮崎県: "/image/miyazaki.png",
      鹿児島県: "/image/kagoshima.png",
      沖縄県: "/image/okinawa.png",
    }),
    []
  );
  const defaultCityImage = "/image/default_city.png";

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/admin/cities-grouped");
        setCities(res.data);
      } catch (err) {
        setError("都道府県リストの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  return (
    <div>
      <Box
        position="relative"
        width="100%"
        maxW="1900px"
        height="50%"
        mx="auto"
        mb={8}
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        aspectRatio={{ md: '5/1' }} // Chakra UI v2+ supports aspectRatio
        minH={{ base: '200px', md: '320px' }}
        bg="gray.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <NextImage
          src="/image/_1.png"
          alt="Banner Logo"
          layout="fill"
          objectFit="cover"
          priority
          quality={90}
        />
      </Box>
      <Box maxW="900px" mx="auto" mt={10} mb={20}>
        <Heading as="h2" size="lg" mb={6} textAlign={'center'}>
          都道府県別検索
        </Heading>
        <Text mb={4} textAlign={'center'}>ご覧になりたい都道府県をクリックしてください</Text>
        {loading ? (
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing={4}>
            {[...Array(12)].map((_, i) => (
              <Box key={i} p={2}>
                <Skeleton height="80px" borderRadius="md" />
              </Box>
            ))}
          </SimpleGrid>
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : (
          <VStack align="start" spacing={6} w="100%">
            {Object.keys(cities).map((region, regionIdx) => (
              <Box key={region} w="100%">
                <Text fontWeight="bold" mb={1}>
                  {region}
                </Text>
                <SimpleGrid
                  columns={{ base: 2, sm: 3, md: 4, lg: 6 }}
                  spacing={4}
                >
                  {cities[region].map((city, cityIdx) => (
                    <motion.div
                      key={city.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * cityIdx, duration: 0.5, type: 'spring' }}
                    >
                      <Link
                        href={{
                          pathname: "/events",
                          query: { cityId: city.id, cityName: city.name },
                        }}
                        passHref
                      >
                        <ChakraLink
                          display="block"
                          p={4}
                          borderRadius="lg"
                          boxShadow="md"
                          bg="white"
                          fontWeight="bold"
                          textAlign="center"
                          color="blue.600"
                          _hover={{
                            textDecoration: "none",
                            bg: "blue.50",
                            boxShadow: "xl",
                            transform: "scale(1.05)",
                          }}
                          transition="all 0.2s"
                        >
                          {city.name}
                        </ChakraLink>
                      </Link>
                    </motion.div>
                  ))}
                </SimpleGrid>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </div>
  );
}
