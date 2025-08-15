import Header from '@/components/layout/Header'
import SearchForm from '@/components/ui/SearchForm'
import { FaShieldAlt, FaTag, FaHeadset } from 'react-icons/fa'

export default function Home() {
  return (
    <div className="bg-slate-50 text-slate-800">
      <Header />
      
      <main>
        {/* Hero Section */}
        <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80')" }}
          >
             {/* Dark Overlay for Readability */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.6)'}}>
              Find Your Perfect Stay
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
              Discover amazing hotels worldwide with transparent pricing and seamless booking.
            </p>
            
            {/* Search Form Container */}
            <div className="mt-12 max-w-4xl mx-auto">
              <SearchForm />
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="bg-white py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Why Choose TripSync?
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                We make hotel booking simple, secure, and affordable through our trusted platform.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {/* Feature Card 1 */}
              <div className="p-8 bg-slate-50 rounded-xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-5">
                  <FaTag className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Best Price Guarantee</h3>
                <p className="text-slate-600">
                  We ensure you get the best rates with our real-time price comparison from top providers.
                </p>
              </div>
              
              {/* Feature Card 2 */}
              <div className="p-8 bg-slate-50 rounded-xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-5">
                  <FaShieldAlt className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Secure Booking</h3>
                <p className="text-slate-600">
                  Your payments and personal data are protected with bank-level security.
                </p>
              </div>
              
              {/* Feature Card 3 */}
              <div className="p-8 bg-slate-50 rounded-xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-5">
                  <FaHeadset className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">24/7 Support</h3>
                <p className="text-slate-600">
                  Our dedicated customer service team is always available to assist you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}