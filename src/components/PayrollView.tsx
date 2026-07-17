import { useMemo, useState } from 'react';
import { Employee, AttendanceRecord, PayrollLine } from '../types';
import { generatePayroll } from '../services/payrollService';

interface PayrollViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
}

function firstDayOfMonthIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function PayrollView({ employees, attendance }: PayrollViewProps) {
  const [start, setStart] = useState(firstDayOfMonthIso());
  const [end, setEnd] = useState(todayIso());

  const payroll: PayrollLine[] = useMemo(() => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    return generatePayroll(employees, attendance, startDate, endDate);
  }, [employees, attendance, start, end]);

  const total = payroll.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 space-y-6 text-white">
      <h1 className="text-2xl font-semibold">ສ້າງບິນ Payroll</h1>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs text-white/60 block mb-1">ຈາກວັນທີ</label>
          <input
            type="date"
            value={start}
            onChange={e => setStart(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="text-xs text-white/60 block mb-1">ຫາວັນທີ</label>
          <input
            type="date"
            value={end}
            onChange={e => setEnd(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          />
        </div>
        <button
          onClick={() => window.print()}
          className="ml-auto px-4 py-2 rounded-lg bg-white text-black text-sm font-medium"
        >
          ພິມ / ບັນທຶກ PDF
        </button>
      </div>

      <div className="rounded-xl border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left px-4 py-3">ພະນັກງານ</th>
              <th className="text-left px-4 py-3">ປະເພດຄ່າແຮງ</th>
              <th className="text-right px-4 py-3">ຊົ່ວໂມງ</th>
              <th className="text-right px-4 py-3">ອັດຕາ</th>
              <th className="text-right px-4 py-3">ຍອດເງິນ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {payroll.map(p => (
              <tr key={p.employeeId}>
                <td className="px-4 py-3">{p.employeeName}</td>
                <td className="px-4 py-3 text-white/70">
                  {p.payType === 'hourly' ? 'ລາຍຊົ່ວໂມງ' : 'ເງິນເດືອນຄົງທີ່'}
                </td>
                <td className="px-4 py-3 text-right">
                  {p.payType === 'hourly' ? p.totalHours.toFixed(2) : '-'}
                </td>
                <td className="px-4 py-3 text-right">{p.rate.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {p.amount.toLocaleString()} ₭
                </td>
              </tr>
            ))}
            {payroll.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-white/40">
                  ບໍ່ມີພະນັກງານ
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/20">
              <td colSpan={4} className="px-4 py-3 text-right font-medium">
                ລວມທັງໝົດ
              </td>
              <td className="px-4 py-3 text-right font-bold">{total.toLocaleString()} ₭</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-white/40">
        * ພະນັກງານແບບ "ລາຍຊົ່ວໂມງ" ຄິດໄລ່ຈາກ shift ທີ່ຕອກ Clock In/Out ຄົບໃນຊ່ວງວັນທີທີ່ເລືອກເທົ່ານັ້ນ.
        ພະນັກງານແບບ "ເງິນເດືອນຄົງທີ່" ຈະສະແດງຍອດເງິນເດືອນຄົງທີ່ໂດຍບໍ່ຂຶ້ນກັບຊົ່ວໂມງ.
      </p>
    </div>
  );
}
