// ======================================
// Mock Data Service - خدمة البيانات الوحدة
// خدمة موحدة للوصول لجميع البيانات
// ======================================

import mockData from '../data/mockData';

// محاكاة تأخير الشبكة
const simulateNetworkDelay = (ms = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

class MockDataService {
  constructor() {
    this.data = mockData;
  }

  // ======== بيانات المخازن ========
  getWarehouses() {
    return this.data.warehouses;
  }

  getWarehouse(id) {
    return this.data.warehouses.find(w => w.id === parseInt(id));
  }

  // ======== بيانات المنتجات ========
  getProducts() {
    return this.data.products;
  }

  getProduct(id) {
    return this.data.products.find(p => p.id === parseInt(id));
  }

  getProductsByCategory(categoryId) {
    return this.data.products.filter(p => p.categoryId === parseInt(categoryId));
  }

  getLowStockProducts() {
    return this.data.products.filter(p => p.mainQuantity <= p.minStockLevel);
  }

  // ======== بيانات الفئات ========
  getCategories() {
    return this.data.categories;
  }

  getCategory(id) {
    return this.data.categories.find(c => c.id === parseInt(id));
  }

  // ======== بيانات الموردين ========
  getSuppliers() {
    return this.data.suppliers;
  }

  getSupplier(id) {
    return this.data.suppliers.find(s => s.id === parseInt(id));
  }

  // ======== بيانات العملاء ========
  getCustomers() {
    return this.data.customers;
  }

  getCustomer(id) {
    return this.data.customers.find(c => c.id === parseInt(id));
  }

  // ======== بيانات فواتير المشتريات ========
  getPurchaseInvoices() {
    return this.data.purchaseInvoices;
  }

  getPurchaseInvoice(id) {
    return this.data.purchaseInvoices.find(inv => inv.id === parseInt(id));
  }

  getPurchaseInvoicesBySupplier(supplierId) {
    return this.data.purchaseInvoices.filter(inv => inv.supplierId === parseInt(supplierId));
  }

  // ======== بيانات فواتير المبيعات ========
  getSalesInvoices() {
    return this.data.salesInvoices;
  }

  getSalesInvoice(id) {
    return this.data.salesInvoices.find(inv => inv.id === parseInt(id));
  }

  getSalesInvoicesByCustomer(customerId) {
    return this.data.salesInvoices.filter(inv => inv.customerId === parseInt(customerId));
  }

  // ======== بيانات الخزينة ========
  getTreasury() {
    return this.data.treasury;
  }

  // ======== بيانات الحسابات ========
  getAccounts() {
    return this.data.accounts;
  }

  getAccount(id) {
    return this.data.accounts.find(a => a.id === parseInt(id));
  }

  // ======== بيانات القيود اليومية ========
  getJournalEntries() {
    return this.data.journalEntries;
  }

  // ======== بيانات الموظفين ========
  getEmployees() {
    return this.data.employees;
  }

  getEmployee(id) {
    return this.data.employees.find(e => e.id === parseInt(id));
  }

  // ======== بيانات الأقسام ========
  getDepartments() {
    return this.data.departments;
  }

  // ======== بيانات التقارير ========
  getDashboardStats() {
    return this.data.dashboardStats;
  }

  // ======== دوال الإحصائيات ========
  getSimpleStats() {
    const products = this.getProducts();
    const salesInvoices = this.getSalesInvoices();
    const purchaseInvoices = this.getPurchaseInvoices();
    const customers = this.getCustomers();
    const suppliers = this.getSuppliers();
    const treasury = this.getTreasury();
    const employees = this.getEmployees();

    return {
      // إحصائيات المبيعات
      totalSalesInvoices: salesInvoices.length,
      totalSalesAmount: salesInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
      pendingSalesInvoices: salesInvoices.filter(inv => inv.paymentStatus === 'pending').length,
      
      // إحصائيات المشتريات
      totalPurchaseInvoices: purchaseInvoices.length,
      totalPurchaseAmount: purchaseInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
      pendingPurchaseInvoices: purchaseInvoices.filter(inv => inv.paymentType === 'deferred').length,
      
      // إحصائيات المخزون
      totalProducts: products.length,
      lowStockCount: this.getLowStockProducts().length,
      totalWarehouseValue: products.reduce((sum, p) => {
        return sum + ((p.mainQuantity || 0) * (p.mainPrice || 0)) + 
               ((p.subQuantity || 0) * (p.subPrice || 0));
      }, 0),
      
      // إحصائيات العملاء والموردين
      totalCustomers: customers.length,
      totalSuppliers: suppliers.length,
      activeCustomers: customers.filter(c => c.isActive).length,
      activeSuppliers: suppliers.filter(s => s.isActive).length,
      
      // إحصائيات الخزينة
      treasuryBalance: treasury.balance,
      totalReceipts: treasury.cashReceipts.length,
      totalDisbursements: treasury.cashDisbursements.length,
      
      // إحصائيات الموظفين
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.status === 'active').length
    };
  }

  // ======== دوال البحث والفلترة ========
  searchProducts(searchTerm) {
    if (!searchTerm) return this.getProducts();
    
    return this.data.products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm)
    );
  }

  searchCustomers(searchTerm) {
    if (!searchTerm) return this.getCustomers();
    
    return this.data.customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    );
  }

  searchSuppliers(searchTerm) {
    if (!searchTerm) return this.getSuppliers();
    
    return this.data.suppliers.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm)
    );
  }

  // ======== دوال التقارير ========
  getSalesReport(startDate, endDate) {
    let invoices = this.getSalesInvoices();
    
    if (startDate || endDate) {
      invoices = invoices.filter(inv => {
        const invDate = new Date(inv.date);
        return (!startDate || invDate >= new Date(startDate)) && 
               (!endDate || invDate <= new Date(endDate));
      });
    }
    
    return {
      invoices,
      totalSales: invoices.reduce((sum, inv) => sum + inv.total, 0),
      totalTax: invoices.reduce((sum, inv) => sum + inv.tax, 0),
      count: invoices.length
    };
  }

  getPurchaseReport(startDate, endDate) {
    let invoices = this.getPurchaseInvoices();
    
    if (startDate || endDate) {
      invoices = invoices.filter(inv => {
        const invDate = new Date(inv.date);
        return (!startDate || invDate >= new Date(startDate)) && 
               (!endDate || invDate <= new Date(endDate));
      });
    }
    
    return {
      invoices,
      totalPurchases: invoices.reduce((sum, inv) => sum + inv.total, 0),
      totalTax: invoices.reduce((sum, inv) => sum + inv.tax, 0),
      count: invoices.length
    };
  }

  getInventoryReport() {
    const products = this.getProducts();
    const totalValue = products.reduce((sum, p) => {
      return sum + ((p.mainQuantity || 0) * (p.mainPrice || 0)) + 
             ((p.subQuantity || 0) * (p.subPrice || 0));
    }, 0);
    
    return {
      products,
      totalProducts: products.length,
      totalValue,
      lowStockCount: this.getLowStockProducts().length
    };
  }

  // ======== دوال للعرض والتجربة فقط ========
  async saveData() {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم الحفظ فعلياً' };
  }

  async updateData() {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم التحديث فعلياً' };
  }

  async deleteData() {
    await simulateNetworkDelay(500);
    return { success: true, message: 'للعرض والتجربة فقط - لا يتم الحذف فعلياً' };
  }

  // ======== معلومات النظام ========
  getSystemInfo() {
    return {
      version: '1.0.0-demo',
      mode: 'demo',
      description: 'نظام عرض تجريبي - البيانات وهمية',
      features: [
        'عرض البيانات التجريبية',
        'محاكاة واجهات المستخدم',
        'توضيح إمكانيات النظام',
        'للاستعراض والعرض فقط'
      ]
    };
  }
}

// إنشاء instance وحيد
const mockDataService = new MockDataService();

export default mockDataService;