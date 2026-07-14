import { useState } from 'react';
import { Search, Bell, User, AlertTriangle } from 'lucide-react';
import { Product } from '../types';

interface HeaderProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  products: Product[];
}

export default function Header({ searchText, onSearchChange, products }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter low stock items for simple live alerts
  const lowStockItems = products.filter(p => p.currentStock <= p.minThreshold);

  return (
    <header className="flex justify-between items-center w-full px-6 md:px-10 h-20 sticky top-0 bg-[#050505]/90 backdrop-blur-md border-b border-[#1a1a1a] z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-[#FF4D00]">ການຈັດການສາງອັດສະລິຍະ</h2>
        <div className="px-3 py-1 bg-[#0a0a0a] text-white text-[9px] font-black border border-[#FF4D00]/40 tracking-[0.2em] uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#FF4D00] rounded-full animate-ping"></span>
          LIVE SYSTEM
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input 
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-[#0a0a0a] border border-[#1a1a1a] text-white rounded-none pl-10 pr-4 py-2 text-xs focus:border-[#FF4D00] w-64 outline-none transition-all placeholder-neutral-600" 
            placeholder="ຄົ້ນຫາສິນຄ້າ..." 
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications button */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 flex items-center justify-center rounded-none border border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#FF4D00] transition-colors text-neutral-400 hover:text-white cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {lowStockItems.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF4D00] rounded-full animate-bounce"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0a0a0a] border-2 border-[#1a1a1a] py-3 z-50 shadow-2xl">
                <div className="px-4 pb-2 border-b border-[#1a1a1a] flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider">ແຈ້ງເຕືອນສິນຄ້າໃກ້ໝົດ</h4>
                  <span className="text-[9px] bg-[#3b0712] text-[#fecdd3] px-2 py-0.5 font-bold uppercase tracking-widest border border-[#e11d48]/20">
                    {lowStockItems.length} ລາຍການ
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto mt-2">
                  {lowStockItems.length === 0 ? (
                    <p className="text-[11px] text-neutral-400 text-center py-6 uppercase tracking-wider">ບໍ່ມີລາຍການແຈ້ງເຕືອນ</p>
                  ) : (
                    lowStockItems.map(p => (
                      <div key={p.id} className="px-4 py-2.5 hover:bg-[#121212] flex gap-3 items-start border-b border-[#1a1a1a] last:border-0">
                        <AlertTriangle className="w-4 h-4 text-[#FF4D00] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-wide">{p.name}</p>
                          <p className="text-[9px] text-neutral-400 font-mono mt-0.5">SKU: {p.sku} | ຍັງເຫຼືອ: {p.currentStock} {p.unit}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div 
            onClick={() => alert("User profile: Admin / La Dolce Store")}
            className="h-10 w-10 border border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-center cursor-pointer hover:border-[#FF4D00] transition-colors"
            title="ຂໍ້ມູນຜູ້ໃຊ້"
          >
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
