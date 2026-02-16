'use client';

import SearchForm from '@/components/SearchForm';
import FeaturedTrips from '@/components/FeaturedTrips';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarProvider';
import { useAuth } from '@/components/AuthProvider';

export default function Home() {
  const { isCollapsed } = useSidebar();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-mesh-green">
      <Sidebar />
      <main className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen pt-20 safe-bottom-nav ${user ? (isCollapsed ? 'lg:pl-20' : 'lg:pl-72') : ''}`}>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32">
          {/* Floating Orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-primary-300/40 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-accent-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          </div>

          <div className="container-custom relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Centered Content */}
              <div className="text-center space-y-8 mb-16 animate-fade-up">
                <div className="inline-flex items-center gap-2 glass-panel px-5 py-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-pulse-soft shadow-inner-glow"></div>
                  <span className="text-xs font-semibold text-neutral-700">Modern Travel Platform</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-neutral-900 leading-tight">
                  Travel Anywhere
                  <br />
                  <span className="text-gradient-green">Easily</span>
                </h1>

                <p className="text-xl md:text-2xl text-neutral-700 font-medium leading-relaxed max-w-3xl mx-auto">
                  Book bus tickets and track your trips in real-time. Comfortable travel across 450+ routes.
                </p>

                {/* Social Proof */}
                <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-14 h-14 rounded-2xl border-4 border-white overflow-hidden shadow-glass">
                        <img src={`https://i.pravatar.cc/100?img=${i + 25}`} alt="user" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-black text-neutral-900">120,000+ Happy Travelers</div>
                    <div className="text-sm font-semibold text-neutral-600">Across 450+ premium routes</div>
                  </div>
                </div>
              </div>

              {/* Massive Glassy Search Bar */}
              <div className="max-w-4xl mx-auto">
                <SearchForm />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Destinations */}
        <section className="py-24">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 animate-fade-up">
              <div className="space-y-3">
                <h2 className="text-5xl md:text-6xl font-black text-neutral-900">
                  Popular <span className="text-gradient-green">Destinations</span>
                </h2>
                <p className="text-lg font-medium text-neutral-700 max-w-xl">
                  Discover our most-loved routes with premium amenities and guaranteed comfort.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/trips">
                  <Button variant="primary" size="lg">
                    Browse All Trips
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </Button>
                </Link>
                <Link href="/search">
                  <Button variant="glass" size="lg">
                    Search Routes
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
            <FeaturedTrips />
          </div>
        </section>

        {/* Footer */}
        <footer className="glass-panel-strong border-t border-white/30 pt-20 pb-10">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* Brand */}
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-inner-glow">
                    A
                  </div>
                  <span className="text-2xl font-black text-gradient-green">Aura Park</span>
                </div>
                <p className="text-sm font-medium text-neutral-700 leading-relaxed">
                  The modern platform for seamless inter-city and cross-border transit experiences.
                </p>
                <div className="flex gap-3">
                  <a href="#" className="w-12 h-12 glass-panel flex items-center justify-center hover:bg-white/80 transition-all hover:scale-110">
                    <svg className="w-5 h-5 text-neutral-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a href="#" className="w-12 h-12 glass-panel flex items-center justify-center hover:bg-white/80 transition-all hover:scale-110">
                    <svg className="w-5 h-5 text-neutral-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-semibold text-neutral-900 mb-5 text-sm">Quick Links</h4>
                <ul className="space-y-3 text-sm font-semibold text-neutral-700">
                  <li><a href="/search" className="hover:text-primary-600 transition-colors">Routes</a></li>
                  <li><a href="/register" className="hover:text-primary-600 transition-colors">For Agencies</a></li>
                  <li><a href="/login" className="hover:text-primary-600 transition-colors">For Drivers</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-900 mb-5 text-sm">Company</h4>
                <ul className="space-y-3 text-sm font-semibold text-neutral-700">
                  <li><a href="/about" className="hover:text-primary-600 transition-colors">About Us</a></li>
                  <li><a href="/contact" className="hover:text-primary-600 transition-colors">Contact</a></li>
                  <li><a href="/careers" className="hover:text-primary-600 transition-colors">Careers</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-900 mb-5 text-sm">Legal</h4>
                <ul className="space-y-3 text-sm font-semibold text-neutral-700">
                  <li><a href="/privacy" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/30 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-semibold text-neutral-600">
              <div>© 2026 Aura Park. All rights reserved.</div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-success-400 animate-pulse-soft"></div>
                <span>All Systems Operational</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
