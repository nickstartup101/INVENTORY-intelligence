import { AttendanceRecord, Employee, PayrollLine } from '../types';

const MS_PER_HOUR = 1000 * 60 * 60;

export function calculateHoursInRange(
  records: AttendanceRecord[],
  employeeId: string,
  start: number,
  end: number
): number {
  return records
    .filter(r => r.employeeId === employeeId && r.clockIn >= start && r.clockIn <= end && r.clockOut)
    .reduce((sum, r) => sum + (r.clockOut! - r.clockIn) / MS_PER_HOUR, 0);
}

// ຄິດໄລ່ Payroll ຂອງພະນັກງານທັງໝົດໃນຊ່ວງເວລາທີ່ກຳນົດ.
// - ພະນັກງານແບບ hourly: ຊົ່ວໂມງ x hourlyRate
// - ພະນັກງານແບບ salary: ໃຊ້ monthlySalary ຄົງທີ່ (ບໍ່ຂຶ້ນກັບຊົ່ວໂມງ)
export function generatePayroll(
  employees: Employee[],
  records: AttendanceRecord[],
  periodStart: Date,
  periodEnd: Date
): PayrollLine[] {
  const start = periodStart.getTime();
  const end = periodEnd.getTime();
  const periodStartStr = periodStart.toISOString().slice(0, 10);
  const periodEndStr = periodEnd.toISOString().slice(0, 10);

  return employees.map(emp => {
    const totalHours = Math.round(calculateHoursInRange(records, emp.id, start, end) * 100) / 100;

    if (emp.payType === 'salary') {
      const amount = emp.monthlySalary ?? 0;
      return {
        employeeId: emp.id,
        employeeName: emp.name,
        payType: 'salary',
        totalHours,
        rate: amount,
        amount,
        periodStart: periodStartStr,
        periodEnd: periodEndStr,
      };
    }

    const rate = emp.hourlyRate ?? 0;
    const amount = Math.round(totalHours * rate * 100) / 100;
    return {
      employeeId: emp.id,
      employeeName: emp.name,
      payType: 'hourly',
      totalHours,
      rate,
      amount,
      periodStart: periodStartStr,
      periodEnd: periodEndStr,
    };
  });
}
