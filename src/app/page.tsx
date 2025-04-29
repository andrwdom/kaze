'use client';

import { useState, useEffect } from 'react';
import { FaInstagram, FaTwitter } from 'react-icons/fa';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [showThanks, setShowThanks] = useState(false);
  const [buttonGlow, setButtonGlow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setEmail('');
      setShowThanks(true);
      setButtonGlow(true);
      setTimeout(() => setShowThanks(false), 2200);
      setTimeout(() => setButtonGlow(false), 600);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 gradient-bg" />
      
      {/* Radial Gradient with Blur */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.035) 0%, transparent 70%)',
        filter: 'blur(120px)',
        transform: 'translateZ(0)',
      }} />

      {/* Additional Glow Layer */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.02) 0%, transparent 50%)',
        filter: 'blur(80px)',
      }} />
      
      {/* Main Content */}
      <div className={`space-y-8 text-center px-4 transform transition-all duration-1000 relative z-10 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Logo/Brand Name with Neon Effect and Wave */}
        <h1 className="text-7xl md:text-9xl neon-text">
          <span className="wave-letter">K</span>
          <span className="wave-letter">A</span>
          <span className="wave-letter">Z</span>
          <span className="wave-letter">E</span>
        </h1>
        
        {/* Tagline */}
        <p className="text-xl md:text-2xl font-light tracking-wider text-gray-300 max-w-2xl mx-auto">
          A new era of fashion is approaching.
        </p>
        
        {/* Divider */}
        <div className="flex items-center justify-center space-x-4 text-lg md:text-xl text-gray-400 my-8">
          <span className="w-12 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          <span className="font-light tracking-[0.2em]">LAUNCHING SOON</span>
          <span className="w-12 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        </div>

        {/* Email Signup */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto w-full space-y-4">
          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email for early access"
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all duration-300 placeholder:text-gray-500 backdrop-blur-sm"
              required
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`mt-4 w-full md:w-auto md:mt-0 md:absolute md:right-2 md:top-2 px-6 py-2 bg-white text-black font-medium rounded-md transition-all duration-300 ${
                buttonGlow ? 'shadow-[0_0_24px_6px_rgba(255,255,255,0.7)]' : 'hover:bg-gray-200'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Subscribing...' : 'Notify Me'}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2 animate-fade-in">
              {error}
            </p>
          )}
        </form>
        {/* Animated Thanks Message */}
        <div className={`transition-all duration-700 ease-out text-lg font-semibold tracking-wide text-white/90 ${
          showThanks ? 'opacity-100 translate-y-0 scale-105' : 'opacity-0 translate-y-4 scale-95'
        } pointer-events-none select-none`}
             style={{textShadow:'0 0 16px #fff, 0 0 32px #fff, 0 0 48px #fff'}}>
          THANKS!! SEE YA WITH THE NEXT DROP 🥰
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-8 mt-12">
          <a 
            href="#" 
            className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Follow us on Instagram"
          >
            <FaInstagram className="w-7 h-7" />
          </a>
          <a
            href="#" 
            className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Follow us on Twitter"
          >
            <FaTwitter className="w-7 h-7" />
          </a>
        </div>
      </div>

      {/* Bottom Text */}
      <div className={`absolute bottom-8 text-sm text-gray-500 transform transition-all duration-1000 delay-500 ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        © 2024 KAZE. All rights reserved.
      </div>
    </main>
  );
}
