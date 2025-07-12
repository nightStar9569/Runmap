import { Badge, Tooltip } from '@chakra-ui/react';
import { FaCrown, FaUser } from 'react-icons/fa';

export default function MembershipBadge({ membershipStatus, size = 'md' }) {
  const getBadgeProps = () => {
    switch (membershipStatus) {
      case 'paid':
        return {
          colorScheme: 'gold',
          icon: FaCrown,
          text: 'Premium',
          tooltip: 'Premium Member - Access to all features'
        };
      case 'admin':
        return {
          colorScheme: 'purple',
          icon: FaCrown,
          text: 'Admin',
          tooltip: 'Administrator - Full access'
        };
      default:
        return {
          colorScheme: 'gray',
          icon: FaUser,
          text: 'Free',
          tooltip: 'Free Member - Upgrade for premium features'
        };
    }
  };

  const { colorScheme, icon: Icon, text, tooltip } = getBadgeProps();

  return (
    <Tooltip label={tooltip} hasArrow>
      <Badge
        colorScheme={colorScheme}
        size={size}
        display="flex"
        alignItems="center"
        gap={1}
        px={2}
        py={1}
        borderRadius="full"
      >
        <Icon size="0.8em" />
        {text}
      </Badge>
    </Tooltip>
  );
} 