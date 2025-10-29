import { User, Evidence, ActivityLog } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    username: 'admin',
    password: 'admin123',
    role: 'administrator',
    lastActivity: '2024-01-15 10:30'
  },
  {
    id: '2',
    name: 'Tergovchi Aliyev',
    username: 'tergovchi1',
    password: 'tergovchi123',
    role: 'tergovchi',
    lastActivity: '2024-01-15 09:15'
  },
  {
    id: '3',
    name: 'Rahbar Karimov',
    username: 'rahbar1',
    password: 'rahbar123',
    role: 'rahbariyat',
    lastActivity: '2024-01-15 11:45'
  }
];

export const mockEvidence: Evidence[] = [
  {
    id: '1',
    evidenceNumber: 'DL-2024-001',
    eventDetails: 'Oʻgʻirlik hodisasi boʻyicha ashyoviy dalil',
    belongsTo: 'Ahmadov Bobur',
    items: 'Oltin uzuk, kumush soat',
    value: '5000000',
    receivedDate: '2024-01-10',
    receivedBy: 'Tergovchi Aliyev',
    storageLocation: 'Omborxona A-15',
    enteredBy: 'tergovchi1',
    images: [],
    storageDeadline: '2024-06-10',
    storageType: 'specific_date',
    status: 'active',
    createdAt: '2024-01-10 14:30'
  },
  {
    id: '2',
    evidenceNumber: 'DL-2024-002',
    eventDetails: 'Firibgarlik ishi boʻyicha hujjatlar',
    belongsTo: 'Karimova Malika',
    items: 'Soxta hujjatlar, kompyuter',
    value: 'mavjud emas',
    receivedDate: '2024-01-12',
    receivedBy: 'Tergovchi Aliyev',
    storageLocation: 'Omborxona B-08',
    enteredBy: 'tergovchi1',
    images: [],
    storageDeadline: '2024-02-15',
    storageType: 'specific_date',
    status: 'active',
    createdAt: '2024-01-12 16:20'
  }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    userId: '2',
    action: 'Yangi ashyoviy dalil qoʻshildi',
    evidenceId: '1',
    timestamp: '2024-01-10 14:30'
  },
  {
    id: '2',
    userId: '2',
    action: 'Yangi ashyoviy dalil qoʻshildi',
    evidenceId: '2',
    timestamp: '2024-01-12 16:20'
  }
];