import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

const Navbar = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHomeClick = () => {
    if (window.location.pathname === '/') {
      scrollToTop();
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="bg-black/95 backdrop-blur-sm border-b border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Text Only */}
          <button onClick={handleHomeClick} className="flex items-center gap-3 group cursor-pointer">
            <div className="text-xl font-black tracking-wide">
              <span className="text-white">DAR'S BOX </span>
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                ARENA
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
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

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;