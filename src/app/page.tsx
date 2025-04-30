/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { FaInstagram, FaTwitter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/navigation';

interface ApiResponse {
  error?: string;
  success: boolean;
  message?: string;
}

type SubmitError = {
  message: string;
};

// Memoized social links component
const SocialLinks = React.memo(() => (
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
));

SocialLinks.displayName = 'SocialLinks';

// Memoized background layers component
const BackgroundLayers = React.memo(() => (
  <>
    <div className="absolute inset-0 gradient-bg" />
    <div 
      className="absolute inset-0" 
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.035) 0%, transparent 70%)',
        filter: 'blur(120px)',
        transform: 'translateZ(0)',
      }} 
    />
    <div 
      className="absolute inset-0" 
      style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.02) 0%, transparent 50%)',
        filter: 'blur(80px)',
      }} 
    />
  </>
));

BackgroundLayers.displayName = 'BackgroundLayers';

export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize the email validation function
  const validateEmail = useCallback((email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  // Memoize the handleSubmit function
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Subscription failed');
      
      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, validateEmail]);

  // Optimize scroll handling
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolled(window.scrollY > 50);
      }, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Memoize the main content class
  const mainContentClass = useMemo(() => 
    `space-y-8 text-center px-4 transform transition-all duration-1000 relative z-10 ${
      mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`,
    [mounted]
  );

  // Memoize the bottom text class
  const bottomTextClass = useMemo(() => 
    `absolute bottom-8 text-sm text-gray-500 transform transition-all duration-1000 delay-500 ${
      mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`,
    [mounted]
  );

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      <BackgroundLayers />
      
      <div className={mainContentClass}>
        <h1 className="text-7xl md:text-9xl neon-text">
          <span className="wave-letter">K</span>
          <span className="wave-letter">A</span>
          <span className="wave-letter">Z</span>
          <span className="wave-letter">E</span>
        </h1>
        
        <p className="text-xl md:text-2xl font-light tracking-wider text-gray-300 max-w-2xl mx-auto">
          A new era of fashion is approaching.
        </p>
        
        <div className="flex items-center justify-center space-x-4 text-lg md:text-xl text-gray-400 my-8">
          <span className="w-12 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          <span className="font-light tracking-[0.2em]">LAUNCHING SOON</span>
          <span className="w-12 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        </div>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form
              onSubmit={handleSubmit}
              className="max-w-md mx-auto w-full space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
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
                  className={`mt-4 w-full md:w-auto md:mt-0 md:absolute md:right-2 md:top-2 px-6 py-2 bg-white text-black font-medium rounded-md transition-all duration-300 hover:bg-gray-200 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Subscribing...' : 'Notify Me'}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-2 animate-fade-in">
                  {error}
                </p>
              )}
            </motion.form>
          ) : (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="transition-all duration-700 ease-out text-lg font-semibold tracking-wide text-white/90"
                style={{textShadow:'0 0 16px #fff, 0 0 32px #fff, 0 0 48px #fff'}}
              >
                THANKS!! SEE YA WITH THE NEXT DROP 🥰
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <SocialLinks />
      </div>

      <div className={bottomTextClass}>
        © 2024 KAZE. All rights reserved. | Site by <a href="https://linktr.ee/andrewdom" className="text-white hover:text-gray-300 transition-all duration-300">andrwdom</a>
      </div>
    </main>
  );
}
