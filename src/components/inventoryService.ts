import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Liquid, Task, ActivityLog, Employee, LogType } from '../types';
import {
  initialProducts,
  initialLiquids,
  initialTasks,
  initialLogs,
  initialEmployees,
} from '../data';

// ---------- Collection references ----------
const productsCol = collection(db, 'products');
const liquidsCol = collection(db, 'liquids');
const tasksCol = collection(db, 'tasks');
const logsCol = collection(db, 'logs');
const employeesCol = collection(db, 'employees');

// ---------- Seed Firestore once (ຖ້າ collection "products" ຍັງວ່າງ) ----------
export async function seedInitialData(): Promise<void> {
  const existing = await getDocs(productsCol);
  if (!existing.empty) return; // ມີຂໍ້ມູນແລ້ວ, ບໍ່ຕ້ອງ seed ຊ້ຳ

  const batch = writeBatch(db);
  initialProducts.forEach(p => batch.set(doc(productsCol, p.id), p));
  initialLiquids.forEach(l => batch.set(doc(liquidsCol, l.id), l));
  initialTasks.forEach(t => batch.set(doc(tasksCol, t.id), t));
  initialLogs.forEach((l, i) => batch.set(doc(logsCol, l.id), { ...l, timestamp: Date.now() - i * 1000 }));
  initialEmployees.forEach(e => batch.set(doc(employeesCol, e.id), e));
  await batch.commit();
}

// ---------- Real-time subscriptions (return unsubscribe function) ----------
export function subscribeToProducts(cb: (data: Product[]) => void): Unsubscribe {
  return onSnapshot(productsCol, snap => cb(snap.docs.map(d => d.data() as Product)));
}

export function subscribeToLiquids(cb: (data: Liquid[]) => void): Unsubscribe {
  return onSnapshot(liquidsCol, snap => cb(snap.docs.map(d => d.data() as Liquid)));
}

export function subscribeToTasks(cb: (data: Task[]) => void): Unsubscribe {
  return onSnapshot(tasksCol, snap => cb(snap.docs.map(d => d.data() as Task)));
}

export function subscribeToLogs(cb: (data: ActivityLog[]) => void): Unsubscribe {
  const q = query(logsCol, orderBy('timestamp', 'desc'), limit(16));
  return onSnapshot(q, snap => cb(snap.docs.map(d => d.data() as ActivityLog)));
}

export function subscribeToEmployees(cb: (data: Employee[]) => void): Unsubscribe {
  return onSnapshot(employeesCol, snap => cb(snap.docs.map(d => d.data() as Employee)));
}

// ---------- Activity log writer (Firestore ຄື source of truth, UI update ອັດຕະໂນມັດຜ່ານ subscribeToLogs) ----------
export async function addLog(text: string, type: LogType): Promise<void> {
  const timeNow = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  await addDoc(logsCol, { text, time: timeNow, type, timestamp: Date.now() });
}

// ---------- Product CRUD ----------
export async function addProduct(product: Product): Promise<void> {
  await setDoc(doc(productsCol, product.id), product);
  await addLog(`ເພີ່ມສິນຄ້າໃໝ່: ${product.name}`, 'success');
}

export async function updateProduct(id: string, changes: Partial<Product>): Promise<void> {
  await updateDoc(doc(productsCol, id), changes);
}

export async function deleteProduct(id: string, name: string): Promise<void> {
  await deleteDoc(doc(productsCol, id));
  await addLog(`ລຶບສິນຄ້າ: ${name}`, 'warning');
}

// ປັບຈຳນວນສະຕັອກ (+/-) ພ້ອມອັບເດດ status ອັດຕະໂນມັດ ແລະ ບັນທຶກ log
export async function adjustProductStock(product: Product, delta: number, actor?: string): Promise<void> {
  const newStock = Math.max(0, product.currentStock + delta);
  const status: Product['status'] =
    newStock === 0 ? 'OUT' : newStock <= product.minThreshold ? 'LOW' : 'OK';

  await updateDoc(doc(productsCol, product.id), { currentStock: newStock, status });

  const who = actor ? `${actor} ` : '';
  const sign = delta >= 0 ? '+' : '';
  await addLog(`${who}ປັບຈຳນວນ ${product.name} ${sign}${delta}`, delta >= 0 ? 'success' : 'info');
}

// ---------- Liquid CRUD ----------
export async function addLiquid(liquid: Liquid): Promise<void> {
  await setDoc(doc(liquidsCol, liquid.id), liquid);
}

export async function updateLiquidLevel(liquid: Liquid, percentage: number): Promise<void> {
  const clamped = Math.min(100, Math.max(0, percentage));
  const status: Liquid['status'] = clamped <= 15 ? 'CRITICAL' : clamped <= 35 ? 'LOW' : 'OK';
  await updateDoc(doc(liquidsCol, liquid.id), { percentage: clamped, status });
  if (status === 'CRITICAL') {
    await addLog(`ລະດັບ ${liquid.name} ຢູ່ໃນຂັ້ນວິກິດ (${clamped}%)`, 'error');
  }
}

export async function deleteLiquid(id: string): Promise<void> {
  await deleteDoc(doc(liquidsCol, id));
}

// ---------- Task CRUD ----------
export async function addTask(text: string): Promise<void> {
  const id = `t-${Date.now()}`;
  await setDoc(doc(tasksCol, id), { id, text, completed: false });
}

export async function toggleTask(task: Task): Promise<void> {
  await updateDoc(doc(tasksCol, task.id), { completed: !task.completed });
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(tasksCol, id));
}

// ---------- Employee CRUD ----------
export async function addEmployee(employee: Employee): Promise<void> {
  await setDoc(doc(employeesCol, employee.id), employee);
}

export async function updateEmployee(id: string, changes: Partial<Employee>): Promise<void> {
  await updateDoc(doc(employeesCol, id), changes);
}

export async function deleteEmployee(id: string): Promise<void> {
  await deleteDoc(doc(employeesCol, id));
}

export async function clockIn(employee: Employee): Promise<void> {
  const timeNow = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  await updateDoc(doc(employeesCol, employee.id), { status: 'active', clockInTime: timeNow });
  await addLog(`${employee.name} ເຂົ້າວຽກ`, 'info');
}

export async function clockOut(employee: Employee): Promise<void> {
  await updateDoc(doc(employeesCol, employee.id), { status: 'inactive', clockInTime: null });
  await addLog(`${employee.name} ອອກວຽກ`, 'info');
}
