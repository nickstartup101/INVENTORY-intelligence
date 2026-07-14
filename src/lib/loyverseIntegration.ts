import { Product } from '../types';

export interface RecipeIngredient {
  sku: string; // SKU of raw material in main inventory
  quantity: number; // Quantity used per item
}

export interface LoyverseItemRecipe {
  id: string;
  name: string; // Menu item name in Loyverse, e.g., "Latte (Hot)"
  ingredients: RecipeIngredient[];
}

export interface LoyverseSaleItem {
  name: string;
  quantity: number;
}

export interface LoyverseSaleReceipt {
  id: string;
  receiptNo: string;
  time: string;
  employeeName: string;
  items: LoyverseSaleItem[];
  status: 'pending' | 'deducted';
}

// Initial Recipes (BOM)
export const initialRecipes: LoyverseItemRecipe[] = [
  {
    id: 'rec-1',
    name: 'Latte (Hot)',
    ingredients: [
      { sku: 'C-001', quantity: 0.02 }, // 20g of 1kg bag
      { sku: 'M-012', quantity: 0.2 },  // 200ml of 1L milk
      { sku: 'P-055', quantity: 1 }      // 1 paper cup
    ]
  },
  {
    id: 'rec-2',
    name: 'Espresso (Hot)',
    ingredients: [
      { sku: 'C-001', quantity: 0.02 },
      { sku: 'P-055', quantity: 1 }
    ]
  },
  {
    id: 'rec-3',
    name: 'Caramel Macchiato',
    ingredients: [
      { sku: 'C-001', quantity: 0.02 },
      { sku: 'M-012', quantity: 0.15 },
      { sku: 'S-009', quantity: 0.05 }, // 5% of bottle
      { sku: 'P-055', quantity: 1 }
    ]
  },
  {
    id: 'rec-4',
    name: 'Iced Americano',
    ingredients: [
      { sku: 'C-001', quantity: 0.02 },
      { sku: 'P-055', quantity: 1 }
    ]
  }
];

// Mock Recent Loyverse Sales
export const initialLoyverseSales: LoyverseSaleReceipt[] = [
  {
    id: 'sale-1',
    receiptNo: 'REC-1045',
    time: '10:42 AM',
    employeeName: 'Somchai',
    items: [
      { name: 'Latte (Hot)', quantity: 2 },
      { name: 'Croissant', quantity: 1 }
    ],
    status: 'pending'
  },
  {
    id: 'sale-2',
    receiptNo: 'REC-1046',
    time: '11:15 AM',
    employeeName: 'Alounny',
    items: [
      { name: 'Espresso (Hot)', quantity: 1 },
      { name: 'Caramel Macchiato', quantity: 1 }
    ],
    status: 'pending'
  },
  {
    id: 'sale-3',
    receiptNo: 'REC-1047',
    time: '12:05 PM',
    employeeName: 'Vanh',
    items: [
      { name: 'Iced Americano', quantity: 3 }
    ],
    status: 'pending'
  }
];

/**
 * Calculates how much raw material stock would be deducted for a list of sold items
 */
export const calculateDeductions = (
  items: LoyverseSaleItem[],
  recipes: LoyverseItemRecipe[]
): Record<string, number> => {
  const deductions: Record<string, number> = {};

  items.forEach(saleItem => {
    const recipe = recipes.find(r => r.name.toLowerCase() === saleItem.name.toLowerCase());
    if (recipe) {
      recipe.ingredients.forEach(ing => {
        const totalDeduction = ing.quantity * saleItem.quantity;
        deductions[ing.sku] = (deductions[ing.sku] || 0) + totalDeduction;
      });
    }
  });

  return deductions;
};

/**
 * Deducts stock from products list based on deductions map
 */
export const applyDeductionsToProducts = (
  products: Product[],
  deductions: Record<string, number>
): {
  updatedProducts: Product[];
  logMessages: string[];
} => {
  const logMessages: string[] = [];
  
  const updatedProducts = products.map(prod => {
    const deductQty = deductions[prod.sku];
    if (deductQty && deductQty > 0) {
      // Round to 2 decimal places to avoid floating point issues
      const finalDeduct = Math.round(deductQty * 100) / 100;
      const newStock = Math.max(0, Math.round((prod.currentStock - finalDeduct) * 100) / 100);
      
      let newStatus: 'OK' | 'LOW' | 'OUT' = 'OK';
      if (newStock === 0) {
        newStatus = 'OUT';
      } else if (newStock <= prod.minThreshold) {
        newStatus = 'LOW';
      }

      logMessages.push(`ຕັດສະຕ໊ອກ ${prod.name} -${finalDeduct} ${prod.unit} ຈາກ Loyverse Sales (${newStock} remaining)`);

      return {
        ...prod,
        currentStock: newStock,
        status: newStatus
      };
    }
    return prod;
  });

  return { updatedProducts, logMessages };
};
