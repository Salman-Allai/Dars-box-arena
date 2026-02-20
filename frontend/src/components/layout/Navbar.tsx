import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

const Navbar = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleHomeClick = () => {
    if (window.location.pathname === '/') {
      scrollToTop();
    } else {
      navigate('/');
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-black/95 backdrop-blur-sm border-b border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo Text Only */}
          <button onClick={handleHomeClick} className="flex items-center gap-3 group cursor-pointer">
            <div className="text-lg sm:text-xl font-black tracking-wide">
              <span className="text-white">DAR'S BOX </span>
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                ARENA
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <button
              onClick={handleHomeClick}
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('facilities')}
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Facilities
            </button>
            {isAuthenticated && (
              <Link 
                to="/my-bookings" 
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                My Bookings
              </Link>
            )}
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Contact
            </button>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-400 text-sm hidden lg:inline">
                  Hi, <span className="text-white font-semibold">{user?.name}</span>
                </span>
                <Button 
                  onClick={logout} 
                  className="bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                  size="sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    className="bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                    size="sm"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-500/50" 
                    size="sm"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800/50 py-4 space-y-3">
            {/* Navigation Links */}
            <button
              onClick={handleHomeClick}
              className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm font-medium"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('facilities')}
              className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm font-medium"
            >
              Facilities
            </button>
            {isAuthenticated && (
              <Link 
                to="/my-bookings"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm font-medium"
              >
                My Bookings
              </Link>
            )}
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm font-medium"
            >
              Contact
            </button>

            {/* Mobile Auth Section */}
            <div className="border-t border-gray-800/50 pt-4 mt-4 space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-400 mb-1">Logged in as</p>
                    <p className="text-sm text-white font-semibold">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Button 
                    onClick={handleLogout} 
                    className="w-full bg-red-600 text-white hover:bg-red-700"
                    size="sm"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block">
                    <Button 
                      className="w-full bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                      size="sm"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block">
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-500/50" 
                      size="sm"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;