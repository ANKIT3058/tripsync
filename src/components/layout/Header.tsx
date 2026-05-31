'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { FaUserCircle } from 'react-icons/fa'
import { IoLogOutOutline, IoMenu, IoClose } from "react-icons/io5";

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Effect to handle header style on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Function to determine if a nav link is active
  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // Dynamically generate navigation links based on user session and role
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/hotels', label: 'Hotels' },
    ...(session?.user ? [{ href: '/bookings', label: 'My Bookings' }] : []),
    ...(session?.user && session.user.role === 'ADMIN'
      ? [{ href: '/admin', label: 'Admin Panel' }]
      : []),
  ]

  // Base classes for the header for a cleaner look
  const headerClasses = `sticky top-0 z-50 transition-all duration-300 ${
    isScrolled
      ? 'bg-slate-900/80 backdrop-blur-lg shadow-xl'
      : 'bg-white shadow-sm'
  }`
  
  const textColorClass = isScrolled ? 'text-slate-200' : 'text-slate-700';

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              TripSync
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${textColorClass} ${
                  isActiveLink(href)
                    ? (isScrolled ? 'bg-cyan-400/10 text-cyan-300' : 'bg-primary-600/10 text-cyan-600')
                    : `hover:${isScrolled ? 'bg-slate-700/50' : 'bg-slate-100'} hover:text-cyan-500`
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          
          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {session?.user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaUserCircle className={`w-7 h-7 ${isScrolled ? 'text-cyan-300' : 'text-cyan-500'}`} />
                  <div className="text-sm">
                    <p className={`font-semibold ${isScrolled ? 'text-white' : 'text-slate-900'}`}>
                      {session.user.name?.split(' ')[0]}
                    </p>
                    {session.user.role === 'ADMIN' && (
                      <p className={`text-xs ${isScrolled ? 'text-cyan-400' : 'text-cyan-600'}`}>Admin</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${textColorClass} hover:bg-red-500/10 hover:text-red-500`}
                  title="Sign Out"
                >
                  <IoLogOutOutline className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${textColorClass} hover:text-cyan-500 hover:${isScrolled ? 'bg-slate-700/50' : 'bg-slate-100'}`}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2 bg-primary-600 text-white text-sm font-semibold rounded-md hover:bg-cyan-600 transform hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${textColorClass} hover:${isScrolled ? 'bg-slate-700' : 'bg-slate-100'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <IoClose className="w-6 h-6" /> : <IoMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute w-full transition-all duration-300 ease-in-out overflow-hidden ${isScrolled ? 'bg-slate-900/95' : 'bg-white'} ${
        isMobileMenuOpen ? 'max-h-screen opacity-100 border-t border-slate-200/20' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-3 rounded-md text-base font-medium transition-colors duration-300 ${textColorClass} ${
                  isActiveLink(href)
                    ? (isScrolled ? 'bg-cyan-400/10 text-cyan-300' : 'bg-primary-600/10 text-cyan-600')
                    : `hover:${isScrolled ? 'bg-slate-700/50' : 'bg-slate-100'} hover:text-cyan-500`
                }`}
            >
              {label}
            </Link>
          ))}
          
          {/* Mobile Auth */}
          <div className="pt-4 mt-4 border-t border-slate-700/50">
            {session?.user ? (
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center space-x-3">
                  <FaUserCircle className={`w-8 h-8 ${isScrolled ? 'text-cyan-300' : 'text-cyan-500'}`} />
                  <div>
                    <p className={`font-semibold ${isScrolled ? 'text-white' : 'text-slate-900'}`}>{session.user.name}</p>
                     {session.user.role === 'ADMIN' && (
                      <p className={`text-sm ${isScrolled ? 'text-cyan-400' : 'text-cyan-600'}`}>Admin</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                  className={`p-3 text-red-500 hover:bg-red-500/10 rounded-md transition-colors duration-300`}
                  title="Sign Out"
                >
                  <IoLogOutOutline className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div className="px-2 space-y-2">
                <Link
                  href="/auth/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block text-center w-full px-4 py-3 font-medium rounded-md transition-colors duration-300 ${textColorClass} hover:text-cyan-500 hover:${isScrolled ? 'bg-slate-700/50' : 'bg-slate-100'}`}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center w-full px-4 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-cyan-600 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}