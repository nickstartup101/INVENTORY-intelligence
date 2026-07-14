export type ProductStatus = 'OK' | 'LOW' | 'OUT';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  status: ProductStatus;
  minThreshold: number;
  icon: string;
}

export interface Liquid {
  id: string;
  sku: string;
  name: string;
  percentage: number;
  status: 'OK' | 'LOW' | 'CRITICAL';
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export type LogType = 'success' | 'info' | 'warning' | 'error';

export interface ActivityLog {
  id: string;
  text: string;
  time: string;
  type: LogType;
}

export interface Employee {
  id: string;
  name: string;
  code: string;
  role: string;
  status: 'active' | 'inactive';
  avatar: string;
  clockInTime?: string;
  pin?: string;
}
