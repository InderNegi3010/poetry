import React from "react";
import { Link } from "react-router-dom";
import { Search, ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-gray-800">
                rekhta
              </Link>
              <nav className="hidden md:flex md:ml-10 md:space-x-8">
                {['POETS', 'SHER', 'DICTIONARY', 'E-BOOKS', 'MORE'].map((item) => (
                  <Link
                    key={item}
                    to="#"
                    className="text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    {item}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center">
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-gray-500 focus:border-gray-500"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <Button variant="ghost" className="text-sm font-medium">
                  ENG <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
                <Button variant="ghost" className="text-sm font-medium">LOG IN</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold">
                  Donate
                </Button>
              </div>
              <div className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}