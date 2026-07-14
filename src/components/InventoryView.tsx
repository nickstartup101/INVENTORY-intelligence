import React, { useState } from 'react';
import { 
  Coffee, 
  Droplet, 
  ShoppingBag, 
  GlassWater, 
  Layers, 
  Trash2, 
  Edit2, 
  Save, 
  RotateCcw
} from 'lucide-react';
import { Product } from '../types';

interface InventoryViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onLogMessage: (text: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function InventoryView({ products, setProducts, onLogMessage }: InventoryViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editStock, setEditStock] = useState<number>(0);
  const [editThreshold, setEditThreshold] = useState<number>(0);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = ['All', 'Coffee Beans', 'Milk & Dairy', 'Packaging', 'Syrups & Sauces'];

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

          onLogMessage(` Restock: ${name} +${amount} (ລວມ: ${newStock})`, 'success');

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-[0.25em]">ຈັດການສາງສິນຄ້າທັງໝົດ</span>
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-1">MASTER INVENTORY CONTROLLER</h2>
          <p className="text-xs text-neutral-400 mt-1.5 font-bold uppercase tracking-wider">ອັບເດດຈຳນວນ, ຕັ້ງຄ່າຈຸດແຈ້ງເຕືອນສິນຄ້າ ແລະ ປັບແຕ່ງລາຍການສິນຄ້າຂອງທ່ານ.</p>
        </div>

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

      {/* INVENTORY MASTER PANEL */}
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
                <th className="pb-4 px-3">ສະຖານة</th>
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
                            title="บันทึก"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-neutral-800 text-neutral-300 rounded-none hover:bg-neutral-700 transition-colors cursor-pointer"
                            title="ยกเลิก"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => handleStartEdit(p)}
                            className="w-8 h-8 flex items-center justify-center rounded-none border border-[#1a1a1a] bg-[#0a0a0a] text-neutral-400 hover:border-[#FF4D00] hover:bg-[#FF4D00] hover:text-white transition-all cursor-pointer"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="w-8 h-8 flex items-center justify-center rounded-none border border-[#1a1a1a] bg-[#0a0a0a] text-neutral-400 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                            title="ลบ"
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
  );
}
