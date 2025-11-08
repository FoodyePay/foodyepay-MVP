"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" legacyBehavior>
              <a className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <Image src="/FoodyePayLogo.png" alt="FoodyePay" width={40} height={40} />
                <span className="text-xl font-bold text-white">FoodyePay</span>
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/#for-restaurants-section" legacyBehavior><a className="text-gray-300 hover:text-white transition">For Restaurants</a></Link>
            <Link href="/#for-diners-section" legacyBehavior><a className="text-gray-300 hover:text-white transition">For Diners</a></Link>
            <Link href="/about" legacyBehavior><a className="text-gray-300 hover:text-white transition">Our Story</a></Link>
            <Link href="/book-a-demo" legacyBehavior><a className="text-gray-300 hover:text-white transition">App</a></Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900 bg-opacity-95">
            <Link href="/#for-restaurants-section" legacyBehavior><a onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">For Restaurants</a></Link>
            <Link href="/#for-diners-section" legacyBehavior><a onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">For Diners</a></Link>
            <Link href="/about" legacyBehavior><a onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Our Story</a></Link>
            <Link href="/book-a-demo" legacyBehavior><a onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">App</a></Link>
          </div>
        </div>
      )}
    </header>
  );
};
