export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'owner' | 'admin';
  verified: boolean;
}

export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    role: 'user',
    verified: true,
  },
  {
    id: 'owner1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 9876543211',
    role: 'owner',
    verified: true,
  },
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@parkwise.com',
    phone: '+91 9876543299',
    role: 'admin',
    verified: true,
  },
  {
    id: 'owner2',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 9876543212',
    role: 'owner',
    verified: true,
  },
  {
    id: 'owner3',
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91 9876543213',
    role: 'owner',
    verified: true,
  },
  {
    id: 'user2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+91 9876543220',
    role: 'user',
    verified: true,
  },
  {
    id: 'user3',
    name: 'Ravi Kumar',
    email: 'ravi@example.com',
    phone: '+91 9876543221',
    role: 'user',
    verified: false,
  },
];

