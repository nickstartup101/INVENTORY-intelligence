import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Try to recover token or set needsAuth
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export interface SheetRow {
  sku: string;
  name: string;
  category: string;
  stockIn: number;
  stockOut: number;
  currentStock: number;
  unit: string;
  minThreshold: number;
}

export const fetchSpreadsheetData = async (
  spreadsheetId: string,
  range: string,
  accessToken: string
): Promise<SheetRow[]> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Sheet API Error: ${res.statusText} (${res.status}). Details: ${errText}`);
  }

  const data = await res.json();
  const rows = data.values as string[][];
  
  if (!rows || rows.length === 0) {
    return [];
  }

  // Assuming first row can be header, we will parse starting from row 1 (index 1) or dynamically detect if it is header
  // Let's analyze row 0. If col 0 contains 'sku' or similar, we skip row 0.
  let startIndex = 0;
  const firstRow = rows[0];
  if (firstRow && firstRow[0] && (
    firstRow[0].toLowerCase().includes('sku') || 
    firstRow[0].toLowerCase().includes('id') || 
    firstRow[0].toLowerCase().includes('ຊື່')
  )) {
    startIndex = 1;
  }

  const result: SheetRow[] = [];
  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;

    const sku = (row[0] || '').trim().toUpperCase();
    const name = (row[1] || '').trim();
    const category = (row[2] || 'Coffee Beans').trim();
    const stockIn = Number(row[3]) || 0;
    const stockOut = Number(row[4]) || 0;
    // user said: "ຂໍ້ມູນສິນຄ້າເເມ່ນດຶງມາຈາກ Google sheet ຈະມີ stock in/out-current stock"
    // current_stock can be column 5, or can be calculated (stockIn - stockOut) or read directly
    const currentStock = row[5] !== undefined ? (Number(row[5]) || 0) : (stockIn - stockOut);
    const unit = (row[6] || 'units').trim();
    const minThreshold = row[7] !== undefined ? (Number(row[7]) || 5) : 5;

    if (sku && name) {
      result.push({
        sku,
        name,
        category,
        stockIn,
        stockOut,
        currentStock,
        unit,
        minThreshold,
      });
    }
  }

  return result;
};
