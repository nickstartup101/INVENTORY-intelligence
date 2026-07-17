import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const securityDocRef = doc(db, 'settings', 'security');
const DEFAULT_MANAGER_PIN = '999999';

// ⚠️ ໝາຍເຫດຄວາມປອດໄພ: ຟັງຊັນນີ້ອ່ານ/ປຽບທຽບ PIN ຢູ່ຝັ່ງ client, ເໝາະສຳລັບ prototype.
// ຖ້າຈະໃຊ້ຈິງ ຄວນຍ້າຍການກວດ PIN ໄປຝັ່ງ server (Cloud Function) ແລະ ຮັດກຸມ
// firestore.rules ບໍ່ໃຫ້ໃຜອ່ານ settings/security ໄດ້ໂດຍກົງ.

export async function getManagerPin(): Promise<string> {
  const snap = await getDoc(securityDocRef);
  if (!snap.exists()) {
    await setDoc(securityDocRef, { managerPin: DEFAULT_MANAGER_PIN });
    return DEFAULT_MANAGER_PIN;
  }
  return (snap.data().managerPin as string) ?? DEFAULT_MANAGER_PIN;
}

export async function setManagerPin(newPin: string): Promise<void> {
  await setDoc(securityDocRef, { managerPin: newPin }, { merge: true });
}

export async function verifyManagerPin(pin: string): Promise<boolean> {
  const current = await getManagerPin();
  return pin === current;
}
