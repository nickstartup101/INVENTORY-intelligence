import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import AnalyticsView from './components/AnalyticsView';
import EmployeesView from './components/EmployeesView';
import SettingsView from './components/SettingsView';
import ReportsView from './components/ReportsView';

import { Product, Liquid, Task, ActivityLog, Employee, LogType } from './types';
import {
  seedInitialData,
  subscribeToProducts,
  subscribeToLiquids,
  subscribeToTasks,
  subscribeToLogs,
  subscribeToEmployees,
  addLog as writeLog,
  adjustProductStock,
  updateProduct,
  addProduct,
  deleteProduct,
  updateLiquidLevel,
  toggleTask,
  addTask,
  deleteTask,
  updateEmployee,
  addEmployee,
  deleteEmployee,
  clockIn,
  clockOut,
} from './services/inventoryService';

export default function App() {
  // Global States
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ຂໍ້ມູນເຫຼົ່ານີ້ຕອນນີ້ແມ່ນ "cache" ຂອງ Firestore, ອັບເດດອັດຕະໂນມັດ
  // ຜ່ານ onSnapshot — ບໍ່ຕ້ອງອັບເດດ state ໂດຍກົງອີກຕໍ່ໄປ, ໃຫ້ຂຽນຂໍ້ມູນຜ່ານ
  // ຟັງຊັນຈາກ services/inventoryService.ts ແທນ (ຈະ sync ກັບທຸກອຸປະກອນ realtime).
  const [products, setProducts] = useState<Product[]>([]);
  const [liquids, setLiquids] = useState<Liquid[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Bootstrap: seed Firestore (ຄັ້ງດຽວ ຖ້າຍັງວ່າງ) ແລ້ວເປີດ real-time listeners
  useEffect(() => {
    let unsubs: Array<() => void> = [];

    (async () => {
      try {
        await seedInitialData();
      } catch (err) {
        console.error('Seed Firestore ລົ້ມເຫລວ:', err);
      }

      unsubs = [
        subscribeToProducts(setProducts),
        subscribeToLiquids(setLiquids),
        subscribeToTasks(setTasks),
        subscribeToLogs(setLogs),
        subscribeToEmployees(setEmployees),
      ];
      setIsLoading(false);
    })();

    return () => unsubs.forEach(u => u());
  }, []);

  // Helper: ບັນທຶກ log ຜ່ານ Firestore (UI ຈະອັບເດດເອງຜ່ານ subscribeToLogs)
  const handleLogMessage = (text: string, type: LogType) => {
    writeLog(text, type).catch(err => console.error('ບັນທຶກ log ລົ້ມເຫລວ:', err));
  };

  // Loyverse sync simulation trigger
  const handleSyncLoyverse = () => {
    setIsSyncing(true);
    handleLogMessage('ກຳລັງຊິງຄ໌ຂໍ້ມູນກັບລະບົບ Loyverse POS Cloud...', 'info');

    setTimeout(() => {
      setIsSyncing(false);
      handleLogMessage('ຊິງຄ໌ຂໍ້ມູນກັບ Loyverse POS ສຳເລັດ (Sync OK)', 'success');
      alert('ຊິງຄ໌ຂໍ້ມູນກັບ Loyverse POS ສຳເລັດແລ້ວ!');
    }, 1500);
  };

  // Master Search Filter (queries products)
  const getFilteredProducts = () => {
    if (!searchText.trim()) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchText.toLowerCase()) ||
      p.category.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  // Render view based on selection
  const renderCurrentView = () => {
    const searchFilteredProducts = getFilteredProducts();

    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            products={searchFilteredProducts}
            liquids={liquids}
            tasks={tasks}
            logs={logs}
            employees={employees}
            // ຂຽນຂໍ້ມູນຜ່ານ Firestore ໂດຍກົງ, ບໍ່ໃຊ້ setState ໂດຍກົງອີກ
            onAdjustStock={adjustProductStock}
            onUpdateLiquidLevel={updateLiquidLevel}
            onToggleTask={toggleTask}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
          />
        );
      case 'inventory':
        return (
          <InventoryView
            products={products}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
            onAdjustStock={adjustProductStock}
            onLogMessage={handleLogMessage}
          />
        );
      case 'analytics':
        return <AnalyticsView products={products} />;
      case 'employees':
        return (
          <EmployeesView
            employees={employees}
            onAddEmployee={addEmployee}
            onUpdateEmployee={updateEmployee}
            onDeleteEmployee={deleteEmployee}
            onClockIn={clockIn}
            onClockOut={clockOut}
            onLogMessage={handleLogMessage}
          />
        );
      case 'settings':
        return <SettingsView onLogMessage={handleLogMessage} />;
      case 'reports':
        return <ReportsView products={products} liquids={liquids} />;
      default:
        return (
          <DashboardView
            products={searchFilteredProducts}
            liquids={liquids}
            tasks={tasks}
            logs={logs}
            employees={employees}
            onAdjustStock={adjustProductStock}
            onUpdateLiquidLevel={updateLiquidLevel}
            onToggleTask={toggleTask}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <p className="text-sm opacity-70">ກຳລັງເຊື່ອມຕໍ່ Firebase...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#ffffff]">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onSyncLoyverse={handleSyncLoyverse}
        isSyncing={isSyncing}
      />

      {/* MAIN CONTAINER */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          isCollapsed ? 'pl-20' : 'pl-20 md:pl-64'
        }`}
      >
        {/* HEADER BAR */}
        <Header
          searchText={searchText}
          onSearchChange={setSearchText}
          products={products}
        />

        {/* PAGE BODY */}
        <div className="max-w-7xl mx-auto">
          {renderCurrentView()}
        </div>
      </main>
    </div>
  );
}
