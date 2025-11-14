/**
 * HRService.js
 * خدمة إدارة الموارد البشرية - متكاملة مع الخزينة والمحاسبة
 */

import { dbManager, STORES } from '../../database/IndexedDBManager';
import { autoJournalEntry } from '../accounting/AutoJournalEntry';

class HRService {
  constructor() {
    this.db = dbManager;
    this.journalService = autoJournalEntry;
  }

  /**
   * إضافة موظف جديد
   */
  async addEmployee(employee) {
    try {
      const employeeId = `EMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newEmployee = {
        id: employeeId,
        employee_number: employee.employee_number || this.generateEmployeeNumber(),
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        department: employee.department,
        hire_date: employee.hire_date || new Date().toISOString(),
        salary: employee.salary || 0,
        allowances: employee.allowances || 0, // بدلات
        deductions: employee.deductions || 0, // خصومات
        status: employee.status || 'active', // active, inactive, terminated
        national_id: employee.national_id,
        address: employee.address,
        emergency_contact: employee.emergency_contact,
        notes: employee.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await this.db.add('employees', newEmployee);
      return newEmployee;
    } catch (error) {
      console.error('خطأ في إضافة الموظف:', error);
      throw error;
    }
  }

  /**
   * تحديث بيانات موظف
   */
  async updateEmployee(employeeId, updates) {
    try {
      const employee = await this.db.get('employees', employeeId);
      if (!employee) {
        throw new Error('الموظف غير موجود');
      }

      const updatedEmployee = {
        ...employee,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      await this.db.update('employees', employeeId, updatedEmployee);
      return updatedEmployee;
    } catch (error) {
      console.error('خطأ في تحديث بيانات الموظف:', error);
      throw error;
    }
  }

  /**
   * حذف موظف
   */
  async deleteEmployee(employeeId) {
    try {
      await this.db.delete('employees', employeeId);
      return true;
    } catch (error) {
      console.error('خطأ في حذف الموظف:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع الموظفين
   */
  async getAllEmployees(filters = {}) {
    try {
      let employees = await this.db.getAll('employees');

      if (filters.status) {
        employees = employees.filter(emp => emp.status === filters.status);
      }
      if (filters.department) {
        employees = employees.filter(emp => emp.department === filters.department);
      }

      return employees.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('خطأ في الحصول على الموظفين:', error);
      throw error;
    }
  }

  /**
   * الحصول على موظف بالمعرف
   */
  async getEmployeeById(employeeId) {
    try {
      return await this.db.get('employees', employeeId);
    } catch (error) {
      console.error('خطأ في الحصول على الموظف:', error);
      throw error;
    }
  }

  /**
   * حساب الراتب الصافي
   */
  calculateNetSalary(grossSalary, allowances = 0, deductions = 0) {
    return grossSalary + allowances - deductions;
  }

  /**
   * حساب كشف الرواتب الشهري
   */
  async calculateMonthlyPayroll(month, year) {
    try {
      const employees = await this.getAllEmployees({ status: 'active' });
      const payrollItems = [];
      let totalGross = 0;
      let totalAllowances = 0;
      let totalDeductions = 0;
      let totalNet = 0;

      for (const employee of employees) {
        const grossSalary = employee.salary || 0;
        const allowances = employee.allowances || 0;
        const deductions = employee.deductions || 0;
        const netSalary = this.calculateNetSalary(grossSalary, allowances, deductions);

        payrollItems.push({
          employee_id: employee.id,
          employee_number: employee.employee_number,
          employee_name: employee.name,
          department: employee.department,
          position: employee.position,
          gross_salary: grossSalary,
          allowances: allowances,
          deductions: deductions,
          net_salary: netSalary,
        });

        totalGross += grossSalary;
        totalAllowances += allowances;
        totalDeductions += deductions;
        totalNet += netSalary;
      }

      return {
        month,
        year,
        items: payrollItems,
        summary: {
          total_employees: employees.length,
          total_gross: totalGross,
          total_allowances: totalAllowances,
          total_deductions: totalDeductions,
          total_net: totalNet,
        },
      };
    } catch (error) {
      console.error('خطأ في حساب كشف الرواتب:', error);
      throw error;
    }
  }

  /**
   * صرف الرواتب
   * يحدث: الخزينة (خصم المبلغ)، المحاسبة (قيد الرواتب)
   */
  async processPayroll(month, year, paymentDate = null) {
    try {
      // حساب كشف الرواتب
      const payroll = await this.calculateMonthlyPayroll(month, year);

      // إنشاء سجل صرف الرواتب
      const payrollId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const payrollRecord = {
        id: payrollId,
        payroll_number: this.generatePayrollNumber(),
        month: month,
        year: year,
        payment_date: paymentDate || new Date().toISOString(),
        items: payroll.items,
        total_employees: payroll.summary.total_employees,
        total_gross: payroll.summary.total_gross,
        total_allowances: payroll.summary.total_allowances,
        total_deductions: payroll.summary.total_deductions,
        total_net: payroll.summary.total_net,
        status: 'paid',
        notes: '',
        created_at: new Date().toISOString(),
      };

      // حفظ سجل الرواتب
      await this.db.add('payroll_records', payrollRecord);

      // صرف نقدي من الخزينة
      await this.recordPayrollDisbursement(payrollRecord);

      // تسجيل قيد محاسبي للرواتب
      await this.journalService.createPayrollEntry(payrollRecord);

      return payrollRecord;
    } catch (error) {
      console.error('خطأ في صرف الرواتب:', error);
      throw error;
    }
  }

  /**
   * تسجيل صرف نقدي للرواتب
   */
  async recordPayrollDisbursement(payrollRecord) {
    try {
      const disbursementId = `CD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const disbursement = {
        id: disbursementId,
        reference_type: 'payroll',
        reference_id: payrollRecord.id,
        amount: payrollRecord.total_net,
        payment_method: 'bank_transfer', // أو 'cash'
        date: payrollRecord.payment_date,
        notes: `صرف رواتب شهر ${payrollRecord.month}/${payrollRecord.year}`,
        created_at: new Date().toISOString(),
      };

      await this.db.add('cash_disbursements', disbursement);

      // قيد محاسبي للصرف النقدي
      await this.journalService.createCashDisbursementEntry(disbursement);
    } catch (error) {
      console.error('خطأ في تسجيل صرف الرواتب:', error);
      throw error;
    }
  }

