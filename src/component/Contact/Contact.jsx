'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import SocialIcons from '../SocialIcons/SocialIcons';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      return toast.error('All fields are required!');
    }

    toast.success('Message sent successfully!');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <ToastContainer />
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Left Side */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-blue-600">Get in Touch</h1>
          <p className="text-gray-600">
            We're always here to help. Whether you have a question or just want to say hello,
            feel free to reach out!
          </p>

          <div className="space-y-4 text-sm text-gray-700">
            <p className="flex items-center gap-2">
              <Mail className="text-blue-500" size={18} /> useMonetrax@gmail.com
            </p>
            <p className="flex items-center gap-2">
              <Phone className="text-green-500" size={18} /> +234 9154 3581 2845
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="text-red-500" size={18} /> 10 Koshebinu Street Ibeshe, Lagos, Nigeria
            </p>
          </div>

          <SocialIcons />

          <div className="relative w-full h-64 mt-6 rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/contact-img.png"
              alt="Contact Illustration"
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-blue-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                name="message"
                rows="5"
                placeholder="Write your message here..."
                value={form.message}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
