'use client'
import React, { useState } from 'react';
import axios from 'axios';
import SocialIcons from '../SocialIcons/SocialIcons';
import { useGlobalContext } from '../Context';

const Footer = () => {
  const { pax26 } = useGlobalContext();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await axios.post('/api/newsletter', { email });
      setStatus('success');
      setMessage(res.data.message);
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <footer className="z-50"
    style={{ backgroundColor: pax26.footerBg }}>
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="mb-8 md:mb-0 text-center md:text-start text-center md:text-start">
            <h3 className="text-white font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-white hover:text-blue-100 transition-colors">About Us</a></li>
              <li><a href="#" className="text-white hover:text-blue-100 transition-colors">Our Team</a></li>
              <li><a href="#" className="text-white hover:text-blue-100 transition-colors">Careers</a></li>
              <li><a href="/contact" className="text-white hover:text-blue-100 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="mb-8 md:mb-0 text-center md:text-start">
            <h3 className="text-white font-bold text-lg mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="/dashboard/buy-data" className="text-white hover:text-blue-100 transition-colors">Data Plans</a></li>
              <li><a href="/dashboard" className="text-white hover:text-blue-100 transition-colors">Bill Payments</a></li>
              <li><a href="/dashboard" className="text-white hover:text-blue-100 transition-colors">Subscriptions</a></li>
              <li><a href="/dashboard" className="text-white hover:text-blue-100 transition-colors">Enterprise Solutions</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="mb-8 md:mb-0 text-center md:text-start">
            <h3 className="text-white font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="/contact" className="text-white hover:text-blue-100 transition-colors">Help Center</a></li>
              <li><a href="/blog" className="text-white hover:text-blue-100 transition-colors">Blog</a></li>
              <li><a href="#" className="text-white hover:text-blue-100 transition-colors">Tutorials</a></li>
              <li><a href="#" className="text-white hover:text-blue-100 transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="text-center md:text-start">
            <h3 className="text-white font-bold text-lg mb-4">Stay Updated</h3>
            <p className="text-white mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="px-4 py-2 border-white text-white border outline-none rounded-md text-gray-800 w-full"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {status !== 'idle' && (
              <p className={`mt-2 text-sm ${status === 'success' ? 'text-green-100' : 'text-red-100'}`}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-12 flex justify-center space-x-6">
          <SocialIcons />
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-white/20 pt-8">
          <p className="text-center text-white">© 2025 Pax26. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;