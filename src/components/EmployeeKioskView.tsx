import { useState } from 'react';
import { Employee, Product, AttendanceRecord } from '../types';

interface EmployeeKioskViewProps {
  employees: Employee[];
  products: Product[];
  attendance: AttendanceRecord[];
  onClockIn: (employee: Employee) => Promise<void>;
  onClockOut: (employee: Employee) => Promise<void>;
  onAdjustStock: (product: Product, delta: number, actor?: string) => Promise<void>;
}

export default function EmployeeKioskView({
  employees,
  products,
  attendance,
  onClockIn,
  onClockOut,
  onAdjustStock,
}: EmployeeKioskViewProps) {
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [busy, setBusy] = useState(false);

  const openIds = new Set(attendance.filter(a => a.clockOut === null).map(a => a.employeeId));

  const handleToggleClock = async (emp: Employee) => {
    setActiveEmployee(emp);
    setBusy(true);
    try {
      if (openIds.has(emp.id)) {
        await onClockOut(emp);
      } else {
        await onClockIn(emp);
      }
    } catch (err) {
      console.error(err);
      alert('ຕອກບັດລົ້ມເຫລວ, ລອງໃໝ່ອີກຄັ້ງ');
    } finally {
      setBusy(false);
    }
  };

  const handleAdjust = async (product: Product, delta: number) => {
    if (!activeEmployee) {
      alert('ກະລຸນາແຕະຊື່ຂອງເຈົ້າກ່ອນບັນທຶກສິນຄ້າເຂົ້າ-ອອກ');
      return;
    }
    setBusy(true);
    try {
      await onAdjustStock(product, delta, activeEmployee.name);
    } catch (err) {
      console.error(err);
      alert('ບັນທຶກລົ້ມເຫລວ, ລອງໃໝ່ອີກຄັ້ງ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-white">
      <header>
        <h1 className="text-2xl font-semibold">ໜ້າພະນັກງານ</h1>
        <p className="text-sm text-white/50">ແຕະຊື່ຂອງເຈົ້າເພື່ອຕອກບັດ ຫຼື ບັນທຶກສິນຄ້າເຂົ້າ-ອອກ</p>
      </header>

      {/* ຕອກບັດເຂົ້າ-ອອກ */}
      <section>
        <h2 className="text-sm font-medium text-white/70 mb-3">ຕອກບັດ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {employees.map(emp => {
            const isClockedIn = openIds.has(emp.id);
            const isActive = activeEmployee?.id === emp.id;
            return (
              <button
                key={emp.id}
                disabled={busy}
                onClick={() => handleToggleClock(emp)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition ${
                  isActive ? 'border-white' : 'border-white/10'
                } ${isClockedIn ? 'bg-green-500/10' : 'bg-white/5'} disabled:opacity-50`}
              >
                <img src={emp.avatar} alt={emp.name} className="w-16 h-16 rounded-full object-cover" />
                <span className="text-sm font-medium">{emp.name}</span>
                <span className={`text-xs ${isClockedIn ? 'text-green-400' : 'text-white/40'}`}>
                  {isClockedIn ? 'ກຳລັງເຮັດວຽກ — ແຕະເພື່ອອອກ' : 'ແຕະເພື່ອເຂົ້າວຽກ'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ສະຕັອກປັດຈຸບັນ (ອ່ານຢ່າງດຽວ, sync ຈາກ Loyverse ຫຼັງຕັດຂາຍ) */}
      <section>
        <h2 className="text-sm font-medium text-white/70 mb-3">ສະຕັອກປັດຈຸບັນ</h2>
        <div className="rounded-xl border border-white/10 divide-y divide-white/10">
          {products.map(p => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3 gap-3 flex-wrap">
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-white/40">{p.sku} · {p.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    p.status === 'OK'
                      ? 'bg-green-500/15 text-green-400'
                      : p.status === 'LOW'
                      ? 'bg-yellow-500/15 text-yellow-400'
                      : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {p.status}
                </span>
                <span className="text-sm font-semibold w-20 text-right">
                  {p.currentStock} {p.unit}
                </span>
                {activeEmployee && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleAdjust(p, -1)}
                      disabled={busy}
                      className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleAdjust(p, 1)}
                      disabled={busy}
                      className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {!activeEmployee && (
          <p className="text-xs text-white/30 mt-2">ແຕະຊື່ດ້ານເທິງກ່ອນ ຈຶ່ງຈະບັນທຶກສິນຄ້າເຂົ້າ-ອອກໄດ້</p>
        )}
      </section>
    </div>
  );
}
