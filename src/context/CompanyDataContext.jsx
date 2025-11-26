// ======================================
// Company Data Context - سياق بيانات الشركة
// يعمل مع Railway Backend
// ======================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  companyAPI, 
  warehouseAPI, 
  productAPI, 
  customerAPI, 
  supplierAPI, 
  salesAPI, 
  purchaseAPI, 
  authAPI,
  reportsAPI 
} from '../services/companyAPI';

// إنشاء الـ Context
const CompanyDataContext = createContext();

// Provider Component
export const CompanyDataProvider = ({ children }) => {
  // ======================================
  // State Variables
  // ======================================
  
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [reports, setReports] = useState({});
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // User & Company Info
  const [currentUser, setCurrentUser] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  
  // ======================================
  // Connection Testing
  // ======================================
  
  const testConnection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await companyAPI.companyConfig.testConnection();
      setIsConnected(result.connected);
      
      if (result.connected) {
        console.log('✅ متصل بـ Railway Backend');
      } else {
        console.warn('⚠️ فشل الاتصال:', result.error);
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      console.error('❌ خطأ في اختبار الاتصال:', error);
      setError(error.message);
      setIsConnected(false);
      return { connected: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // ======================================
  // Authentication
  // ======================================
  
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authAPI.login(credentials);
      
      // حفظ token في localStorage
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userInfo', JSON.stringify(result.user));
      
      setCurrentUser(result.user);
      
      // جلب معلومات الشركة
      const companyData = await companyAPI.getCompanyInfo();
      setCompanyInfo(companyData);
      
      return result;
    } catch (error) {
      console.error('❌ خطأ في تسجيل الدخول:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      await authAPI.logout();
      
      // مسح البيانات المحلية
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      
      setCurrentUser(null);
      setCompanyInfo(null);
      
      // مسح البيانات
      setWarehouses([]);
      setProducts([]);
      setCustomers([]);
      setSuppliers([]);
      setSales([]);
      setPurchases([]);
      
    } catch (error) {
      console.error('❌ خطأ في تسجيل الخروج:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // ======================================
  // Warehouses Operations
  // ======================================
  
  const loadWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await warehouseAPI.getWarehouses();
      setWarehouses(data);
      
      return data;
    } catch (error) {
      console.error('❌ خطأ في جلب المخازن:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const createWarehouse = useCallback(async (warehouseData) => {
    try {
      setLoading(true);
      setError(null);
      
      const newWarehouse = await warehouseAPI.createWarehouse(warehouseData);
      setWarehouses(prev => [...prev, newWarehouse]);
      
      return newWarehouse;
    } catch (error) {
      console.error('❌ خطأ في إنشاء المخزن:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const updateWarehouse = useCallback(async (id, warehouseData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedWarehouse = await warehouseAPI.updateWarehouse(id, warehouseData);
      setWarehouses(prev => prev.map(w => w.id === id ? updatedWarehouse : w));
      
      return updatedWarehouse;
    } catch (error) {
      console.error('❌ خطأ في تحديث المخزن:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const deleteWarehouse = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await warehouseAPI.deleteWarehouse(id);
      setWarehouses(prev => prev.filter(w => w.id !== id));
      
      return true;
    } catch (error) {
      console.error('❌ خطأ في حذف المخزن:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // ======================================
  // Products Operations
  // ======================================
  
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await productAPI.getProducts();
      setProducts(data);
      
      return data;
    } catch (error) {
      console.error('❌ خطأ في جلب المنتجات:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);
      
      const newProduct = await productAPI.createProduct(productData);
      setProducts(prev => [...prev, newProduct]);
      
      return newProduct;
    } catch (error) {
      console.error('❌ خطأ في إنشاء المنتج:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const updateProduct = useCallback(async (id, productData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedProduct = await productAPI.updateProduct(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      
      return updatedProduct;
    } catch (error) {
      console.error('❌ خطأ في تحديث المنتج:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await productAPI.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      
      return true;
    } catch (error) {
      console.error('❌ خطأ في حذف المنتج:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // ======================================
  // Customers Operations
  // ======================================
  
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await customerAPI.getCustomers();
      setCustomers(data);
      
      return data;
    } catch (error) {
      console.error('❌ خطأ في جلب العملاء:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const createCustomer = useCallback(async (customerData) => {
    try {
      setLoading(true);
      setError(null);
      
      const newCustomer = await customerAPI.createCustomer(customerData);
      setCustomers(prev => [...prev, newCustomer]);
      
      return newCustomer;
    } catch (error) {
      console.error('❌ خطأ في إنشاء العميل:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // ======================================
  // Reports
  // ======================================
  
  const loadSalesReport = useCallback(async (startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await reportsAPI.getSalesReport(startDate, endDate);
      setReports(prev => ({ ...prev, sales: data }));
      
      return data;
    } catch (error) {
      console.error('❌ خطأ في جلب تقرير المبيعات:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // ======================================
  // Company Operations
  // ======================================
  
  const updateCompanyInfo = useCallback(async (companyData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedCompany = await companyAPI.updateCompanyInfo(companyData);
      setCompanyInfo(updatedCompany);
      
      return updatedCompany;
    } catch (error) {
      console.error('❌ خطأ في تحديث معلومات الشركة:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // ======================================
  // Effects
  // ======================================
  
  useEffect(() => {
    // اختبار الاتصال عند تحميل المكون
    testConnection();
    
    // التحقق من token المحفوظ
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('userInfo');
    
    if (savedToken && savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      // جلب معلومات الشركة
      companyAPI.getCompanyInfo()
        .then(setCompanyInfo)
        .catch(error => console.error('خطأ في جلب معلومات الشركة:', error));
    }
  }, [testConnection]);
  
  // ======================================
  // Context Value
  // ======================================
  
  const value = {
    // State
    warehouses,
    products,
    customers,
    suppliers,
    sales,
    purchases,
    reports,
    loading,
    error,
    isConnected,
    currentUser,
    companyInfo,
    
    // Methods
    testConnection,
    
    // Authentication
    login,
    logout,
    
    // Warehouses
    loadWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    
    // Products
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Customers
    loadCustomers,
    createCustomer,
    
    // Reports
    loadSalesReport,
    
    // Company
    updateCompanyInfo
  };
  
  return (
    <CompanyDataContext.Provider value={value}>
      {children}
    </CompanyDataContext.Provider>
  );
};

// Custom Hook
export const useCompanyData = () => {
  const context = useContext(CompanyDataContext);
  if (context === undefined) {
    throw new Error('useCompanyData must be used within a CompanyDataProvider');
  }
  return context;
};

export default CompanyDataContext;