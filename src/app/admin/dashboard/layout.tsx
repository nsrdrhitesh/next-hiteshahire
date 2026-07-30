"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import AuthGuard from "./components/AuthGuard";
// import 'react-quill-new/dist/quill.snow.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50 font-sans dark:bg-gray-900">
        {/* Sidebar for Desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white transition-transform duration-300 ease-in-out dark:bg-gray-800 lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main Content Area with Custom Scrollbar */}
        <div className="flex flex-1 flex-col lg:pl-72">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          {/* <main className="flex-1 overflow-y-auto p-4 sm:p-6
            scrollbar-thin 
            scrollbar-track-gray-100 
            scrollbar-thumb-gray-300 
            hover:scrollbar-thumb-gray-400 
            dark:scrollbar-track-gray-900 
            dark:scrollbar-thumb-gray-700 
            dark:hover:scrollbar-thumb-gray-600
            scrollbar-width: thin
            scrollbar-color: #d1d5db #f3f4f6
            dark:scrollbar-color: #4b5563 #111827"> */}
            <main className="scrollbar-custom flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>

        {/* Global scrollbar styles for the entire app */}
        <style jsx global>{`
          /* Webkit browsers (Chrome, Safari, Edge) */
          .scrollbar-thin::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          .scrollbar-thin::-webkit-scrollbar-track {
            background: #f3f4f6;
            border-radius: 4px;
          }
          
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 4px;
          }
          
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
          
          .scrollbar-thin::-webkit-scrollbar-corner {
            background: transparent;
          }
          
          /* Dark mode for Webkit */
          .dark .scrollbar-thin::-webkit-scrollbar-track {
            background: #374151;
          }
          
          .dark .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #4b5563;
          }
          
          .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
          
          /* Firefox */
          .scrollbar-thin {
            scrollbar-width: thin;
          }
          
          /* Custom scrollbar for specific areas */
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #d1d5db #f3f4f6;
          }
          
          .dark .custom-scrollbar {
            scrollbar-color: #4b5563 #374151;
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}