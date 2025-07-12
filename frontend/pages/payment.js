import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  useToast,
  Alert,
  AlertIcon,
  Divider,
  Badge,
  List,
  ListItem,
  ListIcon,
  Card,
  CardBody,
  CardHeader,
  Container,
  Spinner,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { FaCheck, FaStar } from 'react-icons/fa';
import api from '../utils/api';

// Load Stripe (replace with your publishable key)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RjxW74Nxj4bqqLClaa7S6IYrq44bN5BXWHxlPnrDZrDpMa6Xh3PILPvy1UtmR5IM61V6NfTxPF02IEaeMM40CKJ00GgSYsd9Yprod_SfMRccDD1QlpiD');

// Payment form component
function PaymentForm({ pricing, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const paymentIntentResponse = await api.post('/payment/create-payment-intent', {
        amount: pricing.premium.price,
        currency: pricing.premium.currency
      });

      const { clientSecret, paymentIntentId } = paymentIntentResponse.data;

      // Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            // Add default billing details to avoid postal code issues
            address: {
              postal_code: '12345' // Default postal code for testing
            }
          }
        }
      });

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment with our backend
        await api.post('/payment/confirm-payment', {
          paymentIntentId: paymentIntentId
        });

        toast({
          title: 'Payment successful!',
          description: 'Your membership has been upgraded to Premium.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false, // Show postal code field
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            Payment Information
          </Text>
          <Box
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            p={4}
            bg="white"
          >
            <CardElement options={cardElementOptions} />
          </Box>
        </Box>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Payment Error!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        )}

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          isLoading={loading}
          loadingText="Processing Payment..."
          disabled={!stripe}
        >
          Pay ¥{pricing.premium.price.toLocaleString()}
        </Button>

        <Text fontSize="sm" color="gray.500" textAlign="center">
          Your payment is secure and encrypted. We use Stripe to process payments.
        </Text>
        <Box p={4} bg="blue.50" borderRadius="md">
          <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={2}>
            🧪 Test Card Information:
          </Text>
          <Text fontSize="xs" color="blue.600">
            Card: 4242 4242 4242 4242 | Expiry: Any future date | CVC: Any 3 digits
          </Text>
        </Box>
      </VStack>
    </form>
  );
}

// Main payment page component
export default function PaymentPage() {
  const [membershipStatus, setMembershipStatus] = useState('free');
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile (token will be automatically included by api utility)
        const profileRes = await api.get('/user/profile');
        setMembershipStatus(profileRes.data.membershipStatus);

        // Fetch pricing information
        const pricingRes = await api.get('/payment/pricing');
        setPricing(pricingRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          // Not logged in, redirect to login
          router.push('/login');
          return;
        }
        setError('Failed to load payment information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handlePaymentSuccess = () => {
    setMembershipStatus('paid');
    // Optionally redirect to home page after a delay
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Container>
    );
  }

  if (membershipStatus === 'paid') {
    return (
      <Container maxW="container.md" py={10}>
        <Card>
          <CardBody textAlign="center">
            <FaStar size="4em" color="gold" style={{ marginBottom: '1rem' }} />
            <Heading size="lg" mb={4}>Premium Member</Heading>
            <Text fontSize="lg" color="green.500" mb={4}>
              You are already a Premium member!
            </Text>
            <Button colorScheme="blue" onClick={() => router.push('/')}>
              Go to Home
            </Button>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading size="xl" mb={4}>Upgrade to Premium</Heading>
          <Text fontSize="lg" color="gray.600">
            Unlock premium features and get notified about upcoming events
          </Text>
        </Box>

        <Flex direction={{ base: 'column', lg: 'row' }} gap={8} w="full">
          {/* Pricing Card */}
          <Card flex={1}>
            <CardHeader>
              <Heading size="md" textAlign="center">Premium Membership</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <Box textAlign="center">
                  <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                    ¥{pricing?.premium?.price?.toLocaleString()}
                  </Text>
                  <Text color="gray.500">per year</Text>
                </Box>

                <Divider />

                <List spacing={3}>
                  {pricing?.premium?.features?.map((feature, index) => (
                    <ListItem key={index}>
                      <ListIcon as={FaCheck} color="green.500" />
                      {feature}
                    </ListItem>
                  ))}
                </List>

                <Badge colorScheme="green" p={2} borderRadius="md">
                  Most Popular
                </Badge>
              </VStack>
            </CardBody>
          </Card>

          {/* Payment Form */}
          <Card flex={1}>
            <CardHeader>
              <Heading size="md">Payment Details</Heading>
            </CardHeader>
            <CardBody>
              {pricing && (
                <Elements stripe={stripePromise}>
                  <PaymentForm 
                    pricing={pricing} 
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              )}
            </CardBody>
          </Card>
        </Flex>

        {/* Security Notice */}
        <Box textAlign="center" maxW="md">
          <Text fontSize="sm" color="gray.500">
            🔒 Your payment information is secure. We use industry-standard SSL encryption 
            and never store your card details on our servers.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}