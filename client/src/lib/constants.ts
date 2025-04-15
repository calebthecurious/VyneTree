// Relationship tier definitions and configurations
export const RELATIONSHIP_TIERS = {
  Intimate: {
    color: '#ef4444', // red-500
    neglectThreshold: 14, // days
    maxContacts: 5,
    nodeSize: 20
  },
  Best: {
    color: '#f59e0b', // amber-500
    neglectThreshold: 30, // days
    maxContacts: 15,
    nodeSize: 18
  },
  Good: {
    color: '#10b981', // emerald-500 
    neglectThreshold: 60, // days
    maxContacts: 30,
    nodeSize: 15
  },
  Tribe: {
    color: '#3b82f6', // blue-500
    neglectThreshold: 90, // days
    maxContacts: 100,
    nodeSize: 12
  }
};

// Event types and their styling
export const EVENT_TYPES = {
  coffee: {
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-100',
    textColor: 'text-primary-700',
    icon: 'bx-coffee'
  },
  lunch: {
    bgColor: 'bg-secondary-50',
    borderColor: 'border-secondary-100',
    textColor: 'text-secondary-700',
    icon: 'bx-food-menu'
  },
  call: {
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    textColor: 'text-amber-700',
    icon: 'bx-phone'
  },
  meeting: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    textColor: 'text-blue-700',
    icon: 'bx-calendar'
  },
  default: {
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-700',
    icon: 'bx-calendar'
  }
};

// Predefined time slots for coffee chats
export const AVAILABLE_SLOTS = [
  { day: 'Tue', time: '2:00 PM' },
  { day: 'Tue', time: '4:00 PM' },
  { day: 'Thu', time: '10:00 AM' },
  { day: 'Thu', time: '3:00 PM' },
  { day: 'Fri', time: '11:00 AM' },
];

// AI Nudge types and their configuration
export const NUDGE_TYPES = {
  Reminder: {
    actionButtons: ['call', 'message', 'schedule'],
    priority: 'high',
    icon: 'bx-bell'
  },
  Conversation: {
    actionButtons: ['message', 'coffee', 'gift'],
    priority: 'medium',
    icon: 'bx-chat'
  }
};

// Demo user data for testing
export const DEMO_USER_ID = 1;
