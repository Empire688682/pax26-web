"use client";
import {
    Wifi,
    PhoneCall,
    Tv,
    Bolt,
    Gift,
    Banknote,
    BadgeCheck,
  } from 'lucide-react';
import { useGlobalContext } from '../Context';
  
  export default function Services() {
    const { pax26 } = useGlobalContext();
    return (
      <section 
      className="py-16"
      style={{ backgroundColor: pax26.secodaryBg }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: pax26.textPrimary }}>
            Our Services
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            At #Pax26, we provide everything you need to stay connected and save money.
          </p>
  
          <div className="grid md:grid-cols-4 gap-8">
            {/* Service Cards */}
            <ServiceCard
              Icon={Wifi}
              title="Buy Data"
              description="Instant data for MTN, Glo, Airtel & 9mobile at the cheapest rates."
            />
            <ServiceCard
              Icon={PhoneCall}
              title="Airtime Top-Up"
              description="Top up your line or others in seconds. Zero delay, 24/7."
            />
            <ServiceCard
              Icon={Tv}
              title="Cable TV"
              description="Pay for DSTV, GOTV, and Startimes without queues."
            />
            <ServiceCard
              Icon={Bolt}
              title="Electricity Bills"
              description="Buy electricity tokens for your home or office."
            />
            <ServiceCard
              Icon={Gift}
              title="Gift Card Exchange"
              description="Sell gift cards fast and get paid directly into your wallet."
            />
            <ServiceCard
              Icon={Banknote}
              title="Send Money"
              description="Transfer from Pax26 wallet to any Nigerian bank easily."
            />
            <ServiceCard
              Icon={BadgeCheck}
              title="Identity Verification"
              description="Verify users with BVN/NIN for secure and trusted operations."
            />
          </div>
        </div>
      </section>
    );
  }
  
  // Reusable card component
  function ServiceCard({ Icon, title, description }) {
    const { pax26 } = useGlobalContext();
    return (
      <div 
      className="p-6 rounded-xl shadow hover:shadow-md transition"
      style={{ backgroundColor: pax26.card }}
      >
        <div className="flex justify-center mb-4 text-blue-600">
          <Icon size={32} />
        </div>
        <h3 
        className="text-lg font-semibold mb-2"
        style={{ color: pax26.textPrimary }}
        >{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    );
  }
  