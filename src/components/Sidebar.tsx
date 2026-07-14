import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Users, 
  Settings as SettingsIcon, 
  FileText, 
  RefreshCw, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onSyncLoyverse: () => void;
  isSyncing: boolean;
}

export default function Sidebar({
  currentView,
  onViewChange,
  isCollapsed,
  setIsCollapsed,
  onSyncLoyverse,
  isSyncing,
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'ແຜງຄວບຄຸມ', icon: LayoutDashboard },
    { id: 'inventory', label: 'ສ້າງສິນຄ້າ', icon: Package },
    { id: 'analytics', label: 'ການວິເຄາະ', icon: BarChart3 },
    { id: 'employees', label: 'ພະນັກງານ', icon: Users },
    { id: 'settings', label: 'ການຕັ້ງຄ່າ', icon: SettingsIcon },
    { id: 'reports', label: 'ລາຍງານ', icon: FileText },
  ];

  return (
    <aside 
      className={`h-screen fixed left-0 top-0 bg-[#0a0a0a] flex flex-col py-8 px-4 border-r border-[#1a1a1a] z-50 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-[#161616] rounded-lg transition-colors text-neutral-400 hover:text-[#FF4D00] cursor-pointer"
          title={isCollapsed ? "ຂະຫຍາຍ" : "ພັບເກັບ"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <div className="mb-10 px-2 flex items-center gap-3 overflow-hidden">
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-[#1a1a1a]">
          <img 
            alt="LA DOLCE" 
            className="w-full h-full object-cover grayscale contrast-125" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlb_nPENSA2P3h837_th3Hj8rsUog-b5dwC2Qg2-AGjWn3O-2Gz4Y9IK8A1wKeW4VWanZJ9ouaXRs8Tl0TdxLHw7SyI9Cg6MdxEjIaqDAaFjXTE6kTZntSEPzLjpL8rOkmkREUdoADovb-BeoN_h6JL1wM_69GPXVHXNLdYk2Tihe6Tcjb7Btupr5VnItyyzbJ3u8P7hEXqM2wUMe72Md3rxVy3GSF56CD8fvJdEs4xdEc5ta2KS9pIm2VBNiiYCEdVsY"
            referrerPolicy="no-referrer"
          />
        </div>
        {!isCollapsed && (
          <div className="logo-text transition-opacity duration-300">
            <h1 className="font-black text-2xl text-white leading-none tracking-tighter uppercase">La Dolce</h1>
            <p className="text-[9px] text-[#FF4D00] font-bold tracking-[0.4em] mt-1 uppercase opacity-90">Inventory Intel</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full nav-item flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-[#161616] text-[#FF4D00] font-black border-l-4 border-[#FF4D00]' 
                  : 'text-neutral-400 hover:bg-[#111111] hover:text-[#FF4D00]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF4D00]' : 'text-neutral-400'}`} />
              {!isCollapsed && <span className="nav-label text-xs uppercase tracking-widest font-semibold text-left">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <button 
          onClick={onSyncLoyverse}
          disabled={isSyncing}
          className="w-full py-3 px-4 bg-[#FF4D00] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#ff5d1a] transition-all font-black uppercase tracking-wider text-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {!isCollapsed && (
            <span className="sync-text text-[10px] font-bold uppercase tracking-widest">
              {isSyncing ? 'ກຳລັງຊິງຄ໌...' : 'ຊິງຄ໌ Loyverse'}
            </span>
          )}
        </button>

        <div 
          onClick={() => alert("Logged out from inventory console")}
          className="nav-item flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-red-500 cursor-pointer transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="nav-label text-xs uppercase tracking-widest font-semibold">ອອກຈາກລະບົບ</span>}
        </div>
      </div>
    </aside>
  );
}
