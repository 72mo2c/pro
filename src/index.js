// ======================================
// Bero System - Main Entry Point
// ======================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initializeMockData, getMockDataStats } from './utils/mockData';

// تهيئة البيانات الوهمية عند بدء التطبيق
const initializeApp = () => {
  // التحقق من وجود بيانات سابقة
  const hasData = localStorage.getItem('bero_products');
  
  if (!hasData) {
    console.log('🔄 تهيئة البيانات الوهمية...');
    initializeMockData();
  } else {
    console.log('✅ البيانات موجودة مسبقاً');
  }
  
  // عرض إحصائيات البيانات
  const stats = getMockDataStats();
  console.log('📊 إحصائيات البيانات:', stats);
  
  // إضافة مستخدم افتراضي إذا لم يكن موجود
  const users = localStorage.getItem('bero_system_users');
  if (!users || JSON.parse(users).length === 0) {
    console.log('👤 إضافة مستخدم افتراضي...');
    // سيتم إضافة المستخدم الافتراضي في AuthContext
  }
};

// تهيئة التطبيق
initializeApp();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
