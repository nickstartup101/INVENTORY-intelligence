import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import AnalyticsView from './components/AnalyticsView';
import EmployeesView from './components/EmployeesView';
import SettingsView from './components/SettingsView';
import ReportsView from './components/ReportsView';

import {
  initialProducts,
  initialLiquids,
  initialTasks,
  initialLogs,
  initialEmployees,
} from './data';
import { Product, Liquid, Task, ActivityLog, Employee } from './types';

export default function App() {
  // Global States
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [liquids, setLiquids] = useState<Liquid[]>(initialLiquids);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  // Helper to append action log
  const handleLogMessage = (text: string, type: 'success' | 'info' | 'warning' | 'error') => {
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
    setLogs(prev => [newLog, ...prev.slice(0, 15)]);
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
            setProducts={setProducts}
            liquids={liquids}
            setLiquids={setLiquids}
            tasks={tasks}
            setTasks={setTasks}
            logs={logs}
            setLogs={setLogs}
            employees={employees}
          />
        );
      case 'inventory':
        return (
          <InventoryView
            products={products}
            setProducts={setProducts}
            onLogMessage={handleLogMessage}
          />
        );
      case 'analytics':
        return <AnalyticsView products={products} />;
      case 'employees':
        return (
          <EmployeesView
            employees={employees}
            setEmployees={setEmployees}
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
            setProducts={setProducts}
            liquids={liquids}
            setLiquids={setLiquids}
            tasks={tasks}
            setTasks={setTasks}
            logs={logs}
            setLogs={setLogs}
            employees={employees}
          />
        );
    }
  };

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

