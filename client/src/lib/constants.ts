export const DEMO_USER_ID = 1;

// Relationship tier definitions with styling for network visualization
export const RELATIONSHIP_TIERS = {
  'Intimate': {
    nodeSize: 16,
    color: '#f97316',  // orange-500
    label: 'Intimate Circle',
    interactionFrequency: 7,  // days
    description: 'Your closest relationships (1-5 people)'
  },
  'Best': {
    nodeSize: 14,
    color: '#06b6d4',  // cyan-500
    label: 'Best Friends',
    interactionFrequency: 30,  // days
    description: 'Your close friends (5-15 people)'
  },
  'Good': {
    nodeSize: 12,
    color: '#8b5cf6',  // violet-500
    label: 'Good Friends',
    interactionFrequency: 90,  // days
    description: 'Friends you enjoy (15-50 people)'
  },
  'Tribe': {
    nodeSize: 10,
    color: '#64748b',  // slate-500
    label: 'Tribe',
    interactionFrequency: 365,  // days
    description: 'Acquaintances (50-150 people)'
  }
};

// Event types with styling for calendar
export const EVENT_TYPES = {
  coffee: {
    label: 'Coffee',
    icon: 'bx-coffee',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    priority: 'medium',
  },
  lunch: {
    label: 'Lunch',
    icon: 'bx-food-menu',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    priority: 'medium',
  },
  call: {
    label: 'Call',
    icon: 'bx-phone',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    priority: 'low',
  },
  meeting: {
    label: 'Meeting',
    icon: 'bx-group',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    priority: 'high',
  },
  default: {
    label: 'Event',
    icon: 'bx-calendar',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-800',
    priority: 'low',
  },
};

// AI Nudge types with styling
export const NUDGE_TYPES = {
  Reminder: {
    label: 'Reminder',
    icon: 'bx-bell',
    color: '#ef4444',  // red-500
    description: 'A reminder to reach out to someone you haven\'t connected with in a while'
  },
  Conversation: {
    label: 'Conversation',
    icon: 'bx-bulb',
    color: '#3b82f6',  // blue-500
    description: 'AI-generated conversation topics based on your relationship history'
  }
};