import { useState } from 'react';
import { Store, Bell, CloudLightning, Save, HelpCircle } from 'lucide-react';

interface SettingsViewProps {
  onLogMessage: (text: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function SettingsView({ onLogMessage }: SettingsViewProps) {
  const [storeName, setStoreName] = useState('LA DOLCE');
  const [storeSlogan, setStoreSlogan] = useState('INVENTORY INTEL');
  const [lowStockAlert, setLowStockAlert] = useState(15);
  const [loyverseToken, setLoyverseToken] = useState('••••••••••••••••••••••••••••');
  const [showToken, setShowToken] = useState(false);
  const [successSection, setSuccessSection] = useState<string | null>(null);

  const handleSaveSettings = (section: string) => {
    onLogMessage(`ບັນທຶກການຕັ້ງຄ່າ: ${section} ສຳເລັດ`, 'success');
    setSuccessSection(section);
    setTimeout(() => {
      setSuccessSection(null);
    }, 3000);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-300">
      
      <div className="border-b border-[#1a1a1a] pb-6">
        <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-[0.25em]">ການຕັ້ງຄ່າລະບົບ</span>
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-1">SYSTEM CONFIG</h2>
        <p className="text-xs text-neutral-400 mt-1.5 font-bold uppercase tracking-wider">ປັບແຕ່ງຂໍ້ມູນຮ້ານຄ້າ, ການແຈ້ງເຕືອນສິນຄ້າ ແລະ ການເຊື່ອມຕໍ່ລະບົບພາຍນອກ.</p>
      </div>

      {successSection && (
        <div className="p-3 bg-green-950/40 border border-green-800/40 text-green-400 text-xs font-black uppercase tracking-widest rounded-none animate-bounce">
          ✓ ບັນທຶກການຕັ້ງຄ່າ: {successSection} สำเร็จแล้ว!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Cafe details, Alert Settings */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
          
          {/* PROFILE CARD */}
          <div className="glass-panel p-6 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a] space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] flex items-center gap-2 pb-3 border-b border-[#1a1a1a]">
              <Store className="w-4 h-4 text-[#FF4D00]" /> ຂໍ້ມູນຮ້ານຄ້າ (Store Profile)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">ຊື່ຮ້ານຄ້າ</label>
                <input 
                  type="text" 
                  value={storeName} 
                  onChange={(e) => setStoreName(e.target.value)} 
                  className="w-full text-xs border border-[#1a1a1a] rounded-none px-3 py-2 bg-[#050505] text-white focus:outline-none focus:border-[#FF4D00] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Slogan / Subtitle</label>
                <input 
                  type="text" 
                  value={storeSlogan} 
                  onChange={(e) => setStoreSlogan(e.target.value)} 
                  className="w-full text-xs border border-[#1a1a1a] rounded-none px-3 py-2 bg-[#050505] text-white focus:outline-none focus:border-[#FF4D00] transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => handleSaveSettings('Store Profile')}
                className="px-4 py-2 bg-[#FF4D00] text-white font-black text-xs uppercase tracking-widest rounded-none hover:bg-[#ff5d1a] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> ບັນທຶກຂໍ້ມູນ
              </button>
            </div>
          </div>

          {/* ALERT THRESHOLDS */}
          <div className="glass-panel p-6 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a] space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] flex items-center gap-2 pb-3 border-b border-[#1a1a1a]">
              <Bell className="w-4 h-4 text-[#FF4D00]" /> ການແຈ້ງເຕືອນ ແລະ ຈຸດວິກິດ (Alerts)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">ຈຸດແຈ້ງເຕືອນສິນຄ້າຕ່ຳສຸດເລີ່ມຕົ້ນ (Default Alert Threshold)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min={5}
                    max={100}
                    value={lowStockAlert} 
                    onChange={(e) => setLowStockAlert(Number(e.target.value))} 
                    className="w-full accent-[#FF4D00] cursor-pointer"
                  />
                  <span className="font-mono text-sm font-black text-[#FF4D00] whitespace-nowrap bg-[#111111] border border-[#1a1a1a] px-3 py-1 rounded-none">
                    {lowStockAlert} units
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-2.5">ເມື່ອຈຳນວນສິນຄ້າໃນສາງຫຼຸດລົງກາຍຈຸດນີ້ ລະບົບຈະແຈ້ງເຕືອນ "ສັ່ງດ່ວນ" ທັນທີ.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => handleSaveSettings('Alert Thresholds')}
                className="px-4 py-2 bg-[#FF4D00] text-white font-black text-xs uppercase tracking-widest rounded-none hover:bg-[#ff5d1a] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> ບັນທຶກການຕັ້ງຄ່າ
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Integrations & Help */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          
          {/* LOYVERSE SYNC API CONFIG */}
          <div className="glass-panel p-6 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a] space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] flex items-center gap-2 pb-3 border-b border-[#1a1a1a]">
              <CloudLightning className="w-4 h-4 text-[#FF4D00]" /> ເຊື່ອມຕໍ່ Loyverse POS API
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Loyverse Access Token</label>
                <div className="relative">
                  <input 
                    type={showToken ? "text" : "password"} 
                    value={loyverseToken} 
                    onChange={(e) => setLoyverseToken(e.target.value)} 
                    className="w-full text-xs border border-[#1a1a1a] rounded-none pl-3 pr-16 py-2 bg-[#050505] text-white focus:outline-none focus:border-[#FF4D00] transition-colors font-mono"
                  />
                  <button 
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#FF4D00] bg-[#161616] border border-[#1a1a1a] px-2.5 py-1 rounded-none hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                  >
                    {showToken ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#111111] border border-green-800/20 text-green-400 font-bold rounded-none text-xs leading-relaxed uppercase tracking-wider">
                <span className="font-black text-green-500 mr-2">●</span>
                <span className="font-black">Loyverse Sync Status:</span> connected
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => handleSaveSettings('Loyverse POS API')}
                className="px-4 py-2 bg-[#FF4D00] text-white font-black text-xs uppercase tracking-widest rounded-none hover:bg-[#ff5d1a] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> ບັນທຶກ API
              </button>
            </div>
          </div>

          {/* HELP CARD */}
          <div className="glass-panel p-6 rounded-none border-2 border-[#FF4D00]/20 bg-[#0a0a0a] space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#FF4D00]" /> ຕ້ອງການຄວາມຊ່ວຍເຫຼືອບໍ?
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-bold uppercase tracking-wider">
              ລະບົບ **La Dolce Inventory Intelligence** ໄດ້ຮັບການອອກແບບເພື່ອຊິງຄ໌ຂໍ້ມູນຫຼັກຮ່ວມກັບ Loyverse POS. ຖ້າມີບັນຫາສິນຄ້າບໍ່ກົງກັນ, ທ່ານສາມາດກົດປຸ່ມ **"ຊິງຄ໌ Loyverse"** ຢູ່ແຖບດ້ານຊ້າຍເພື່ອດຶງຂໍ້ມູນຫຼ້າສຸດ.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
