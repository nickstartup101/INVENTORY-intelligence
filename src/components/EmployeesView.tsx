import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  ToggleLeft, 
  ToggleRight, 
  Plus, 
  Check, 
  Coffee, 
  Key, 
  Delete, 
  History, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  XCircle, 
  ArrowLeft,
  Trash2,
  Calendar
} from 'lucide-react';
import { Employee } from '../types';

interface EmployeesViewProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  onLogMessage: (text: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

interface ClockLog {
  id: string;
  employeeName: string;
  employeeRole: string;
  type: 'clock_in' | 'clock_out';
  time: string;
  date: string;
}

export default function EmployeesView({ employees, setEmployees, onLogMessage }: EmployeesViewProps) {
  // Tabs: 'directory' | 'pinpad' | 'logs'
  const [activeTab, setActiveTab] = useState<'directory' | 'pinpad' | 'logs'>('directory');
  
  // Existing directory state
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Barista');
  const [newEmpCode, setNewEmpCode] = useState('');
  const [newEmpPin, setNewEmpPin] = useState('');

  // Eye-toggle visibility for each employee's PIN in the directory
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});

  // --- PIN Pad State ---
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [authenticatedEmployee, setAuthenticatedEmployee] = useState<Employee | null>(null);
  const [clockActionSuccess, setClockActionSuccess] = useState<string | null>(null);

  // --- Clock Logs State ---
  const [clockLogs, setClockLogs] = useState<ClockLog[]>(() => {
    const saved = localStorage.getItem('la_dolce_clock_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Return default initial logs matching default employees who are active
    const todayStr = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return [
      {
        id: 'cl-1',
        employeeName: 'Somchai',
        employeeRole: 'Barista',
        type: 'clock_in',
        time: '07:30 AM',
        date: todayStr
      },
      {
        id: 'cl-2',
        employeeName: 'Alounny',
        employeeRole: 'Cashier',
        type: 'clock_in',
        time: '07:45 AM',
        date: todayStr
      },
      {
        id: 'cl-3',
        employeeName: 'Soulikone',
        employeeRole: 'Store Manager',
        type: 'clock_in',
        time: '08:00 AM',
        date: todayStr
      },
      {
        id: 'cl-4',
        employeeName: 'Vanh',
        employeeRole: 'Barista',
        type: 'clock_in',
        time: '08:15 AM',
        date: todayStr
      }
    ];
  });

  // Save Clock Logs to LocalStorage
  useEffect(() => {
    localStorage.setItem('la_dolce_clock_logs', JSON.stringify(clockLogs));
  }, [clockLogs]);

  // Toggle PIN visibility helper
  const togglePinVisibility = (empId: string) => {
    setShowPins(prev => ({
      ...prev,
      [empId]: !prev[empId]
    }));
  };

  // Manual toggle of employee shift from directory list
  const toggleEmployeeShiftManual = (id: string, name: string, currentStatus: 'active' | 'inactive') => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const timeNow = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const dateToday = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    setEmployees(prev => 
      prev.map(e => {
        if (e.id === id) {
          if (nextStatus === 'active') {
            onLogMessage(`ພະນັກງານ ${name} ເຂົ້າວຽກ (Clock-in) ເວລາ ${timeNow}`, 'success');
            return {
              ...e,
              status: 'active',
              clockInTime: timeNow,
            };
          } else {
            onLogMessage(`ພະນັກງານ ${name} ເລີກວຽກ (Clock-out)`, 'info');
            return {
              ...e,
              status: 'inactive',
              clockInTime: undefined,
            };
          }
        }
        return e;
      })
    );

    // Create Clock Log
    const newLog: ClockLog = {
      id: `cl-${Date.now()}`,
      employeeName: name,
      employeeRole: emp.role,
      type: nextStatus === 'active' ? 'clock_in' : 'clock_out',
      time: timeNow,
      date: dateToday
    };
    setClockLogs(prev => [newLog, ...prev]);
  };

  // Add Employee with PIN
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpCode.trim()) return;

    // Default pin is random 6 digits if not provided
    const pinStr = newEmpPin.trim() || Math.floor(100000 + Math.random() * 900000).toString();

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmpName.trim(),
      code: newEmpCode.trim().toUpperCase(),
      role: newEmpRole,
      status: 'inactive',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      pin: pinStr
    };

    setEmployees(prev => [...prev, newEmp]);
    onLogMessage(`ເພີ່ມພະນັກງານໃໝ່: ${newEmp.name} (${newEmp.role}) ລະຫັດ PIN: ${pinStr}`, 'success');
    
    // Reset form
    setNewEmpName('');
    setNewEmpCode('');
    setNewEmpPin('');
    setShowAddEmployeeForm(false);
  };

  // PIN Pad button press handler
  const handlePinPress = (num: string) => {
    setPinError('');
    if (enteredPin.length < 6) {
      const nextPin = enteredPin + num;
      setEnteredPin(nextPin);
      
      // Auto submit on 6th digit
      if (nextPin.length === 6) {
        verifyPin(nextPin);
      }
    }
  };

  // Delete last entered digit
  const handlePinDelete = () => {
    setPinError('');
    setEnteredPin(prev => prev.slice(0, -1));
  };

  // Clear entered PIN
  const handlePinClear = () => {
    setPinError('');
    setEnteredPin('');
    setAuthenticatedEmployee(null);
  };

  // Verify PIN helper
  const verifyPin = (pinToVerify: string) => {
    const matched = employees.find(emp => emp.pin === pinToVerify);
    if (matched) {
      setAuthenticatedEmployee(matched);
      setPinError('');
    } else {
      setPinError('ລະຫັດ PIN ບໍ່ຖືກຕ້ອງ! ກະລຸນາລອງໃໝ່.');
      setEnteredPin('');
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }
  };

  // Execute Clock In / Out action from PIN pad
  const handleClockAction = (type: 'clock_in' | 'clock_out') => {
    if (!authenticatedEmployee) return;

    const timeNow = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const dateToday = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const isClockIn = type === 'clock_in';

    // Update global state
    setEmployees(prev => 
      prev.map(e => {
        if (e.id === authenticatedEmployee.id) {
          return {
            ...e,
            status: isClockIn ? 'active' : 'inactive',
            clockInTime: isClockIn ? timeNow : undefined
          };
        }
        return e;
      })
    );

    // Save local Clock Log
    const newLog: ClockLog = {
      id: `cl-${Date.now()}`,
      employeeName: authenticatedEmployee.name,
      employeeRole: authenticatedEmployee.role,
      type: type,
      time: timeNow,
      date: dateToday
    };
    setClockLogs(prev => [newLog, ...prev]);

    // System log message
    if (isClockIn) {
      onLogMessage(`[PIN Pad] ພະນັກງານ ${authenticatedEmployee.name} ເຂົ້າວຽກ ເວລາ ${timeNow}`, 'success');
    } else {
      onLogMessage(`[PIN Pad] ພະນັກງານ ${authenticatedEmployee.name} ເລີກວຽກ ເວລາ ${timeNow}`, 'info');
    }

    // Show success screen
    setClockActionSuccess(
      isClockIn 
        ? `ພະນັກງານ ${authenticatedEmployee.name} ເຂົ້າວຽກ (Clocked In) ເວລາ ${timeNow} ສຳເລັດ!`
        : `ພະນັກງານ ${authenticatedEmployee.name} ເລີກວຽກ (Clocked Out) ເວລາ ${timeNow} ສຳເລັດ!`
    );

    // Clear and reset PIN Pad after short delay
    setTimeout(() => {
      setClockActionSuccess(null);
      setAuthenticatedEmployee(null);
      setEnteredPin('');
    }, 2500);
  };

  // Clear all Clock logs
  const handleClearLogs = () => {
    if (window.confirm('ທ່ານຕ້ອງການລຶບປະຫວັດການເຂົ້າ-ອອກວຽກທັງໝົດແທ້ຫຼືບໍ່?')) {
      setClockLogs([]);
      onLogMessage('ລຶບປະຫວັດການເຂົ້າ-ອອກວຽກທັງໝົດແລ້ວ', 'error');
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-[#1a1a1a] pb-6">
        <div>
          <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-[0.25em]">ລະບົບຈັດການພະນັກງານ & ບັນທຶກເວລາ</span>
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-1">STAFF & CLOCK CONTROL TERMINAL</h2>
          <p className="text-xs text-neutral-400 mt-1.5 font-bold uppercase tracking-wider">
            ຈັດການພະນັກງານ, ເຂົ້າ-ອອກວຽກຜ່ານ PIN pad ລະຫັດ 6 ຕົວ ແລະ ຕິດຕາມປະຫວັດການເຮັດວຽກຂອງ Shift ແຕ່ລະມື້.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-[#0a0a0a] p-1 border-2 border-[#1a1a1a] rounded-none self-start">
          <button
            onClick={() => {
              setActiveTab('directory');
              handlePinClear();
            }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'directory' ? 'bg-[#FF4D00] text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> ພະນັກງານທັງໝົດ
          </button>
          <button
            onClick={() => {
              setActiveTab('pinpad');
              handlePinClear();
            }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'pinpad' ? 'bg-[#FF4D00] text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" /> ເຄື່ອງສະແກນ PIN
          </button>
          <button
            onClick={() => {
              setActiveTab('logs');
              handlePinClear();
            }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'logs' ? 'bg-[#FF4D00] text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" /> ປະຫວັດການເຂົ້າ-ອອກ
          </button>
        </div>
      </div>

      {/* --- TAB 1: ALL EMPLOYEES DIRECTORY --- */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-[#FF4D00] uppercase tracking-[0.25em]">ລາຍຊື່ພະນັກງານໃນລະບົບ ({employees.length})</h3>
            
            <button 
              onClick={() => setShowAddEmployeeForm(!showAddEmployeeForm)}
              className="px-4 py-2 bg-[#FF4D00] hover:bg-[#ff5d1a] text-white font-black text-[10px] uppercase tracking-widest rounded-none transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> ເພີ່ມພະນັກງານໃໝ່
            </button>
          </div>

          {/* ADD EMPLOYEE INLINE FORM */}
          {showAddEmployeeForm && (
            <form onSubmit={handleAddEmployee} className="glass-panel p-6 rounded-none space-y-4 max-w-lg border-2 border-[#1a1a1a] bg-[#0a0a0a] animate-in slide-in-from-top-4 duration-200">
              <h3 className="font-black text-xs text-white uppercase tracking-widest border-b border-[#1a1a1a] pb-2">ລາຍລະອຽດພະນັກງານໃໝ່</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mb-1">ຊື່ພະນັກງານ *</label>
                  <input 
                    type="text" 
                    required
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    className="w-full text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-3 py-2.5 focus:outline-none focus:border-[#FF4D00] font-bold"
                    placeholder="ເຊັ່ນ: Keo"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mb-1">ລະຫັດພະນັກງານ (2 ຕົວ) *</label>
                  <input 
                    type="text" 
                    required
                    maxLength={2}
                    value={newEmpCode}
                    onChange={(e) => setNewEmpCode(e.target.value)}
                    className="w-full text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-3 py-2.5 focus:outline-none focus:border-[#FF4D00] font-bold uppercase"
                    placeholder="ເຊັ່ນ: KO"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mb-1">ຕຳແໜ່ງ / ໜ້າທີ່</label>
                  <select 
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                    className="w-full text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-3 py-2.5 focus:outline-none focus:border-[#FF4D00] font-bold"
                  >
                    <option value="Barista">Barista (ບາຣິສຕ້າ)</option>
                    <option value="Cashier">Cashier (ພະນັກງານເກັບເງິນ)</option>
                    <option value="Store Manager">Store Manager (ຜູ້ຈັດການຮ້ານ)</option>
                    <option value="Assistant">Assistant (ຜູ້ຊ່ວຍທົ່ວໄປ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mb-1">ລະຫັດ PIN (6 ຕົວເລກ)</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    pattern="\d{6}"
                    value={newEmpPin}
                    onChange={(e) => setNewEmpPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-3 py-2.5 focus:outline-none focus:border-[#FF4D00] font-mono font-bold"
                    placeholder="ເຊັ່ນ: 123456 (ເວັ້ນວ່າງໄວ້ເພື່ອສຸ່ມ)"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 text-xs">
                <button 
                  type="button" 
                  onClick={() => setShowAddEmployeeForm(false)}
                  className="px-4 py-2 border border-[#1a1a1a] rounded-none font-black uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-[#111111] cursor-pointer"
                >
                  ຍົກເລີກ
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#FF4D00] text-white rounded-none font-black uppercase tracking-wider hover:bg-[#ff5d1a] cursor-pointer"
                >
                  บันทຶກ
                </button>
              </div>
            </form>
          )}

          {/* EMPLOYEES GRID CARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((emp) => {
              const isActive = emp.status === 'active';
              const showPin = showPins[emp.id] || false;
              
              return (
                <div 
                  key={emp.id} 
                  className={`glass-panel p-6 rounded-none flex flex-col justify-between border-2 transition-all relative overflow-hidden ${
                    isActive ? 'border-[#FF4D00] bg-[#111111]' : 'border-[#1a1a1a] opacity-80 bg-[#0a0a0a]'
                  }`}
                >
                  {/* Decorative diagonal active band */}
                  {isActive && (
                    <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                      <div className="bg-[#FF4D00] text-white text-[7px] font-black uppercase tracking-widest text-center py-1 rotate-45 translate-x-4 translate-y-3 w-24 border-b border-white/20">
                        ACTIVE
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-none overflow-hidden bg-[#111111] border border-[#1a1a1a]">
                        <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover grayscale contrast-125" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-white text-base uppercase tracking-tight">{emp.name}</h4>
                          <span className="font-mono text-[9px] bg-[#1a1a1a] text-[#FF4D00] font-black px-1.5 py-0.5 border border-[#FF4D00]/20 uppercase tracking-widest">
                            {emp.code}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                          <Coffee className="w-3.5 h-3.5 text-[#FF4D00]" /> {emp.role}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => toggleEmployeeShiftManual(emp.id, emp.name, emp.status)}
                      className="text-[#FF4D00] hover:scale-105 transition-transform cursor-pointer"
                      title={isActive ? "ເລີກວຽກ (Clock-out)" : "ເຂົ້າວຽກ (Clock-in)"}
                    >
                      {isActive ? (
                        <ToggleRight className="w-9 h-9 text-[#FF4D00]" />
                      ) : (
                        <ToggleLeft className="w-9 h-9 text-neutral-600" />
                      )}
                    </button>
                  </div>

                  {/* PIN Display & Status */}
                  <div className="mt-6 pt-4 border-t border-[#1a1a1a] space-y-3">
                    {/* PIN reveal */}
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[9px] text-neutral-400 font-black uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-3 h-3 text-[#FF4D00]" /> ລະຫັດ PIN ສະແກນ:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm tracking-widest font-black text-white">
                          {showPin ? emp.pin || '123456' : '••••••'}
                        </span>
                        <button 
                          type="button"
                          onClick={() => togglePinVisibility(emp.id)}
                          className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Shift Status */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5 text-neutral-400 uppercase tracking-widest text-[9px] font-black">
                        <Clock className="w-3.5 h-3.5 text-[#FF4D00]" />
                        <span>ສະຖານະ:</span>
                      </div>
                      
                      {isActive ? (
                        <span className="px-2.5 py-0.5 bg-[#064e3b] text-[#a7f3d0] border border-[#059669]/20 rounded-none font-black text-[9px] uppercase tracking-widest flex items-center gap-1">
                          <Check className="w-3 h-3" /> On Shift {emp.clockInTime ? `(${emp.clockInTime})` : ''}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-[#1a1a1a] text-neutral-400 border border-[#262626] rounded-none font-black text-[9px] uppercase tracking-widest">
                          Off Duty
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 2: INTERACTIVE PIN PAD CONTROLLER --- */}
      {activeTab === 'pinpad' && (
        <div className="max-w-md mx-auto">
          <div className="glass-panel p-6 md:p-8 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a] space-y-6 flex flex-col items-center">
            
            {/* Upper text */}
            <div className="text-center">
              <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-[0.25em]">ສະຖານີລົງເວລາເຮັດວຽກ</span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mt-1">STAFF PIN TERMINAL</h3>
              <p className="text-[11px] text-neutral-400 mt-1 uppercase font-bold tracking-wide">
                ກະລຸນາປ້ອນລະຫັດ PIN 6 ຕົວ ເພື່ອ ເຂົ້າວຽກ ຫຼື ເລີກວຽກ
              </p>
            </div>

            {/* If a staff is authenticated, show clock-in/out options */}
            {authenticatedEmployee ? (
              <div className="w-full p-4 border border-[#FF4D00] bg-[#111111]/80 text-center space-y-6 py-8 animate-in zoom-in-95 duration-200">
                {clockActionSuccess ? (
                  <div className="space-y-4 py-4">
                    <div className="w-16 h-16 bg-green-950 border border-green-500 rounded-none flex items-center justify-center mx-auto text-green-400">
                      <Check className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-black text-white leading-relaxed uppercase tracking-wider">
                      {clockActionSuccess}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest animate-pulse">
                      ກຳລັງໂຫຼດໜ້າຈໍຄືນອັດຕະໂນມັດ...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-none overflow-hidden border-2 border-[#FF4D00] grayscale">
                        <img src={authenticatedEmployee.avatar} alt={authenticatedEmployee.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-2">
                          <h4 className="text-lg font-black text-white uppercase tracking-wider">{authenticatedEmployee.name}</h4>
                          <span className="text-[9px] bg-neutral-900 border border-neutral-800 text-[#FF4D00] font-black px-1.5 py-0.5 font-mono uppercase tracking-widest">
                            {authenticatedEmployee.code}
                          </span>
                        </div>
                        <p className="text-xs text-[#FF4D00] font-bold uppercase tracking-widest mt-0.5">{authenticatedEmployee.role}</p>
                      </div>
                    </div>

                    <div className="border-t border-[#1a1a1a] pt-4 text-xs font-bold uppercase tracking-wider">
                      <span className="text-neutral-400">ສະຖານະປັດຈຸບັນ: </span>
                      {authenticatedEmployee.status === 'active' ? (
                        <span className="text-green-400">ກຳລັງເຮັດວຽກຢູ່ (ON SHIFT)</span>
                      ) : (
                        <span className="text-neutral-500">ຢູ່ນອກເວລາວຽກ (OFF DUTY)</span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {authenticatedEmployee.status === 'inactive' ? (
                        <button
                          onClick={() => handleClockAction('clock_in')}
                          className="flex-1 py-3 bg-green-700 hover:bg-green-600 text-white font-black text-xs uppercase tracking-widest rounded-none transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Unlock className="w-4 h-4" /> CLOCK IN (ເຂົ້າວຽກ)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleClockAction('clock_out')}
                          className="flex-1 py-3 bg-[#FF4D00] hover:bg-[#ff5d1a] text-white font-black text-xs uppercase tracking-widest rounded-none transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4" /> CLOCK OUT (ເລີກວຽກ)
                        </button>
                      )}

                      <button
                        onClick={handlePinClear}
                        className="py-3 px-4 border border-[#1a1a1a] text-neutral-400 hover:text-white hover:bg-neutral-900 font-black text-xs uppercase tracking-widest rounded-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ArrowLeft className="w-4 h-4" /> ຍົກເລີກ
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Dots indicator for entered PIN */}
                <div className="flex items-center justify-center gap-4 py-2">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <div 
                      key={idx}
                      className={`w-4 h-4 border-2 transition-all ${
                        idx < enteredPin.length 
                          ? 'bg-[#FF4D00] border-[#FF4D00] scale-110 shadow-[0_0_8px_#FF4D00]' 
                          : 'bg-transparent border-[#1a1a1a]'
                      }`}
                    />
                  ))}
                </div>

                {/* PIN Error feedback */}
                {pinError && (
                  <div className="text-red-500 font-black text-[11px] text-center uppercase tracking-wider bg-red-950/20 border border-red-900/30 px-4 py-2 w-full">
                    ⚠️ {pinError}
                  </div>
                )}

                {/* 10-key numeric keypad */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handlePinPress(num)}
                      className="w-full h-16 border border-[#1a1a1a] bg-[#111111]/50 text-white font-mono text-xl font-black rounded-none hover:border-[#FF4D00] hover:bg-[#FF4D00]/10 hover:text-[#FF4D00] transition-all cursor-pointer flex items-center justify-center active:scale-95"
                    >
                      {num}
                    </button>
                  ))}
                  
                  {/* Clear Key */}
                  <button
                    type="button"
                    onClick={handlePinClear}
                    className="w-full h-16 border border-[#1a1a1a] bg-[#111111]/30 text-neutral-400 hover:text-white font-black rounded-none hover:border-red-500 hover:bg-red-500/10 text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center active:scale-95"
                  >
                    Clear
                  </button>

                  {/* 0 Key */}
                  <button
                    type="button"
                    onClick={() => handlePinPress('0')}
                    className="w-full h-16 border border-[#1a1a1a] bg-[#111111]/50 text-white font-mono text-xl font-black rounded-none hover:border-[#FF4D00] hover:bg-[#FF4D00]/10 hover:text-[#FF4D00] transition-all cursor-pointer flex items-center justify-center active:scale-95"
                  >
                    0
                  </button>

                  {/* Delete/Backspace Key */}
                  <button
                    type="button"
                    onClick={handlePinDelete}
                    className="w-full h-16 border border-[#1a1a1a] bg-[#111111]/30 text-neutral-400 hover:text-white font-black rounded-none hover:border-[#FF4D00] hover:bg-[#FF4D00]/10 transition-all cursor-pointer flex items-center justify-center active:scale-95"
                    title="ลຶບ"
                  >
                    <Delete className="w-5 h-5 text-neutral-400 group-hover:text-white" />
                  </button>
                </div>
              </>
            )}

            {/* Quick Helper Pin Reference for Demo */}
            <div className="w-full border-t border-[#1a1a1a] pt-4 text-center">
              <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">ສຳລັບທົດສອບ (Quick Reference Pins):</span>
              <div className="flex flex-wrap gap-1.5 justify-center mt-1.5">
                {employees.map(emp => (
                  <span 
                    key={emp.id} 
                    className="text-[9px] bg-neutral-900 border border-[#1a1a1a] text-neutral-400 px-1.5 py-0.5 font-bold cursor-pointer hover:border-[#FF4D00] hover:text-white"
                    onClick={() => {
                      setEnteredPin(emp.pin || '1234');
                      verifyPin(emp.pin || '1234');
                    }}
                  >
                    {emp.name}: {emp.pin}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- TAB 3: CLOCK LOGS HISTORY TABLE --- */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-black text-[#FF4D00] uppercase tracking-[0.25em]">ປະຫວັດການເຂົ້າ-ອອກວຽກຂອງພະນັກງານ</h3>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
                ບັນທຶກທຸກລາຍການສະແກນ PIN ແລະ ປ່ຽນ Shift ຂອງພະນັກງານໃນຮ້ານ.
              </p>
            </div>

            {clockLogs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-none text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 self-start"
              >
                <Trash2 className="w-3.5 h-3.5" /> ລຶບປະຫວັດທັງໝົດ
              </button>
            )}
          </div>

          <div className="glass-panel p-6 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a]">
            {clockLogs.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 space-y-2">
                <Clock className="w-10 h-10 mx-auto text-neutral-600 animate-pulse" />
                <p className="text-xs font-black uppercase tracking-widest">ບໍ່ມີປະຫວັດການລົງເວລາໃນລະບົບ</p>
                <p className="text-[10px] uppercase">ກະລຸນາໄປທີ່ແທັບ "ເຄື່ອງສະແກນ PIN" ເພື່ອເລີ່ມຕົ້ນ Clock In/Out.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1a1a1a] text-neutral-400 text-[9px] font-black uppercase tracking-[0.2em]">
                      <th className="pb-4 px-3">ວັນທີ (Date)</th>
                      <th className="pb-4 px-3">ຊື່ພະນັກງານ (Employee)</th>
                      <th className="pb-4 px-3">ຕຳແໜ່ງ (Role)</th>
                      <th className="pb-4 px-3">ລາຍການເຮັດວຽກ (Action)</th>
                      <th className="pb-4 px-3 text-right">ເວລາສະແກນ (Time)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a] text-xs">
                    {clockLogs.map((log) => {
                      const isClockIn = log.type === 'clock_in';
                      return (
                        <tr key={log.id} className="hover:bg-[#111111]/40 transition-colors">
                          {/* Date */}
                          <td className="py-4 px-3 text-neutral-400 font-mono flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#FF4D00]" />
                            <span>{log.date}</span>
                          </td>

                          {/* Employee Name */}
                          <td className="py-4 px-3 font-black text-white uppercase tracking-wider">
                            {log.employeeName}
                          </td>

                          {/* Role */}
                          <td className="py-4 px-3 text-neutral-400 font-bold uppercase tracking-wider">
                            {log.employeeRole}
                          </td>

                          {/* Action badge */}
                          <td className="py-4 px-3">
                            {isClockIn ? (
                              <span className="px-2 py-0.5 rounded-none bg-[#064e3b] text-[#a7f3d0] border border-[#059669]/20 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                🟢 CLOCK IN (ເຂົ້າວຽກ)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-none bg-[#451a03] text-[#fef08a] border border-[#d97706]/20 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                🔴 CLOCK OUT (ເລີກວຽກ)
                              </span>
                            )}
                          </td>

                          {/* Time */}
                          <td className="py-4 px-3 text-right text-white font-mono font-bold">
                            {log.time}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
