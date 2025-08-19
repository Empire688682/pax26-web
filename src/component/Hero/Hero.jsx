"use client"
import Image from 'next/image';
import Link from 'next/link';
import { useGlobalContext } from '../Context';

export default function Hero() {
  const {openModal} = useGlobalContext("register");
  return (
    <section className="pt-24 pb-16 bg-gradient-to-r from-blue-300 to-green-300">
      <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center justify-between gap-10">
        
        {/* Text Content */}
        <div className="md:w-1/2">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            Buy Cheap Data Instantly with <span className="text-blue-600">Monetrax</span>
          </h1>
          <p className="mt-4 text-gray-600 text-lg">
            Affordable data, fast delivery, zero stress. Top up anytime, anywhere.
          </p>

          <div className="mt-6 flex gap-4">
            <div
              onClick={()=>openModal("register")}
              className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
            >
              Get Started
            </div>
            <Link
              href="#pricing"
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-full hover:bg-blue-50 transition"
            >
              See Pricing
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="/MonetraxHero-img.png"
            alt="Monetrax Hero"
            width={500}
            height={400}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
