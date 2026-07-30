import React from 'react';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isChats = location.pathname.startsWith('/chats');

  return (
    <div className={`flex flex-col bg-background ${isChats ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      <Navbar />
      <main className={`flex-1 w-full flex flex-col animate-fade-in ${
        isChats ? 'overflow-hidden min-h-0' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:pb-8 pb-24'
      }`}>
        {children}
      </main>
      {isHome && (
        <footer className="bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-500 mt-auto md:mb-0 mb-16">
          <p>&copy; {new Date().getFullYear()} Verified Roommate Matcher. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
};

export default Layout;
