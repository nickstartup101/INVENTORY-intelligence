import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AttendanceRecord, Employee } from '../types';
import { addLog } from './inventoryService';

const attendanceCol = collection(db, 'attendance');

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function subscribeToAttendance(cb: (records: AttendanceRecord[]) => void): Unsubscribe {
  const q = query(attendanceCol, orderBy('clockIn', 'desc'));
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord)))
  );
}

// ຫາ shift ທີ່ຍັງບໍ່ໄດ້ clock out ຂອງພະນັກງານຄົນນັ້ນ (ຖ້າມີ)
export async function findOpenAttendance(employeeId: string): Promise<AttendanceRecord | null> {
  const q = query(attendanceCol, where('employeeId', '==', employeeId), where('clockOut', '==', null));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as AttendanceRecord;
}

export async function clockInEmployee(employee: Employee): Promise<void> {
  const open = await findOpenAttendance(employee.id);
  if (open) return; // clock in ຢູ່ແລ້ວ, ບໍ່ໃຫ້ສ້າງຊ້ຳ

  await addDoc(attendanceCol, {
    employeeId: employee.id,
    employeeName: employee.name,
    clockIn: Date.now(),
    clockOut: null,
    date: todayStr(),
  });
  await addLog(`${employee.name} ເຂົ້າວຽກ`, 'info');
}

export async function clockOutEmployee(employee: Employee): Promise<void> {
  const open = await findOpenAttendance(employee.id);
  if (!open) return;

  await updateDoc(doc(attendanceCol, open.id), { clockOut: Date.now() });
  await addLog(`${employee.name} ອອກວຽກ`, 'info');
}
