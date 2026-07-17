import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../lib/firebase';

const storage = getStorage(app);

// ອັບໂຫລດຮູບພະນັກງານ, ຄືນ URL ທີ່ໃຊ້ໃສ່ field `avatar` ຂອງ Employee ໄດ້ເລີຍ
export async function uploadEmployeePhoto(employeeId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `employees/${employeeId}-${Date.now()}-${safeName}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
