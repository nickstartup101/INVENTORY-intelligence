// ⚠️ Loyverse Access Token ແມ່ນຄວາມລັບແທ້ (ບໍ່ຄືກັບ Firebase web API key) —
// ຫ້າມໃສ່ໃນ client code ຫຼື VITE_ env ໂດຍເດັດຂາດ, ຕ້ອງເກັບໄວ້ຝັ່ງ server ເທົ່ານັ້ນ.
// ໜ້າ client ນີ້ຈະເອີ້ນຜ່ານ backend proxy (/api/loyverse/*) ທີ່ຮູ້ token ແທນ —
// ເບິ່ງຕົວຢ່າງ server-side ໃນ server.example.js

import { Product } from '../types';
import { updateProduct, addLog } from './inventoryService';

interface LoyverseInventoryLevel {
  variant_id: string;
  store_id: string;
  in_stock: number;
}

// Vercel serve ໜ້າເວັບ (Vite build) ແລະ /api/* (serverless functions) ຈາກ domain ດຽວກັນ
// ທັງຕອນ `vercel dev` ແລະ production ດັ່ງນັ້ນໃຊ້ relative path ໄດ້ເລີຍ ບໍ່ຕ້ອງຕັ້ງ base URL

// ດຶງລະດັບສະຕັອກປັດຈຸບັນຈາກ Loyverse (ຜ່ານ backend proxy, ບໍ່ແມ່ນເອີ້ນ Loyverse ໂດຍກົງ)
export async function fetchLoyverseInventory(): Promise<LoyverseInventoryLevel[]> {
  const res = await fetch('/api/loyverse/inventory');
  if (!res.ok) {
    throw new Error(`Loyverse proxy error: ${res.status}`);
  }
  const data = await res.json();
  return (data.inventory_levels ?? []) as LoyverseInventoryLevel[];
}

// ອັບເດດ currentStock ໃນ Firestore ໃຫ້ກົງກັບ Loyverse (ຫຼັງຈາກລູກຄ້າຊື້ຜ່ານ POS ແລ້ວ)
// ຕ້ອງມີ product.loyverseVariantId ຈັບຄູ່ໄວ້ກ່ອນຈຶ່ງຈະ sync ໄດ້
export async function syncStockFromLoyverse(products: Product[]): Promise<number> {
  const levels = await fetchLoyverseInventory();
  let updatedCount = 0;

  for (const product of products) {
    if (!product.loyverseVariantId) continue;

    const level = levels.find(l => l.variant_id === product.loyverseVariantId);
    if (!level) continue;

    const newStock = Math.round(level.in_stock);
    if (newStock === product.currentStock) continue;

    const status = newStock === 0 ? 'OUT' : newStock <= product.minThreshold ? 'LOW' : 'OK';
    await updateProduct(product.id, { currentStock: newStock, status });
    updatedCount++;
  }

  if (updatedCount > 0) {
    await addLog(`Sync ຈາກ Loyverse ສຳເລັດ: ອັບເດດ ${updatedCount} ລາຍການ`, 'success');
  }
  return updatedCount;
}
