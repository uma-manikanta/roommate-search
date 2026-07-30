import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-500 mt-auto">
        <p>&copy; {new Date().getFullYear()} Verified Roommate Matcher. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
