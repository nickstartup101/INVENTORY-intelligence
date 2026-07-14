import { Product, Liquid, Task, ActivityLog, Employee } from './types';

export const initialProducts: Product[] = [
  {
    id: '1',
    sku: 'C-001',
    name: 'Arabica Dark Roast (1kg)',
    category: 'Coffee Beans',
    currentStock: 45,
    unit: 'bags',
    status: 'OK',
    minThreshold: 10,
    icon: 'coffee',
  },
  {
    id: '2',
    sku: 'M-012',
    name: 'Meiji Whole Milk (1L)',
    category: 'Milk & Dairy',
    currentStock: 8,
    unit: 'units',
    status: 'LOW',
    minThreshold: 15,
    icon: 'water_drop',
  },
  {
    id: '3',
    sku: 'P-055',
    name: 'Paper Cups (8oz)',
    category: 'Packaging',
    currentStock: 520,
    unit: 'pcs',
    status: 'OK',
    minThreshold: 100,
    icon: 'shopping_bag',
  },
  {
    id: '4',
    sku: 'S-009',
    name: 'Caramel Sauce',
    category: 'Syrups & Sauces',
    currentStock: 3,
    unit: 'bottles',
    status: 'LOW',
    minThreshold: 5,
    icon: 'local_bar',
  },
];

export const initialLiquids: Liquid[] = [
  {
    id: 'l1',
    sku: 'MK-01',
    name: 'Meiji Fresh Milk',
    percentage: 42,
    status: 'OK',
  },
  {
    id: 'l2',
    sku: 'SY-04',
    name: 'Vanilla Syrup',
    percentage: 12,
    status: 'CRITICAL',
  },
  {
    id: 'l3',
    sku: 'HN-02',
    name: 'Organic Honey',
    percentage: 85,
    status: 'OK',
  },
];

export const initialTasks: Task[] = [
  {
    id: 't1',
    text: 'ກວດເຊັກຈຳນວນນົມໃນຕູ້',
    completed: true,
  },
  {
    id: 't2',
    text: 'ຕື່ມນ້ຳກ້ອນໃສ່ຖັງ',
    completed: false,
  },
  {
    id: 't3',
    text: 'ກວດວັນໝົດອາຍຸເຄັກ',
    completed: false,
  },
  {
    id: 't4',
    text: 'ທຳຄວາມສະອາດເຄື່ອງຊົງກາເຟ',
    completed: false,
  },
];

export const initialLogs: ActivityLog[] = [
  {
    id: 'log1',
    text: 'Somchai ເພີ່ມ Meiji Fresh Milk +12',
    time: '10:45 AM',
    type: 'success',
  },
  {
    id: 'log2',
    text: 'Vanh ເປີດຂວດ Vanilla Syrup ໃໝ່',
    time: '09:12 AM',
    type: 'info',
  },
  {
    id: 'log3',
    text: 'ລະບົບແຈ້ງເຕືອນ: Arabica Dark Roast ໃກ້ຈະໝົດ',
    time: '08:00 AM',
    type: 'warning',
  },
];

export const initialEmployees: Employee[] = [
  {
    id: 'emp1',
    name: 'Somchai',
    code: 'JD',
    role: 'Barista',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    clockInTime: '07:30 AM',
    pin: '111111',
  },
  {
    id: 'emp2',
    name: 'Alounny',
    code: 'AK',
    role: 'Cashier',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    clockInTime: '07:45 AM',
    pin: '222222',
  },
  {
    id: 'emp3',
    name: 'Soulikone',
    code: 'SL',
    role: 'Store Manager',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    clockInTime: '08:00 AM',
    pin: '333333',
  },
  {
    id: 'emp4',
    name: 'Vanh',
    code: 'VN',
    role: 'Barista',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    clockInTime: '08:15 AM',
    pin: '444444',
  },
  {
    id: 'emp5',
    name: 'Keo',
    code: 'KO',
    role: 'Assistant',
    status: 'inactive',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    pin: '555555',
  },
];