  /**
   * إضافة حضور/غياب موظف
   */
  async recordAttendance(attendance) {
    try {
      const attendanceId = `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newAttendance = {
        id: attendanceId,
        employee_id: attendance.employee_id,
        employee_name: attendance.employee_name,
        date: attendance.date || new Date().toISOString(),
        check_in: attendance.check_in,
        check_out: attendance.check_out,
        status: attendance.status || 'present', // present, absent, late, half_day, vacation
        hours_worked: attendance.hours_worked || 0,
        notes: attendance.notes || '',
        created_at: new Date().toISOString(),
      };

      await this.db.add('attendance_records', newAttendance);
      return newAttendance;
    } catch (error) {
      console.error('خطأ في تسجيل الحضور:', error);
      throw error;
    }
  }

  /**
   * الحصول على سجلات الحضور
   */
  async getAttendanceRecords(filters = {}) {
    try {
      let records = await this.db.getAll('attendance_records');

      if (filters.employee_id) {
        records = records.filter(rec => rec.employee_id === filters.employee_id);
      }
      if (filters.from_date) {
        records = records.filter(rec => new Date(rec.date) >= new Date(filters.from_date));
      }
      if (filters.to_date) {
        records = records.filter(rec => new Date(rec.date) <= new Date(filters.to_date));
      }

      return records.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('خطأ في الحصول على سجلات الحضور:', error);
      throw error;
    }
  }

  /**
   * إضافة إجازة
   */
  async addLeaveRequest(leave) {
    try {
      const leaveId = `LV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newLeave = {
        id: leaveId,
        employee_id: leave.employee_id,
        employee_name: leave.employee_name,
        leave_type: leave.leave_type, // annual, sick, emergency, unpaid
        start_date: leave.start_date,
        end_date: leave.end_date,
        days_count: leave.days_count,
        reason: leave.reason || '',
        status: leave.status || 'pending', // pending, approved, rejected
        approved_by: leave.approved_by || null,
        approved_date: leave.approved_date || null,
        notes: leave.notes || '',
        created_at: new Date().toISOString(),
      };

      await this.db.add('leave_requests', newLeave);
      return newLeave;
    } catch (error) {
      console.error('خطأ في إضافة طلب الإجازة:', error);
      throw error;
    }
  }

