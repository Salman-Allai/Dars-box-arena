const Footer = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer id="contact" className="bg-black text-white border-t border-gray-900">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div>
            <h2 className="text-3xl font-black tracking-wider bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-4">
              DAR'S BOX ARENA
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Premium indoor sports facility offering world-class infrastructure for athletes of all levels.
            </p>
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2">Follow Us</p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 transition-all">
                  <span className="text-xl">📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 transition-all">
                  <span className="text-xl">📸</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 transition-all">
                  <span className="text-xl">🐦</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider mb-6 text-white">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => scrollToSection('facilities')}
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  Facilities
                </button>
              </li>
              <li>
                <a href="/my-bookings" className="text-gray-400 hover:text-orange-500 transition-colors">
                  My Bookings
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Login
                </a>
              </li>
              <li>
                <a href="/register" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Sign Up
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider mb-6 text-white">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400">
                <span className="text-orange-500 mt-1">📍</span>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Location</p>
                  <p>Srinagar, Jammu & Kashmir, India</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <span className="text-orange-500 mt-1">📞</span>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Phone</p>
                  <a href="tel:+919876543210" className="hover:text-orange-500 transition-colors">
                    +91 98765 43210
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <span className="text-orange-500 mt-1">📧</span>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Email</p>
                  <a href="mailto:info@darsboxarena.com" className="hover:text-orange-500 transition-colors">
                    info@darsboxarena.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <span className="text-orange-500 mt-1">⏰</span>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Operating Hours</p>
                  <p>Mon - Sun: 6:00 AM - 11:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 Dar's Box Arena. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Built with <span className="text-red-500">❤️</span> in Kashmir
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;