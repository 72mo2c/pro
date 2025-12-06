// ======================================
// Footer Component - تذييل الصفحة
// ======================================

import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-1">
      <div className="w-full px-4">
        <div className="text-center text-gray-600 text-xs">
          <p className="inline">
            تم التطوير بواسطة <span className="font-semibold text-blue-600">Biruni Soft</span>
          </p>
          <p className="inline ml-2">
            &copy; {currentYear} Biruni Soft. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