  /**
   * الموافقة على/رفض إجازة
   */
  async updateLeaveStatus(leaveId, status, approvedBy) {
    try {
      const leave = await this.db.get('leave_requests', leaveId);
      if (!leave) {
        throw new Error('طلب الإجازة غير موجود');
      }

      const updatedLeave = {
        ...leave,
        status: status,
        approved_by: approvedBy,
        approved_date: new Date().toISOString(),
      };

      await this.db.update('leave_requests', leaveId, updatedLeave);
      return updatedLeave;
    } catch (error) {
      console.error('خطأ في تحديث حالة الإجازة:', error);
      throw error;
    }
  }

  /**
   * الحصول على طلبات الإجازات
   */
  async getLeaveRequests(filters = {}) {
    try {
      let requests = await this.db.getAll('leave_requests');

      if (filters.employee_id) {
        requests = requests.filter(req => req.employee_id === filters.employee_id);
      }
      if (filters.status) {
        requests = requests.filter(req => req.status === filters.status);
      }

      return requests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      console.error('خطأ في الحصول على طلبات الإجازات:', error);
      throw error;
    }
  }

  /**
   * الحصول على سجلات الرواتب
   */
  async getPayrollRecords(filters = {}) {
    try {
      let records = await this.db.getAll('payroll_records');

      if (filters.month) {
        records = records.filter(rec => rec.month === filters.month);
      }
      if (filters.year) {
        records = records.filter(rec => rec.year === filters.year);
      }

      return records.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
    } catch (error) {
      console.error('خطأ في الحصول على سجلات الرواتب:', error);
      throw error;
    }
  }

  /**
   * الحصول على سجل رواتب بالمعرف
   */
  async getPayrollRecordById(payrollId) {
    try {
      return await this.db.get('payroll_records', payrollId);
    } catch (error) {
      console.error('خطأ في الحصول على سجل الرواتب:', error);
      throw error;
    }
  }

  // ==================== وظائف مساعدة ====================

  /**
   * توليد رقم موظف تلقائي
   */
  generateEmployeeNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `E-${timestamp}-${random}`;
  }

  /**
   * توليد رقم كشف رواتب تلقائي
   */
  generatePayrollNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `PAYROLL-${timestamp}-${random}`;
  }

  /**
   * إحصائيات الموارد البشرية
   */
  async getHRStatistics() {
    try {
      const employees = await this.getAllEmployees();
      const activeEmployees = employees.filter(emp => emp.status === 'active');
      const inactiveEmployees = employees.filter(emp => emp.status === 'inactive');

      const totalSalaries = activeEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0);

      // حساب عدد الموظفين حسب القسم
      const departmentCounts = {};
      activeEmployees.forEach(emp => {
        const dept = emp.department || 'غير محدد';
        departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
      });

      return {
        total_employees: employees.length,
        active_employees: activeEmployees.length,
        inactive_employees: inactiveEmployees.length,
        total_monthly_salaries: totalSalaries,
        average_salary: activeEmployees.length > 0 ? totalSalaries / activeEmployees.length : 0,
        employees_by_department: departmentCounts,
      };
    } catch (error) {
      console.error('خطأ في حساب إحصائيات الموارد البشرية:', error);
      throw error;
    }
  }

  /**
   * تقرير حضور موظف
   */
  async getEmployeeAttendanceReport(employeeId, month, year) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const attendance = await this.getAttendanceRecords({
        employee_id: employeeId,
        from_date: startDate.toISOString(),
        to_date: endDate.toISOString(),
      });

      const present = attendance.filter(a => a.status === 'present').length;
      const absent = attendance.filter(a => a.status === 'absent').length;
      const late = attendance.filter(a => a.status === 'late').length;
      const totalHours = attendance.reduce((sum, a) => sum + (a.hours_worked || 0), 0);

      return {
        employee_id: employeeId,
        month,
        year,
        total_days: endDate.getDate(),
        present_days: present,
        absent_days: absent,
        late_days: late,
        total_hours_worked: totalHours,
        attendance_records: attendance,
      };
    } catch (error) {
      console.error('خطأ في إنشاء تقرير الحضور:', error);
      throw error;
    }
  }
}

// Singleton instance
let instance = null;

export const getHRServiceInstance = () => {
  if (!instance) {
    instance = new HRService();
  }
  return instance;
};

export default HRService;
