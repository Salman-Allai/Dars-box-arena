import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/facilities');
    }
  };

  return (
    <div className="bg-black text-white">
      {/* Hero Section with Arena Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/arena-background.jpg)',
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/60"></div>
          {/* Orange gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/30 via-transparent to-pink-600/30"></div>
        </div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-block px-6 py-2 border border-orange-500/50 rounded-full mb-8 text-orange-500 text-sm tracking-widest uppercase backdrop-blur-sm bg-black/20">
            Premium Indoor Sports
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black mb-4 tracking-tight drop-shadow-2xl">
            DAR'S BOX
          </h1>
          <h1 className="text-7xl md:text-9xl font-black mb-8 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl">
            ARENA
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-200 mb-4 font-light drop-shadow-lg">
            Where Champions Train, Play & Conquer
          </p>
          
          <p className="text-lg text-gray-300 mb-12 drop-shadow-lg">
            Box Cricket • Football • Badminton • Volleyball • Snooker • Gym • Kids Zone
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button 
              onClick={handleBookNow}
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-6 text-lg font-bold rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all transform hover:scale-105"
            >
              Book Now
            </button>
            <a href="#facilities">
              <button className="border-2 border-white/50 text-white px-8 py-6 text-lg font-bold rounded-xl hover:border-white hover:bg-white/10 backdrop-blur-sm transition-all">
                Explore Facilities
              </button>
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="mt-20 animate-bounce">
            <div className="w-6 h-10 border-2 border-orange-500 rounded-full mx-auto flex justify-center">
              <div className="w-1 h-3 bg-orange-500 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Powerful Launch Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-black to-pink-500/10"></div>
        
        {/* Moving light effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Floating sports icons */}
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">🏏</div>
        <div className="absolute top-40 right-20 text-6xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>⚽</div>
        <div className="absolute bottom-32 left-1/4 text-6xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>🏸</div>
        <div className="absolute bottom-20 right-1/3 text-6xl opacity-10 animate-float" style={{ animationDelay: '1.5s' }}>🏐</div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Powerful Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-6 py-3 border-2 border-orange-500 rounded-full mb-8 animate-pulse-glow">
              <span className="w-3 h-3 bg-orange-500 rounded-full animate-ping"></span>
              <span className="text-orange-500 text-sm tracking-widest uppercase font-bold">
                Grand Opening • Now in Srinagar
              </span>
            </div>
            
            <h2 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
              THE <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent animate-gradient">GAME</span>
              <br />
              STARTS <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent animate-gradient">NOW</span>
            </h2>
            
            <p className="text-2xl md:text-3xl text-gray-300 font-light mb-4">
              Kashmir's Most Advanced Sports Arena
            </p>
            <p className="text-lg text-orange-500 font-semibold">
              Be Among the First to Experience Excellence
            </p>
          </div>

          {/* 3 Powerful Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Card 1 - Equipment */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative bg-black border-2 border-gray-800 rounded-2xl p-10 hover:border-orange-500 transition-all duration-500 transform hover:scale-105">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-t-2xl"></div>
                
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center text-4xl transform group-hover:rotate-12 transition-transform duration-500">
                    ⚡
                  </div>
                  <h3 className="text-3xl font-black mb-4 text-white">
                    BRAND NEW
                  </h3>
                  <p className="text-gray-400 mb-4">
                    State-of-the-art equipment
                  </p>
                  <div className="text-orange-500 font-bold">
                    Never Before in Kashmir
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - Facilities */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative bg-black border-2 border-gray-800 rounded-2xl p-10 hover:border-orange-500 transition-all duration-500 transform hover:scale-105">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-t-2xl"></div>
                
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center text-4xl transform group-hover:rotate-12 transition-transform duration-500">
                    🏆
                  </div>
                  <h3 className="text-3xl font-black mb-4 text-white">
                    7 SPORTS
                  </h3>
                  <p className="text-gray-400 mb-4">
                    All under one premium roof
                  </p>
                  <div className="text-orange-500 font-bold">
                    Your Complete Arena
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 - Opening Offer */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative bg-black border-2 border-gray-800 rounded-2xl p-10 hover:border-orange-500 transition-all duration-500 transform hover:scale-105">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-t-2xl"></div>
                
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center text-4xl transform group-hover:rotate-12 transition-transform duration-500">
                    🎯
                  </div>
                  <h3 className="text-3xl font-black mb-4 text-white">
                    EXCLUSIVE
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Special founding member rates
                  </p>
                  <div className="text-orange-500 font-bold">
                    Limited Time Only
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Power Statement */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl blur-2xl opacity-20"></div>
            <div className="relative bg-gradient-to-r from-gray-900 to-black border border-orange-500/50 rounded-2xl p-12 text-center">
              <h3 className="text-4xl md:text-5xl font-black mb-6">
                BE THE <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">FIRST</span>
              </h3>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Join Kashmir's elite athletes at Dar's Box Arena. Your journey to greatness starts here.
              </p>
              <div className="flex flex-wrap gap-6 justify-center">
                <div className="text-center">
                  <div className="text-3xl font-black text-orange-500">100%</div>
                  <div className="text-sm text-gray-400">Premium Quality</div>
                </div>
                <div className="w-px bg-gray-700"></div>
                <div className="text-center">
                  <div className="text-3xl font-black text-orange-500">24/7</div>
                  <div className="text-sm text-gray-400">Access Available</div>
                </div>
                <div className="w-px bg-gray-700"></div>
                <div className="text-center">
                  <div className="text-3xl font-black text-orange-500">First</div>
                  <div className="text-sm text-gray-400">In Kashmir</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 53, 0.3); }
            50% { box-shadow: 0 0 40px rgba(255, 107, 53, 0.6); }
          }
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
          }
        `}</style>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="text-orange-500 text-sm tracking-widest uppercase mb-4">Our Facilities</div>
            <h2 className="text-5xl md:text-6xl font-black mb-4">
              WORLD-CLASS <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">SPORTS</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience premium sports infrastructure with state-of-the-art equipment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sports.map((sport) => (
              <div 
                key={sport.name}
                className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 hover:border-orange-500/50 transition-all duration-500 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Top gradient line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                <div className="relative">
                  <div className="text-6xl mb-6">{sport.icon}</div>
                  <h3 className="text-2xl font-black uppercase mb-3">{sport.name}</h3>
                  <p className="text-gray-400 mb-6">{sport.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="text-orange-500 text-sm tracking-widest uppercase mb-4">Why Us</div>
            <h2 className="text-5xl md:text-6xl font-black">
              THE <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">ADVANTAGE</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-orange-500/50">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black uppercase mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-40 overflow-hidden">
        {/* Powerful animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 animate-gradient-x"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Animated particles */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-float blur-xl"></div>
          <div className="absolute top-20 right-20 w-40 h-40 bg-white/10 rounded-full animate-float blur-xl" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-white/10 rounded-full animate-float blur-xl" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-white/10 rounded-full animate-float blur-xl" style={{ animationDelay: '1.5s' }}></div>
        </div>

        {/* Giant sports icons */}
        <div className="absolute top-10 left-20 text-9xl opacity-5 animate-spin-slow">🏏</div>
        <div className="absolute bottom-10 right-20 text-9xl opacity-5 animate-spin-slow" style={{ animationDelay: '1s' }}>⚽</div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 text-white">
          {/* Pulsing badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-full mb-8 animate-pulse-slow">
            <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>
            <span className="text-sm tracking-widest uppercase font-bold">
              Now Open in Srinagar
            </span>
          </div>

          {/* Massive headline */}
          <h2 className="text-7xl md:text-9xl font-black mb-8 leading-tight drop-shadow-2xl">
            YOUR TIME
            <br />
            IS NOW
          </h2>
          
          <p className="text-2xl md:text-4xl mb-6 font-light">
            Don't Just Watch. Don't Just Dream.
          </p>
          <p className="text-3xl md:text-5xl font-black mb-16">
            PLAY. COMPETE. CONQUER.
          </p>

          {/* Power stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 transform hover:scale-105 transition-all">
              <div className="text-5xl font-black mb-2">7</div>
              <div className="text-sm uppercase tracking-wide opacity-90">Premier Sports</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 transform hover:scale-105 transition-all">
              <div className="text-5xl font-black mb-2">1st</div>
              <div className="text-sm uppercase tracking-wide opacity-90">In Kashmir</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 transform hover:scale-105 transition-all">
              <div className="text-5xl font-black mb-2">New</div>
              <div className="text-sm uppercase tracking-wide opacity-90">Equipment</div>
            </div>
          </div>
        </div>

        {/* Additional custom animations */}
        <style>{`
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 15s ease infinite;
          }
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
          .animate-pulse-slow {
            animation: pulse 3s ease-in-out infinite;
          }
        `}</style>
      </section>
    </div>
  );
};

const sports = [
  { 
    name: 'Box Cricket', 
    icon: '🏏', 
    description: 'Indoor turf ground perfect for box cricket matches with quality surface and boundary markings'
  },
  { 
    name: 'Football 7-a-side', 
    icon: '⚽', 
    description: 'Professional 7-a-side football turf with FIFA-standard surface and floodlights'
  },
  { 
    name: 'Badminton', 
    icon: '🏸', 
    description: 'International standard courts on turf with proper lighting for competitive play'
  },
  { 
    name: 'Volleyball', 
    icon: '🏐', 
    description: 'Full-size indoor court with spectator seating and quality net setup'
  },
  { 
    name: 'Snooker', 
    icon: '🎱', 
    description: 'Premium tables in quiet, air-conditioned rooms for focused gameplay'
  },
  { 
    name: 'Gym', 
    icon: '💪', 
    description: 'Modern equipment with certified personal trainers and complete workout facilities'
  },
  { 
    name: 'Kids Zone', 
    icon: '🎮', 
    description: 'Safe supervised gaming and play area designed for children\'s entertainment'
  },
];

const features = [
  { icon: '⚡', title: 'Instant Booking', description: 'Book in seconds with real-time availability' },
  { icon: '🔒', title: 'Secure Payment', description: 'Safe & encrypted payment gateway' },
  { icon: '📱', title: 'Mobile Ready', description: 'Book anytime, anywhere on your phone' },
  { icon: '🎯', title: '24/7 Support', description: 'Round the clock customer support' },
];

export default HomePage;