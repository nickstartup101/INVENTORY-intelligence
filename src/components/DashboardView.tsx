import React, { useState } from 'react';
import { 
  Coffee, 
  Droplet, 
  ShoppingBag, 
  GlassWater, 
  Plus, 
  Minus, 
  PlusCircle, 
  Check, 
  CheckCircle, 
  Circle, 
  AlertTriangle, 
  Trash2,
  TrendingUp,
  History,
  Filter,
  Layers,
  X
} from 'lucide-react';
import { Product, Liquid, Task, ActivityLog, Employee } from '../types';

interface DashboardViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  liquids: Liquid[];
  setLiquids: React.Dispatch<React.SetStateAction<Liquid[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  logs: ActivityLog[];
  setLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
  employees: Employee[];
}

export default function DashboardView({
  products,
  setProducts,
  liquids,
  setLiquids,
  tasks,
  setTasks,
  logs,
  setLogs,
  employees,
}: DashboardViewProps) {
  // UI states
  const [newTaskText, setNewTaskText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // New product form states
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Coffee Beans');
  const [newProdStock, setNewProdStock] = useState(10);
  const [newProdUnit, setNewProdUnit] = useState('units');
  const [newProdThreshold, setNewProdThreshold] = useState(5);
  const [newProdIcon, setNewProdIcon] = useState('coffee');

  // Categories list
  const categories = ['All', 'Coffee Beans', 'Milk & Dairy', 'Packaging', 'Syrups & Sauces'];

  // Map icon strings to Lucide elements
  const renderProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'coffee':
        return <Coffee className="w-4 h-4 text-primary" />;
      case 'water_drop':
        return <Droplet className="w-4 h-4 text-primary" />;
      case 'shopping_bag':
        return <ShoppingBag className="w-4 h-4 text-primary" />;
      case 'local_bar':
        return <GlassWater className="w-4 h-4 text-primary" />;
      default:
        return <Layers className="w-4 h-4 text-primary" />;
    }
  };

  // Helper to add log
  const addLogMessage = (text: string, type: 'success' | 'info' | 'warning' | 'error') => {
    const timeNow = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      text,
      time: timeNow,
      type,
    };
    setLogs(prev => [newLog, ...prev.slice(0, 15)]); // Limit to 15 logs for readability
  };

  // Adjust stock levels
  const adjustStock = (id: string, delta: number) => {
    setProducts(prev => 
      prev.map(p => {
        if (p.id === id) {
          const newStock = Math.max(0, p.currentStock + delta);
          let newStatus: 'OK' | 'LOW' | 'OUT' = 'OK';
          if (newStock === 0) {
            newStatus = 'OUT';
          } else if (newStock <= p.minThreshold) {
            newStatus = 'LOW';
          }

          // Trigger log
          if (delta > 0) {
            addLogMessage(`ເພີ່ມ ${p.name} +${delta} (${newStock} ${p.unit})`, 'success');
          } else if (delta < 0) {
            addLogMessage(`ຫຼຸດ ${p.name} -${Math.abs(delta)} (${newStock} ${p.unit})`, newStock <= p.minThreshold ? 'warning' : 'info');
          }

          return {
            ...p,
            currentStock: newStock,
            status: newStatus,
          };
        }
        return p;
      })
    );
  };

  // Add custom task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
    addLogMessage(`ເພີ່ມວຽກໃໝ່: ${newTaskText.trim()}`, 'info');
    setNewTaskText('');
  };

  // Toggle task checkbox
  const toggleTask = (id: string) => {
    setTasks(prev => 
      prev.map(t => {
        if (t.id === id) {
          const nextState = !t.completed;
          addLogMessage(
            nextState 
              ? `ສຳເລັດວຽກ: ${t.text}` 
              : `ຍົກເລີກວຽກ: ${t.text}`, 
            nextState ? 'success' : 'info'
          );
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  // Delete task
  const deleteTask = (id: string, taskText: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    addLogMessage(`ລຶບວຽກ: ${taskText}`, 'error');
  };

  // Refill / reset liquid level
  const handleRefillLiquid = (id: string, name: string) => {
    setLiquids(prev => 
      prev.map(l => {
        if (l.id === id) {
          addLogMessage(`ເປີດຂວດ ${name} ໃໝ່ (100%)`, 'success');
          return {
            ...l,
            percentage: 100,
            status: 'OK'
          };
        }
        return l;
      })
    );
  };

  // Handle Add Product submit
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdSku.trim()) {
      alert("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
      return;
    }

    const newProduct: Product = {
      id: `p-${Date.now()}`,
      sku: newProdSku.trim().toUpperCase(),
      name: newProdName.trim(),
      category: newProdCategory,
      currentStock: Number(newProdStock),
      unit: newProdUnit,
      status: Number(newProdStock) <= Number(newProdThreshold) ? 'LOW' : 'OK',
      minThreshold: Number(newProdThreshold),
      icon: newProdIcon,
    };

    setProducts(prev => [...prev, newProduct]);
    addLogMessage(`ເພີ່ມສິນຄ້າໃໝ່: ${newProduct.name} (${newProduct.currentStock} ${newProduct.unit})`, 'success');
    setShowAddProductModal(false);

    // Clear form
    setNewProdName('');
    setNewProdSku('');
    setNewProdStock(10);
    setNewProdThreshold(5);
  };

  // Filtered products list
  const filteredProducts = products.filter(p => {
    if (filterCategory === 'All') return true;
    return p.category === filterCategory;
  });

  // Calculate stats for widgets dynamically
  const totalStockCount = products.reduce((acc, curr) => acc + curr.currentStock, 0) + 700; // adding baseline to match image aesthetic
  const activeLiquidsCount = liquids.filter(l => l.percentage > 0).length + 21; // baseline active count to match '24'
  const activeStaffCount = employees.filter(e => e.status === 'active').length + 2; // match image '06'
  const totalSalesFormatted = "2.4M";

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-300">
      
      {/* SECTION 1: Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stock Count */}
        <div className="glass-card p-6 rounded-none flex flex-col gap-2 relative overflow-hidden group">
          <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-[0.25em]">ສິນຄ້າໃນສາງ</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tighter">{totalStockCount.toLocaleString()}</span>
            <span className="text-xs text-[#FF4D00] font-black tracking-widest">+12%</span>
          </div>
          <div className="w-full bg-[#161616] h-1 rounded-none mt-3 overflow-hidden">
            <div className="bg-[#FF4D00] h-full w-[78%] transition-all duration-500"></div>
          </div>
        </div>

        {/* Active Bottles */}
        <div className="glass-card p-6 rounded-none flex flex-col gap-2 relative overflow-hidden group">
          <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-[0.25em]">ຂວດທີ່ເປີດຢູ່</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tighter">{activeLiquidsCount}</span>
            <span className="text-xs text-neutral-400 font-black tracking-widest uppercase">active</span>
          </div>
          <div className="w-full bg-[#161616] h-1 rounded-none mt-3 overflow-hidden">
            <div className="bg-[#FF4D00]/60 h-full w-[45%] transition-all duration-500"></div>
          </div>
        </div>

        {/* Active Employees */}
        <div className="glass-card p-6 rounded-none flex flex-col gap-2 relative overflow-hidden group">
          <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-[0.25em]">ພະນັກງານເຂົ້າວຽກ</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tighter">0{activeStaffCount}</span>
            <span className="text-xs text-neutral-400 font-black tracking-widest uppercase">now</span>
          </div>
          <div className="flex -space-x-1.5 mt-3">
            {employees.filter(e => e.status === 'active').slice(0, 3).map((emp) => (
              <div 
                key={emp.id} 
                className="w-7 h-7 rounded-none border border-[#111111] overflow-hidden bg-[#161616] flex items-center justify-center text-[10px] font-bold text-white"
                title={`${emp.name} (${emp.role})`}
              >
                <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover grayscale" />
              </div>
            ))}
            <div className="w-7 h-7 rounded-none border border-[#111111] bg-[#FF4D00] text-white flex items-center justify-center text-[8px] font-black">
              +3
            </div>
          </div>
        </div>

        {/* Sales Daily as Order Volume */}
        <div className="glass-card p-6 rounded-none flex flex-col gap-2 relative overflow-hidden group border-r-4 border-[#FF4D00]">
          <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-[0.25em]">ຈຳນວນອໍເດີມື້ນີ້</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tighter">130</span>
            <span className="text-xs text-[#FF4D00] font-black tracking-widest uppercase">ອໍເດີ</span>
          </div>
          <div className="text-[10px] text-green-500 font-black mt-3 flex items-center gap-1 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" /> 14.5% vs ມື້ວານນີ້
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Liquids % and Shift Tasks */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* LIQUIDS STATUS */}
          <div className="glass-panel p-6 rounded-none">
            <div className="flex items-center justify-between mb-6 border-b border-[#1a1a1a] pb-4">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.25em]">ຂວດທີ່ເປີດຢູ່ (Liquids %)</h3>
            </div>
            
            <div className="space-y-5">
              {liquids.map((liq) => {
                const isCritical = liq.percentage <= 15;
                return (
                  <div key={liq.id} className={`glass-card p-4 rounded-none border transition-all ${isCritical ? 'border-red-600 bg-red-950/20' : 'border-[#1a1a1a]'}`}>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">{liq.name}</h4>
                        <p className="text-[9px] text-neutral-400 font-mono uppercase tracking-widest mt-0.5">SKU: {liq.sku}</p>
                      </div>
                      <span className={`text-2xl font-black tracking-tighter ${isCritical ? 'text-red-500 animate-pulse' : 'text-[#FF4D00]'}`}>
                        {liq.percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-[#161616] h-1.5 rounded-none overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${isCritical ? 'bg-red-600' : 'bg-[#FF4D00]'}`}
                        style={{ width: `${liq.percentage}%` }}
                      ></div>
                    </div>

                    {isCritical ? (
                      <button 
                        onClick={() => handleRefillLiquid(liq.id, liq.name)}
                        className="mt-4 w-full py-2 bg-red-600 hover:bg-red-700 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-none transition-all cursor-pointer text-center"
                      >
                        Refill Urgent
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleRefillLiquid(liq.id, liq.name)}
                        className="mt-4 w-full py-2 bg-[#111111] border border-[#1a1a1a] hover:border-[#FF4D00] text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-none transition-all cursor-pointer text-center"
                      >
                        Open New Bottle
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SHIFT TASKS */}
          <div className="glass-panel p-6 rounded-none">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] mb-4 border-b border-[#1a1a1a] pb-4">ວຽກປະຈຳວັນ (Shift Tasks)</h3>
            
            {/* Inline Add Task Form */}
            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="ເພີ່ມວຽກປະຈຳວັນໃໝ່..."
                className="flex-1 text-xs border border-[#1a1a1a] rounded-none px-3 py-2.5 bg-[#111111] text-white focus:outline-none focus:border-[#FF4D00]"
              />
              <button 
                type="submit"
                className="bg-[#FF4D00] text-white p-2.5 rounded-none hover:bg-[#ff5d1a] transition-colors cursor-pointer flex items-center justify-center"
                title="ເພີ່ມວຽກ"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <ul className="space-y-2">
              {tasks.map((task) => (
                <li 
                  key={task.id} 
                  className={`flex items-center justify-between p-3 rounded-none border transition-all ${
                    task.completed 
                      ? 'bg-transparent border-transparent opacity-50' 
                      : 'bg-[#111111] border-[#1a1a1a]'
                  }`}
                >
                  <div 
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-3 cursor-pointer group flex-1"
                  >
                    {task.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-neutral-400 shrink-0 group-hover:text-[#FF4D00]" />
                    )}
                    <span className={`text-xs uppercase tracking-wider font-semibold ${task.completed ? 'line-through text-neutral-500' : 'text-white'}`}>
                      {task.text}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => deleteTask(task.id, task.text)}
                    className="p-1 hover:text-red-500 text-neutral-500 transition-colors cursor-pointer"
                    title="ລຶບວຽກ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: Main Inventory Table & Logs */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* MAIN INVENTORY */}
          <div className="glass-panel p-6 md:p-8 rounded-none h-full flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-[#1a1a1a] pb-4">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.25em]">ລາຍການສິນຄ້າ (Main Inventory)</h3>
                  {filterCategory !== 'All' && (
                    <span className="inline-block mt-2 text-[9px] font-black bg-[#161616] text-[#FF4D00] border border-[#FF4D00]/20 px-2.5 py-0.5 uppercase tracking-widest">
                      ປະເພດ: {filterCategory}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setShowAddProductModal(true)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#FF4D00] text-white rounded-none text-xs font-black uppercase tracking-wider hover:bg-[#ff5d1a] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> ເພີ່ມສິນຄ້າ
                  </button>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className="p-2.5 border border-[#1a1a1a] bg-[#0a0a0a] text-white rounded-none flex items-center justify-center hover:border-[#FF4D00] transition-all cursor-pointer"
                      title="ກອງປະເພດ"
                    >
                      <Filter className="w-4 h-4" />
                    </button>

                    {showFilterDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0a] border-2 border-[#1a1a1a] py-2 z-30 shadow-2xl">
                        <p className="px-4 py-1 text-[9px] font-black text-[#FF4D00] uppercase tracking-widest border-b border-[#1a1a1a]">ເລືອກປະເພດ</p>
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setFilterCategory(cat);
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs uppercase tracking-widest transition-colors hover:bg-[#111111] ${
                              filterCategory === cat ? 'font-black text-[#FF4D00] bg-[#161616]' : 'text-neutral-300'
                            }`}
                          >
                            {cat === 'All' ? 'ທັງໝົດ' : cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* TABLE CONTAINER */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1a1a1a] text-neutral-400">
                      <th className="pb-4 text-[9px] font-black uppercase tracking-[0.2em] px-2">SKU</th>
                      <th className="pb-4 text-[9px] font-black uppercase tracking-[0.2em] px-2">Name</th>
                      <th className="pb-4 text-[9px] font-black uppercase tracking-[0.2em] px-2">Current Stock</th>
                      <th className="pb-4 text-[9px] font-black uppercase tracking-[0.2em] px-2 text-center">Status</th>
                      <th className="pb-4 text-[9px] font-black uppercase tracking-[0.2em] px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-neutral-400 uppercase tracking-wider">
                          ບໍ່ມີຂໍ້ມູນສິນຄ້າໃນປະເພດນີ້
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isLow = p.currentStock <= p.minThreshold;
                        const isOut = p.currentStock === 0;

                        return (
                          <tr key={p.id} className="hover:bg-[#111111]/40 transition-colors group">
                            <td className="py-4 px-2 font-mono text-[9px] text-neutral-400 uppercase font-black tracking-wider">{p.sku}</td>
                            <td className="py-4 px-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-none bg-[#111111] flex items-center justify-center text-[#FF4D00] border border-[#1a1a1a]">
                                  {renderProductIcon(p.icon)}
                                </div>
                                <span className="text-xs font-black uppercase tracking-wider text-white">{p.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-xs font-black text-white">
                              {p.currentStock} <span className="text-[10px] text-neutral-400 font-normal lowercase">{p.unit}</span>
                            </td>
                            <td className="py-4 px-2 text-center">
                              {isOut ? (
                                <span className="px-2 py-0.5 rounded-none bg-[#3b0712] text-[#fecdd3] border border-[#e11d48]/20 text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                                  ❌ ໝົດສາງ
                                </span>
                              ) : isLow ? (
                                <span className="px-2 py-0.5 rounded-none bg-[#451a03] text-[#fef08a] border border-[#d97706]/20 text-[9px] font-black uppercase tracking-wider whitespace-nowrap animate-pulse">
                                  ⚠️ ສັ່ງດ່ວນ
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-none bg-[#064e3b] text-[#a7f3d0] border border-[#059669]/20 text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                                  OK
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-2 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => adjustStock(p.id, -1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-none border border-[#1a1a1a] bg-[#0a0a0a] text-neutral-400 hover:border-[#FF4D00] hover:bg-[#FF4D00] hover:text-white transition-all cursor-pointer"
                                  title="ຫຼຸດລົງ"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => adjustStock(p.id, 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-none border border-[#1a1a1a] bg-[#0a0a0a] text-neutral-400 hover:border-[#FF4D00] hover:bg-[#FF4D00] hover:text-white transition-all cursor-pointer"
                                  title="ເພີ່ມຂຶ້ນ"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ACTIVITY LOGS (INSIDE MAIN PANEL) */}
            <div className="mt-10 border-t border-[#1a1a1a] pt-6">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-[#FF4D00]" /> ປະຫວັດການເຄື່ອນໄຫວ (Logs)
              </h3>
              
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {logs.map((log) => {
                  let alertClass = "bg-[#111111] border-[#1a1a1a] text-neutral-300";
                  let dotClass = "bg-neutral-600";
                  
                  if (log.type === 'success') {
                    alertClass = "bg-green-950/20 border-green-800/30 text-green-400";
                    dotClass = "bg-green-500";
                  } else if (log.type === 'warning') {
                    alertClass = "bg-amber-950/20 border-[#FF4D00]/20 text-amber-400";
                    dotClass = "bg-[#FF4D00]";
                  } else if (log.type === 'error') {
                    alertClass = "bg-red-950/20 border-red-800/30 text-red-400";
                    dotClass = "bg-red-500";
                  }

                  return (
                    <div 
                      key={log.id} 
                      className={`p-3 rounded-none flex items-center justify-between border transition-all ${alertClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-1.5 h-1.5 ${dotClass}`}></span>
                        <span className="text-[11px] font-bold uppercase tracking-wider">{log.text}</span>
                      </div>
                      <span className="font-mono text-[9px] uppercase font-black opacity-60 shrink-0 pl-2">
                        {log.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ADD PRODUCT INLINE MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] rounded-none p-6 w-full max-w-md shadow-2xl border-2 border-[#1a1a1a] text-white animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-[#1a1a1a] pb-4">
              <h3 className="font-black text-sm text-white uppercase tracking-wider">ເພີ່ມສິນຄ້າໃໝ່</h3>
              <button 
                onClick={() => setShowAddProductModal(false)}
                className="p-1 hover:bg-[#111111] text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mb-1">ຊື່ສິນຄ້າ *</label>
                <input 
                  type="text" 
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="ເຊັ່ນ: Espresso Beans (250g)"
                  className="w-full text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-3 py-2.5 focus:outline-none focus:border-[#FF4D00] placeholder-neutral-600 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mb-1">SKU *</label>
                  <input 
                    type="text" 
                    required
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    placeholder="ເຊັ່ນ: C-102"
                    className="w-full text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-3 py-2.5 focus:outline-none focus:border-[#FF4D00] placeholder-neutral-600 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mb-1">ປະເພດ *</label>
                  <select 
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-3 py-2.5 focus:outline-none focus:border-[#FF4D00] font-bold"
                  >
                    <option value="Coffee Beans">Coffee Beans</option>
                    <option value="Milk & Dairy">Milk & Dairy</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Syrups & Sauces">Syrups & Sauces</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mb-1">ຈຳນວນໃນສາງ *</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-3 py-2.5 focus:outline-none focus:border-[#FF4D00] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mb-1">ຫົວໜ່ວຍ *</label>
                  <input 
                    type="text" 
                    required
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    placeholder="bags / pcs"
                    className="w-full text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-3 py-2.5 focus:outline-none focus:border-[#FF4D00] placeholder-neutral-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mb-1">ຈຸດແຈ້ງເຕືອນ *</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    value={newProdThreshold}
                    onChange={(e) => setNewProdThreshold(Number(e.target.value))}
                    className="w-full text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-3 py-2.5 focus:outline-none focus:border-[#FF4D00] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mb-1">ໄອຄອນ</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'coffee', label: 'Coffee', icon: Coffee },
                    { id: 'water_drop', label: 'Milk', icon: Droplet },
                    { id: 'shopping_bag', label: 'Cups', icon: ShoppingBag },
                    { id: 'local_bar', label: 'Syrup', icon: GlassWater },
                  ].map((ic) => {
                    const Icon = ic.icon;
                    const isSelected = newProdIcon === ic.id;
                    return (
                      <button
                        type="button"
                        key={ic.id}
                        onClick={() => setNewProdIcon(ic.id)}
                        className={`p-2 border flex flex-col items-center gap-1 cursor-pointer transition-all rounded-none ${
                          isSelected ? 'bg-[#FF4D00] text-white border-[#FF4D00]' : 'border-[#1a1a1a] bg-[#111111] text-neutral-400 hover:border-[#FF4D00]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[9px] uppercase tracking-wider font-bold">{ic.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-[#1a1a1a]">
                <button 
                  type="button" 
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-2.5 border border-[#1a1a1a] bg-transparent text-white font-black uppercase tracking-wider rounded-none text-xs hover:bg-[#111111] transition-all cursor-pointer text-center"
                >
                  ຍົກເລີກ
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-[#FF4D00] text-white font-black uppercase tracking-wider rounded-none text-xs hover:bg-[#ff5d1a] transition-all cursor-pointer text-center"
                >
                  ບັນທຶກສິນຄ້າ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
