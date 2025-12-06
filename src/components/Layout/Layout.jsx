// ======================================
// Compact Layout - تخطيط مصغر ومميز
// ======================================

import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import TabContent from './TabContent';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      {/* Main Content - محتوى التبويبات */}
      <main className="flex-1 pt-[40px] pr-14 lg:pr-14 transition-all duration-300">
        <div className="w-full px-3 pb-2">
          <TabContent />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
