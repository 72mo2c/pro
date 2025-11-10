// ======================================
// Auth Context - إدارة حالة المصادقة (للعرض فقط)
// ======================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import mockData from '../data/mockData';

const AuthContext = createContext();

// Hook لاستخدام Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // تحميل بيانات المستخدم من LocalStorage عند بدء التطبيق
  useEffect(() => {
    const storedUser = localStorage.getItem('bero_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('خطأ في قراءة بيانات المستخدم:', error);
        localStorage.removeItem('bero_user');
      }
    }
    setLoading(false);
  }, []);

  // تسجيل الدخول (للعرض والتجربة فقط)
  const login = async (username, password) => {
    try {
      // التحقق من المدخلات
      if (!username || !password) {
        return { success: false, message: 'يرجى إدخال اسم المستخدم وكلمة المرور' };
      }

      // البحث عن المستخدم في البيانات الوهمية
      const user = mockData.users.find(u => u.username === username && u.password === password);
      
      if (!user) {
        return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
      }

      // التحقق من حالة المستخدم
      if (!user.isActive) {
        return { success: false, message: 'هذا الحساب غير نشط' };
      }

      // إنشاء بيانات المستخدم للجلسة
      const userData = {
        id: user.id,
        username: user.username,
        name: user.fullName,
        role: user.role,
        email: user.email,
        companyId: user.companyId,
        loginAt: new Date().toISOString()
      };

      // حفظ بيانات المستخدم
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('bero_user', JSON.stringify(userData));
      
      return { success: true, message: `مرحباً ${user.fullName}` };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  };

  // تسجيل الخروج
  const logout = async () => {
    try {
      localStorage.removeItem('bero_user');
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'حدث خطأ أثناء تسجيل الخروج' };
    }
  };

  // التحقق من الصلاحية (مبسط للعرض)
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // للعرض فقط: جميع المستخدمين يمكنهم فعل كل شيء
    return true;
  };

  // تحديد ما إذا كان المستخدم مدير
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // تحديد ما إذا كان المستخدم يمكنه التعديل
  const canEdit = () => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'manager';
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    hasPermission,
    isAdmin,
    canEdit
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};