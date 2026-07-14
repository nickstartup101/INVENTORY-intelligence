import React, { useState } from 'react';
import { Users, Clock, ToggleLeft, ToggleRight, Plus, Check, Coffee } from 'lucide-react';
import { Employee } from '../types';

interface EmployeesViewProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  onLogMessage: (text: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function EmployeesView({ employees, setEmployees, onLogMessage }: EmployeesViewProps) {
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Barista');
  const [newEmpCode, setNewEmpCode] = useState('');

  const toggleEmployeeShift = (id: string, name: string, currentStatus: 'active' | 'inactive') => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const timeNow = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

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
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpCode.trim()) return;

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmpName.trim(),
      code: newEmpCode.trim().toUpperCase(),
      role: newEmpRole,
      status: 'inactive',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    };

    setEmployees(prev => [...prev, newEmp]);
    onLogMessage(`ເພີ່ມພະນັກງານໃໝ່: ${newEmp.name} (${newEmp.role})`, 'success');
    
    // reset form
    setNewEmpName('');
    setNewEmpCode('');
    setShowAddEmployeeForm(false);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-[0.25em]">ລາຍຊື່ພະນັກງານ & ການເຂົ້າ Shift</span>
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-1">MANAGEMENT CONSOLE</h2>
          <p className="text-xs text-neutral-400 mt-1.5 font-bold uppercase tracking-wider">ຕິດຕາມການເຂົ້າ-ອອກວຽກຂອງບາຣິສຕ້າ ແລະ ພະນັກງານໃນແຕ່ລະ Shift ປະຈຳວັນ.</p>
        </div>

        <button 
          onClick={() => setShowAddEmployeeForm(!showAddEmployeeForm)}
          className="px-5 py-2.5 bg-[#FF4D00] text-white font-black text-xs uppercase tracking-widest rounded-none hover:bg-[#ff5d1a] transition-all cursor-pointer flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" /> ເພີ່ມພະນັກງານໃໝ່
        </button>
      </div>

      {/* ADD EMPLOYEE INLINE FORM */}
      {showAddEmployeeForm && (
        <form onSubmit={handleAddEmployee} className="glass-panel p-6 rounded-none space-y-4 max-w-lg animate-in slide-in-from-top-4 duration-200">
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
                placeholder="ເຊັ່ນ: Anousone"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#FF4D00] uppercase tracking-widest mb-1">ລະຫັດພະນັກງານ *</label>
              <input 
                type="text" 
                required
                maxLength={2}
                value={newEmpCode}
                onChange={(e) => setNewEmpCode(e.target.value)}
                className="w-full text-xs border border-[#1a1a1a] bg-[#111111] text-white rounded-none px-3 py-2.5 focus:outline-none focus:border-[#FF4D00] font-bold uppercase"
                placeholder="ເຊັ່ນ: AS"
              />
            </div>
          </div>

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

          <div className="flex gap-2 justify-end pt-2">
            <button 
              type="button" 
              onClick={() => setShowAddEmployeeForm(false)}
              className="px-4 py-2 border border-[#1a1a1a] rounded-none text-xs font-black uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-[#111111] cursor-pointer"
            >
              ຍົກເລີກ
            </button>
            <button 
              type="submit"
              className="px-5 py-2 bg-[#FF4D00] text-white rounded-none text-xs font-black uppercase tracking-wider hover:bg-[#ff5d1a] cursor-pointer"
            >
              ບັນທຶກ
            </button>
          </div>
        </form>
      )}

      {/* EMPLOYEES GRID CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((emp) => {
          const isActive = emp.status === 'active';
          return (
            <div 
              key={emp.id} 
              className={`glass-panel p-6 rounded-none flex flex-col justify-between border-2 transition-all ${
                isActive ? 'border-[#FF4D00] bg-[#111111]' : 'border-[#1a1a1a] opacity-75 bg-[#0a0a0a]'
              }`}
            >
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
                  onClick={() => toggleEmployeeShift(emp.id, emp.name, emp.status)}
                  className="text-[#FF4D00] hover:scale-105 transition-transform cursor-pointer"
                  title={isActive ? "ເລີກວຽກ" : "ເຂົ້າວຽກ"}
                >
                  {isActive ? (
                    <ToggleRight className="w-9 h-9 text-[#FF4D00]" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-neutral-600" />
                  )}
                </button>
              </div>

              <div className="mt-6 border-t border-[#1a1a1a] pt-4 flex justify-between items-center text-xs">
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
          );
        })}
      </div>

    </div>
  );
}
