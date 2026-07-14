import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  Droplet, 
  ShoppingBag, 
  GlassWater, 
  Layers, 
  Trash2, 
  Edit2, 
  Save, 
  RotateCcw,
  RefreshCw,
  FileSpreadsheet,
  Check,
  Plus,
  LogIn,
  LogOut,
  Activity,
  ListFilter,
  Flame,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Product } from '../types';
import { 
  initAuth, 
  googleSignIn, 
  logout as googleLogout, 
  fetchSpreadsheetData, 
  SheetRow 
} from '../lib/googleApi';
import { 
  initialRecipes, 
  initialLoyverseSales, 
  calculateDeductions, 
  applyDeductionsToProducts, 
  LoyverseItemRecipe, 
  LoyverseSaleReceipt,
  RecipeIngredient
} from '../lib/loyverseIntegration';
import { User } from 'firebase/auth';

interface InventoryViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onLogMessage: (text: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function InventoryView({ products, setProducts, onLogMessage }: InventoryViewProps) {
  // Tabs: 'all' | 'sheets' | 'loyverse'
  const [activeTab, setActiveTab] = useState<'all' | 'sheets' | 'loyverse'>('all');
  
  // Existing inventory editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editStock, setEditStock] = useState<number>(0);
  const [editThreshold, setEditThreshold] = useState<number>(0);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = ['All', 'Coffee Beans', 'Milk & Dairy', 'Packaging', 'Syrups & Sauces'];

  // --- Google Sheets Sync States ---
  const [gUser, setGUser] = useState<User | null>(null);
  const [gToken, setGToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [spreadsheetId, setSpreadsheetId] = useState(() => {
    return localStorage.getItem('la_dolce_spreadsheet_id') || '1M-g68f6xU8f_CgQn_mR6vYRE_5vM4mO35jVzYV2U1z0';
  });
  const [sheetRange, setSheetRange] = useState(() => {
    return localStorage.getItem('la_dolce_sheet_range') || 'Sheet1!A2:H';
  });
  const [isFetchingSheet, setIsFetchingSheet] = useState(false);
  const [sheetPreview, setSheetPreview] = useState<SheetRow[]>([]);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  // --- Loyverse Recipes & deduction states ---
  const [recipes, setRecipes] = useState<LoyverseItemRecipe[]>(() => {
    const saved = localStorage.getItem('la_dolce_recipes');
    return saved ? JSON.parse(saved) : initialRecipes;
  });
  const [loyverseSales, setLoyverseSales] = useState<LoyverseSaleReceipt[]>(() => {
    const saved = localStorage.getItem('la_dolce_loyverse_sales');
    return saved ? JSON.parse(saved) : initialLoyverseSales;
  });
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeIngredients, setNewRecipeIngredients] = useState<RecipeIngredient[]>([
    { sku: 'C-001', quantity: 0.02 }
  ]);

  // Persist Recipes and Sales
  useEffect(() => {
    localStorage.setItem('la_dolce_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('la_dolce_loyverse_sales', JSON.stringify(loyverseSales));
  }, [loyverseSales]);

  // Persist Spreadsheet Config
  useEffect(() => {
    localStorage.setItem('la_dolce_spreadsheet_id', spreadsheetId);
  }, [spreadsheetId]);

  useEffect(() => {
    localStorage.setItem('la_dolce_sheet_range', sheetRange);
  }, [sheetRange]);

  // Init Google Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGUser(user);
        setGToken(token);
        setNeedsAuth(false);
      },
      () => {
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Map icon strings to Lucide elements
  const renderProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'coffee':
        return <Coffee className="w-4 h-4 text-[#FF4D00]" />;
      case 'water_drop':
        return <Droplet className="w-4 h-4 text-[#FF4D00]" />;
      case 'shopping_bag':
        return <ShoppingBag className="w-4 h-4 text-[#FF4D00]" />;
      case 'local_bar':
        return <GlassWater className="w-4 h-4 text-[#FF4D00]" />;
      default:
        return <Layers className="w-4 h-4 text-[#FF4D00]" />;
    }
  };

  // --- Google Auth Actions ---
  const handleGoogleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setGUser(res.user);
        setGToken(res.accessToken);
        setNeedsAuth(false);
        onLogMessage(`ເຂົ້າສູ່ລະບົບ Google ສຳເລັດ: ${res.user.email}`, 'success');
      }
    } catch (err: any) {
      onLogMessage(`ການເຂົ້າສູ່ລະບົບລົ້ມເຫຼວ: ${err.message}`, 'error');
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleLogout();
      setGUser(null);
      setGToken(null);
      setNeedsAuth(true);
      setSheetPreview([]);
      onLogMessage('ອອກຈາກລະບົບ Google ແລ້ວ', 'info');
    } catch (err: any) {
      onLogMessage(`ມີຂໍ້ຜິດພາດໃນການອອກຈາກລະບົບ: ${err.message}`, 'error');
    }
  };

  const handleFetchSheet = async () => {
    if (!gToken) {
      onLogMessage('ກະລຸນາເຂົ້າສູ່ລະບົບ Google ກ່ອນ', 'warning');
      return;
    }
    if (!spreadsheetId.trim()) {
      onLogMessage('ກະລຸນາປ້ອນ Spreadsheet ID', 'warning');
      return;
    }

    setIsFetchingSheet(true);
    setSyncSuccessMsg('');
    try {
      const data = await fetchSpreadsheetData(spreadsheetId.trim(), sheetRange.trim(), gToken);
      setSheetPreview(data);
      onLogMessage(`ດຶງຂໍ້ມູນຈາກ Google Sheet สำເລັດ: ${data.length} ລາຍການ`, 'success');
    } catch (err: any) {
      console.error(err);
      onLogMessage(`ດຶງຂໍ້ມູນລົ້ມເຫຼວ: ${err.message}`, 'error');
    } finally {
      setIsFetchingSheet(false);
    }
  };

  const handleSyncToInventory = () => {
    if (sheetPreview.length === 0) {
      onLogMessage('ບໍ່ມີຂໍ້ມູນໃນການຊິງຄ໌ ກະລຸນາດຶງຂໍ້ມູນກ່ອນ', 'warning');
      return;
    }

    const confirmed = window.confirm(
      `ທ່ານຕ້ອງການອັບເດດສະຕ໊ອກສິນຄ້າ ${sheetPreview.length} ລາຍການ ຈາກ Google Sheets ແທ້ຫຼືບໍ່? ຂໍ້ມູນເກົ່າໃນລະບົບຈະຖືກທົດແທນ.`
    );
    if (!confirmed) return;

    // Convert Sheet rows to Product structure
    const updatedProducts: Product[] = sheetPreview.map((row, idx) => {
      let icon = 'layers';
      const catLower = row.category.toLowerCase();
      if (catLower.includes('coffee') || catLower.includes('beans')) icon = 'coffee';
      else if (catLower.includes('milk') || catLower.includes('dairy')) icon = 'water_drop';
      else if (catLower.includes('cup') || catLower.includes('packaging')) icon = 'shopping_bag';
      else if (catLower.includes('syrup') || catLower.includes('sauce') || catLower.includes('honey')) icon = 'local_bar';

      const isLow = row.currentStock <= row.minThreshold;
      const isOut = row.currentStock === 0;
      const status = isOut ? 'OUT' : isLow ? 'LOW' : 'OK';

      return {
        id: `p-sheet-${idx}-${Date.now()}`,
        sku: row.sku,
        name: row.name,
        category: row.category,
        currentStock: row.currentStock,
        unit: row.unit,
        status,
        minThreshold: row.minThreshold,
        icon
      };
    });

    setProducts(updatedProducts);
    onLogMessage(`ຊິງຄ໌ສະຕ໊ອກກັບ Google Sheets ສຳເລັດ! ອັບເດດ ${updatedProducts.length} ສິນຄ້າ`, 'success');
    setSyncSuccessMsg(`ຊິງຄ໌ສຳເລັດ! ອັບເດດ ${updatedProducts.length} ສິນຄ້າໃນສາງຮຽບຮ້ອຍແລ້ວ.`);
    setSheetPreview([]);
  };

  // --- Loyverse Recipe & Deduction Actions ---
  const handleDeductReceipt = (receiptId: string) => {
    const receipt = loyverseSales.find(r => r.id === receiptId);
    if (!receipt) return;

    if (receipt.status === 'deducted') {
      alert('ບິນນີ້ຖືກຕັດສະຕ໊ອກໄປແລ້ວ!');
      return;
    }

    const deductions = calculateDeductions(receipt.items, recipes);
    
    // Check if we can apply deductions (i.e. if we have the products)
    const { updatedProducts, logMessages } = applyDeductionsToProducts(products, deductions);
    
    if (logMessages.length === 0) {
      alert('ບໍ່ມີວັດຖຸດິບໃດທີ່ຖືກຕ້ອງກັບສູດໃນບິນນີ້ເພື່ອຕັດສະຕ໊ອກ.');
      return;
    }

    setProducts(updatedProducts);
    
    // Update receipt status
    setLoyverseSales(prev => 
      prev.map(r => r.id === receiptId ? { ...r, status: 'deducted' } : r)
    );

    logMessages.forEach(msg => onLogMessage(msg, 'info'));
    onLogMessage(`ຕັດສະຕ໊ອກບິນ ${receipt.receiptNo} ສຳເລັດແລ້ວ!`, 'success');
    alert(`ຕັດສະຕ໊ອກບິນ ${receipt.receiptNo} ຕາມສູດວັດຖຸດິບຮຽບຮ້ອຍ!`);
  };

  const handleAddRecipeIngredient = () => {
    setNewRecipeIngredients(prev => [...prev, { sku: products[0]?.sku || '', quantity: 1 }]);
  };

  const handleRemoveRecipeIngredient = (index: number) => {
    setNewRecipeIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleRecipeIngredientChange = (index: number, field: keyof RecipeIngredient, value: any) => {
    setNewRecipeIngredients(prev => 
      prev.map((ing, i) => i === index ? { ...ing, [field]: value } : ing)
    );
  };

  const handleSaveNewRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeName.trim()) return;

    const newRec: LoyverseItemRecipe = {
      id: `rec-${Date.now()}`,
      name: newRecipeName.trim(),
      ingredients: newRecipeIngredients.filter(ing => ing.sku && ing.quantity > 0)
    };

    setRecipes(prev => [...prev, newRec]);
    onLogMessage(`ເພີ່ມສູດເມນູ Loyverse ໃໝ່: ${newRec.name}`, 'success');
    setShowAddRecipeModal(false);
    setNewRecipeName('');
    setNewRecipeIngredients([{ sku: 'C-001', quantity: 0.02 }]);
  };

  const handleDeleteRecipe = (id: string, name: string) => {
    if (confirm(`ຕ້ອງການລຶບສູດເມນູ "${name}" ແທ້ຫຼືບໍ່?`)) {
      setRecipes(prev => prev.filter(r => r.id !== id));
      onLogMessage(`ລຶບສູດເມນູ: ${name}`, 'error');
    }
  };

  // --- Existing Inventory View Helpers ---
  const handleStartEdit = (p: Product) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditSku(p.sku);
    setEditStock(p.currentStock);
    setEditThreshold(p.minThreshold);
  };

  const handleSaveEdit = (id: string) => {
    setProducts(prev => 
      prev.map(p => {
        if (p.id === id) {
          const isLow = editStock <= editThreshold;
          const isOut = editStock === 0;
          const status = isOut ? 'OUT' : isLow ? 'LOW' : 'OK';

          onLogMessage(`ອັບເດດສິນຄ້າ: ${editName} (Stock: ${editStock}, Threshold: ${editThreshold})`, 'info');
          
          return {
            ...p,
            name: editName,
            sku: editSku.toUpperCase(),
            currentStock: editStock,
            minThreshold: editThreshold,
            status,
          };
        }
        return p;
      })
    );
    setEditingId(null);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`ທ່ານຕ້ອງການລຶບສິນຄ້າ "${name}" ແທ້ຫຼືບໍ່?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      onLogMessage(`ລຶບສິນຄ້າອອກ: ${name}`, 'error');
    }
  };

  const handleQuickAddStock = (id: string, amount: number, name: string) => {
    setProducts(prev => 
      prev.map(p => {
        if (p.id === id) {
          const newStock = p.currentStock + amount;
          const isLow = newStock <= p.minThreshold;
          const isOut = newStock === 0;
          const status = isOut ? 'OUT' : isLow ? 'LOW' : 'OK';

          onLogMessage(`Restock: ${name} +${amount} (ລວມ: ${newStock})`, 'success');

          return {
            ...p,
            currentStock: newStock,
            status,
          };
        }
        return p;
      })
    );
  };

  const filteredProducts = products.filter(p => {
    if (filterCategory === 'All') return true;
    return p.category === filterCategory;
  });

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-[#1a1a1a] pb-6">
        <div>
          <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-[0.25em]">ຈັດການສາງສິນຄ້າທັງໝົດ</span>
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-1">MASTER INVENTORY CONTROLLER</h2>
          <p className="text-xs text-neutral-400 mt-1.5 font-bold uppercase tracking-wider">
            ຊິງຄ໌ຂໍ້ມູນສິນຄ້າຈາກ Google Sheets ແລະ ຕັດສະຕ໊ອກວັດຖຸດິບອັດຕະໂນມັດຈາກ Loyverse POS Sales.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#0a0a0a] p-1 border-2 border-[#1a1a1a] rounded-none self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'all' ? 'bg-[#FF4D00] text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> ສາງສິນຄ້າທັງໝົດ
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'sheets' ? 'bg-[#FF4D00] text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> ຊິງຄ໌ Google Sheets
          </button>
          <button
            onClick={() => setActiveTab('loyverse')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'loyverse' ? 'bg-[#FF4D00] text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" /> ສູດຕັດສະຕ໊ອກ Loyverse
          </button>
        </div>
      </div>

      {/* --- TAB 1: ALL INVENTORY PRODUCTS --- */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-xs font-black text-[#FF4D00] uppercase tracking-[0.25em]">ລາຍການສິນຄ້າປັດຈຸບັນ ({filteredProducts.length})</h3>
            
            {/* Category Filter tabs */}
            <div className="flex flex-wrap gap-1 bg-[#111111] p-1 rounded-none border border-[#1a1a1a] self-start">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-none transition-all cursor-pointer ${
                    filterCategory === cat 
                      ? 'bg-[#FF4D00] text-white' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {cat === 'All' ? 'ທັງໝົດ' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1a1a1a] text-neutral-400 text-[9px] font-black uppercase tracking-[0.2em]">
                    <th className="pb-4 px-3">ໄອຄອນ / SKU</th>
                    <th className="pb-4 px-3">ຊື່ສິນຄ້າ</th>
                    <th className="pb-4 px-3">ປະເພດ</th>
                    <th className="pb-4 px-3">ຈຳນວນໃນສາງ</th>
                    <th className="pb-4 px-3">ຈຸດແຈ້ງເຕືອນ</th>
                    <th className="pb-4 px-3">ສະຖານະ</th>
                    <th className="pb-4 px-3 text-right">ຈັດການ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a] text-xs">
                  {filteredProducts.map((p) => {
                    const isEditing = editingId === p.id;
                    return (
                      <tr key={p.id} className="hover:bg-[#111111]/40 transition-colors group">
                        
                        {/* SKU / Icon */}
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-none bg-[#111111] flex items-center justify-center border border-[#1a1a1a]">
                              {renderProductIcon(p.icon)}
                            </div>
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={editSku} 
                                onChange={(e) => setEditSku(e.target.value)} 
                                className="font-mono text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-2 py-1 w-20 uppercase focus:outline-none focus:border-[#FF4D00]"
                              />
                            ) : (
                              <span className="font-mono text-xs font-black text-neutral-400 uppercase tracking-wider">{p.sku}</span>
                            )}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="py-4 px-3 font-black text-white uppercase tracking-wider">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editName} 
                              onChange={(e) => setEditName(e.target.value)} 
                              className="text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-2 py-1 w-44 font-sans focus:outline-none focus:border-[#FF4D00]"
                            />
                          ) : (
                            p.name
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-4 px-3 text-xs text-neutral-400 font-bold uppercase tracking-wider">
                          {p.category}
                        </td>

                        {/* Stock */}
                        <td className="py-4 px-3 font-black text-white">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input 
                                type="number" 
                                value={editStock} 
                                onChange={(e) => setEditStock(Number(e.target.value))} 
                                className="text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-2 py-1 w-16 focus:outline-none focus:border-[#FF4D00]"
                                min={0}
                              />
                              <span className="text-xs font-normal text-neutral-400 lowercase">{p.unit}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{p.currentStock} <span className="text-[10px] text-neutral-400 font-normal lowercase">{p.unit}</span></span>
                              
                              {/* Quick refill indicators */}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                <button 
                                  onClick={() => handleQuickAddStock(p.id, 10, p.name)}
                                  className="px-1.5 py-0.5 text-[9px] font-black bg-[#111111] border border-[#1a1a1a] hover:border-[#FF4D00] text-neutral-300 rounded-none cursor-pointer"
                                  title="ຕື່ມ 10"
                                >
                                  +10
                                </button>
                                <button 
                                  onClick={() => handleQuickAddStock(p.id, 50, p.name)}
                                  className="px-1.5 py-0.5 text-[9px] font-black bg-[#111111] border border-[#1a1a1a] hover:border-[#FF4D00] text-neutral-300 rounded-none cursor-pointer"
                                  title="ຕື່ມ 50"
                                >
                                  +50
                                </button>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Min Alert Threshold */}
                        <td className="py-4 px-3">
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={editThreshold} 
                              onChange={(e) => setEditThreshold(Number(e.target.value))} 
                              className="text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-2 py-1 w-16 focus:outline-none focus:border-[#FF4D00]"
                              min={0}
                            />
                          ) : (
                            <span className="text-xs font-black text-neutral-400 font-mono">
                              {p.minThreshold} <span className="text-[10px] font-normal lowercase">{p.unit}</span>
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-3">
                          {p.currentStock === 0 ? (
                            <span className="px-2 py-0.5 rounded-none bg-[#3b0712] text-[#fecdd3] border border-[#e11d48]/20 text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                              ໝົດສາງ
                            </span>
                          ) : p.currentStock <= p.minThreshold ? (
                            <span className="px-2 py-0.5 rounded-none bg-[#451a03] text-[#fef08a] border border-[#d97706]/20 text-[9px] font-black uppercase tracking-wider whitespace-nowrap animate-pulse">
                              ⚠️ ໃກ້ໝົດ
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-none bg-[#064e3b] text-[#a7f3d0] border border-[#059669]/20 text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                              ປົກກະຕິ
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-3 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => handleSaveEdit(p.id)}
                                className="p-1.5 bg-green-700 text-white rounded-none hover:bg-green-600 transition-colors cursor-pointer"
                                title="ບັນທຶກ"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setEditingId(null)}
                                className="p-1.5 bg-neutral-800 text-neutral-300 rounded-none hover:bg-neutral-700 transition-colors cursor-pointer"
                                title="ຍົກເລີກ"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => handleStartEdit(p)}
                                className="w-8 h-8 flex items-center justify-center rounded-none border border-[#1a1a1a] bg-[#0a0a0a] text-neutral-400 hover:border-[#FF4D00] hover:bg-[#FF4D00] hover:text-white transition-all cursor-pointer"
                                title="ແກ້ໄຂ"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="w-8 h-8 flex items-center justify-center rounded-none border border-[#1a1a1a] bg-[#0a0a0a] text-neutral-400 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                title="ລຶບ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: GOOGLE SHEETS SYNC --- */}
      {activeTab === 'sheets' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 md:p-8 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a] space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#1a1a1a] pb-4 gap-4">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-green-500" /> Google Sheets Inventory Synchronization
                </h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
                  ຊິງຄ໌ຈຳນວນນຳເຂົ້າ, ຈ່າຍອອກ ແລະ ຄົງເຫຼືອປັດຈຸບັນ (stock in/out-current stock) ໂດຍກົງຈາກ Spreadsheet.
                </p>
              </div>

              {/* Authentication Status / Action */}
              <div>
                {needsAuth ? (
                  <button
                    onClick={handleGoogleLogin}
                    className="gsi-material-button text-xs py-2 px-4 flex items-center gap-2 border border-neutral-700 bg-white hover:bg-neutral-100 text-black font-semibold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-4 bg-[#111111] p-2 border border-[#1a1a1a]">
                    <div className="flex items-center gap-2">
                      {gUser?.photoURL && (
                        <img src={gUser.photoURL} alt="Avatar" className="w-6 h-6 rounded-none grayscale border border-neutral-700" />
                      )}
                      <span className="text-[11px] font-mono text-neutral-300 font-bold">{gUser?.email}</span>
                    </div>
                    <button
                      onClick={handleGoogleLogout}
                      className="text-[10px] uppercase font-black tracking-wider text-red-500 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Config inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mb-2">Google Spreadsheet ID</label>
                <input
                  type="text"
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  placeholder="ເຊັ່ນ: 1x_U9zB..."
                  className="w-full text-xs font-mono border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-3 py-2.5 focus:outline-none focus:border-[#FF4D00] placeholder-neutral-700"
                />
                <p className="text-[9px] text-neutral-500 font-medium mt-1">Spreadsheet ID ທີ່ຕ້ອງການດຶງຂໍ້ມູນສິນຄ້າ.</p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mb-2">Sheet Range</label>
                <input
                  type="text"
                  value={sheetRange}
                  onChange={(e) => setSheetRange(e.target.value)}
                  placeholder="ເຊັ່ນ: Sheet1!A2:H"
                  className="w-full text-xs font-mono border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-3 py-2.5 focus:outline-none focus:border-[#FF4D00]"
                />
                <p className="text-[9px] text-neutral-500 font-medium mt-1">ຊ່ວງຂໍ້ມູນຂອງຕາຕະລາງ (ເລີ່ມຈາກຖັນ SKU).</p>
              </div>
            </div>

            {/* Fetch & sync actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleFetchSheet}
                disabled={isFetchingSheet || needsAuth}
                className="px-5 py-3 bg-[#FF4D00] hover:bg-[#ff5d1a] disabled:opacity-50 text-white rounded-none text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isFetchingSheet ? 'animate-spin' : ''}`} />
                {isFetchingSheet ? 'ກຳລັງດຶງຂໍ້ມູນ...' : 'ດຶງຂໍ້ມູນສິນຄ້າ'}
              </button>

              <button
                onClick={handleSyncToInventory}
                disabled={sheetPreview.length === 0}
                className="px-5 py-3 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white rounded-none text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> ຊິງຄ໌ເຂົ້າສາງສິນຄ້າ (Apply Stock)
              </button>
            </div>

            {syncSuccessMsg && (
              <div className="bg-green-950/20 border border-green-800/30 text-green-400 p-4 rounded-none text-xs font-bold uppercase tracking-wide flex items-center gap-2 animate-pulse">
                <CheckCircle className="w-4 h-4 text-green-400" /> {syncSuccessMsg}
              </div>
            )}

            {/* Column map layout reference card */}
            <div className="bg-[#111111] border border-[#1a1a1a] p-4">
              <span className="text-[9px] font-black text-[#FF4D00] uppercase tracking-widest">⚠️ ຄຳແນະນຳໂຄງສ້າງ Google Sheet (BOM Sheet Layout)</span>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                ເພື່ອໃຫ້ລະບົບສາມາດອ່ານຂໍ້ມູນໄດ້ຢ່າງຖືກຕ້ອງ, ກະລຸນາຈັດຮຽງຖັນໃນ Google Sheet ຂອງທ່ານດັ່ງນີ້:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 mt-3 text-center">
                {[
                  { col: 'A', name: 'SKU' },
                  { col: 'B', name: 'Name' },
                  { col: 'C', name: 'Category' },
                  { col: 'D', name: 'Stock In' },
                  { col: 'E', name: 'Stock Out' },
                  { col: 'F', name: 'Current Stock' },
                  { col: 'G', name: 'Unit' },
                  { col: 'H', name: 'Min Threshold' }
                ].map((c) => (
                  <div key={c.col} className="bg-[#050505] border border-[#1a1a1a] p-2">
                    <p className="text-[9px] font-black text-[#FF4D00] font-mono">{c.col}</p>
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider mt-0.5">{c.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PREVIEW TABLE */}
            {sheetPreview.length > 0 && (
              <div className="pt-6 border-t border-[#1a1a1a] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-white uppercase tracking-[0.25em]">ຕົວຢ່າງຂໍ້ມູນຈາກ Google Sheets ({sheetPreview.length} items)</span>
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse">⚠️ ຍັງບໍ່ໄດ້ຊິງຄ໌ເຂົ້າສາງ</span>
                </div>

                <div className="overflow-x-auto border border-[#1a1a1a]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#111111] border-b border-[#1a1a1a] text-neutral-400 text-[9px] font-black uppercase tracking-[0.2em]">
                        <th className="py-3 px-3">SKU</th>
                        <th className="py-3 px-3">Name</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3 text-center">Stock In</th>
                        <th className="py-3 px-3 text-center">Stock Out</th>
                        <th className="py-3 px-3 text-center">Current Stock</th>
                        <th className="py-3 px-3 text-center">Unit</th>
                        <th className="py-3 px-3 text-center">Min Threshold</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1a] text-xs font-mono">
                      {sheetPreview.map((row, index) => (
                        <tr key={index} className="hover:bg-[#111111]/40 text-neutral-300">
                          <td className="py-3 px-3 text-[#FF4D00] font-black">{row.sku}</td>
                          <td className="py-3 px-3 font-sans font-bold text-white">{row.name}</td>
                          <td className="py-3 px-3 font-sans text-neutral-400">{row.category}</td>
                          <td className="py-3 px-3 text-center">{row.stockIn}</td>
                          <td className="py-3 px-3 text-center">{row.stockOut}</td>
                          <td className="py-3 px-3 text-center text-white font-black">{row.currentStock}</td>
                          <td className="py-3 px-3 text-center font-sans">{row.unit}</td>
                          <td className="py-3 px-3 text-center">{row.minThreshold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: LOYVERSE INGREDIENT RECIPE BOM DEDUCTION --- */}
      {activeTab === 'loyverse' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Recipes / BOM List */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a] space-y-4">
              <div className="flex justify-between items-center border-b border-[#1a1a1a] pb-4">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.25em]">ສູດວັດຖຸດິບ (Recipe / BOM Mapping)</h3>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">ກຳນົດວັດຖຸດິບທີ່ໃຊ້ໃນແຕ່ລະເມນູ Loyverse POS ເພື່ອຕັດສະຕ໊ອກ.</p>
                </div>
                <button
                  onClick={() => setShowAddRecipeModal(true)}
                  className="px-4 py-2 bg-[#FF4D00] hover:bg-[#ff5d1a] text-white rounded-none text-[10px] font-black uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> ເພີ່ມສູດເມນູ
                </button>
              </div>

              <div className="space-y-4">
                {recipes.length === 0 ? (
                  <p className="text-neutral-500 text-xs py-8 text-center uppercase font-bold tracking-wider">ຍັງບໍ່ມີການຕັ້ງຄ່າສູດເມນູ</p>
                ) : (
                  recipes.map((rec) => (
                    <div key={rec.id} className="border border-[#1a1a1a] bg-[#111111]/40 p-4 relative group">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">{rec.name}</h4>
                          <span className="text-[8px] font-black text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 uppercase tracking-widest mt-1 inline-block">Loyverse Menu Item</span>
                        </div>
                        <button
                          onClick={() => handleDeleteRecipe(rec.id, rec.name)}
                          className="p-1 text-neutral-500 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          title="ລຶບສູດ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-[#1a1a1a]">
                        <p className="text-[9px] font-black text-[#FF4D00] uppercase tracking-widest mb-1">ວັດຖຸດິບ ແລະ ປະລິມານທີ່ໃຊ້:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {rec.ingredients.map((ing, idx) => {
                            const matchedProd = products.find(p => p.sku === ing.sku);
                            return (
                              <div key={idx} className="bg-[#0a0a0a] border border-[#161616] px-3 py-2 flex items-center justify-between text-[11px] font-bold">
                                <span className="text-white">{matchedProd ? matchedProd.name : ing.sku}</span>
                                <span className="font-mono text-[#FF4D00]">-{ing.quantity} {matchedProd?.unit || 'units'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Loyverse Real-time Sales list for simulation */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a] space-y-4">
              <div className="border-b border-[#1a1a1a] pb-4">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#FF4D00]" /> ບິນຂາຍຫຼ້າສຸດຈາກ Loyverse
                </h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">ລາຍການບິນຂາຍທີ່ຊິງຄ໌ມາເພື່ອຕັດສະຕ໊ອກວັດຖຸດິບ.</p>
              </div>

              <div className="space-y-4">
                {loyverseSales.map((sale) => {
                  const isDeducted = sale.status === 'deducted';
                  return (
                    <div key={sale.id} className={`border p-4 rounded-none flex flex-col justify-between ${isDeducted ? 'border-green-800 bg-green-950/10' : 'border-[#1a1a1a] bg-[#050505]'}`}>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-mono text-[10px] font-black text-white tracking-widest">{sale.receiptNo}</span>
                          <span className="text-[9px] text-neutral-400 font-mono">{sale.time}</span>
                        </div>

                        <div className="space-y-1.5 my-3">
                          {sale.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-[11px] font-bold">
                              <span className="text-neutral-300">{item.name}</span>
                              <span className="text-white">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-2.5 border-t border-[#1a1a1a] text-[9px] font-black uppercase tracking-wider text-neutral-500">
                          <span>Cashier: {sale.employeeName}</span>
                          {isDeducted ? (
                            <span className="text-green-400 flex items-center gap-1 font-bold">
                              <CheckCircle className="w-3.5 h-3.5" /> ຕັດສະຕ໊ອກແລ້ວ
                            </span>
                          ) : (
                            <span className="text-amber-500 flex items-center gap-1 font-bold animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5" /> ລໍຖ້າຕັດສະຕ໊ອກ
                            </span>
                          )}
                        </div>
                      </div>

                      {!isDeducted && (
                        <button
                          onClick={() => handleDeductReceipt(sale.id)}
                          className="mt-4 w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-none transition-all cursor-pointer text-center"
                        >
                          ຕັດສະຕ໊ອກຕາມວັດຖຸດິບ
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD RECIPE MODAL */}
      {showAddRecipeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] rounded-none p-6 w-full max-w-lg shadow-2xl border-2 border-[#1a1a1a] text-white animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-[#1a1a1a] pb-4">
              <h3 className="font-black text-sm text-white uppercase tracking-wider">ເພີ່ມສູດເມນູ Loyverse ໃໝ່</h3>
              <button 
                onClick={() => setShowAddRecipeModal(false)}
                className="p-1 hover:bg-[#111111] text-neutral-400 hover:text-white cursor-pointer"
              >
                X
              </button>
            </div>

            <form onSubmit={handleSaveNewRecipe} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mb-1">ຊື່ເມນູໃນ Loyverse *</label>
                <input 
                  type="text" 
                  required
                  value={newRecipeName}
                  onChange={(e) => setNewRecipeName(e.target.value)}
                  placeholder="ເຊັ່ນ: Latte (Hot)"
                  className="w-full text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-3 py-2.5 focus:outline-none focus:border-[#FF4D00] font-bold"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest">ວັດຖຸດິບ (BOM Ingredients)</label>
                  <button
                    type="button"
                    onClick={handleAddRecipeIngredient}
                    className="text-[9px] font-black text-[#FF4D00] uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                  >
                    + ເພີ່ມວັດຖຸດິບ
                  </button>
                </div>

                {newRecipeIngredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-[#111111] p-3 border border-[#1a1a1a]">
                    <div className="flex-1">
                      <label className="block text-[8px] text-neutral-400 font-bold uppercase mb-1">ເລືອກສິນຄ້າໃນສາງ *</label>
                      <select
                        value={ing.sku}
                        onChange={(e) => handleRecipeIngredientChange(idx, 'sku', e.target.value)}
                        className="w-full text-xs border border-[#1a1a1a] bg-[#050505] text-white rounded-none px-2 py-1.5 focus:outline-none focus:border-[#FF4D00]"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.sku}>{p.name} ({p.sku})</option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <label className="block text-[8px] text-neutral-400 font-bold uppercase mb-1">ປະລິມານ *</label>
                      <input
                        type="number"
                        step="0.001"
                        required
                        min="0.001"
                        value={ing.quantity}
                        onChange={(e) => handleRecipeIngredientChange(idx, 'quantity', Number(e.target.value))}
                        className="w-full text-xs border border-[#1a1a1a] bg-[#050505] text-white rounded-none px-2 py-1.5 focus:outline-none focus:border-[#FF4D00] font-mono font-bold"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRecipeIngredient(idx)}
                      disabled={newRecipeIngredients.length === 1}
                      className="p-1.5 bg-neutral-900 border border-[#1a1a1a] hover:border-red-500 hover:text-red-500 rounded-none cursor-pointer self-end"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex gap-3 border-t border-[#1a1a1a]">
                <button 
                  type="button" 
                  onClick={() => setShowAddRecipeModal(false)}
                  className="flex-1 py-2.5 border border-[#1a1a1a] bg-transparent text-white font-black uppercase tracking-wider rounded-none text-xs hover:bg-[#111111] transition-all cursor-pointer text-center"
                >
                  ຍົກເລີກ
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-[#FF4D00] text-white font-black uppercase tracking-wider rounded-none text-xs hover:bg-[#ff5d1a] transition-all cursor-pointer text-center"
                >
                  ບັນທຶກສູດເມນູ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
