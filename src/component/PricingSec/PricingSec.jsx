"use client"

import { useGlobalContext } from "../Context";

export default function PricingSec() {
  const { pax26 } = useGlobalContext();
    return (
      <section id="pricing" 
      className="py-16 bg-gray-100"
      style={{ backgroundColor: pax26.secondaryBg }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: pax26.textPrimary }}>
            Affordable Pricing
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Enjoy flexible and pocket-friendly data plans for every device and need.
          </p>
  
          <div className="grid md:grid-cols-3 gap-8">
            {/* MTN */}
            <PlanCard
              network="MTN"
              price="₦290"
              size="1GB"
              validity="30 Days"
              color="bg-yellow-100 text-yellow-600"
            />
  
            {/* Airtel */}
            <PlanCard
              network="Airtel"
              price="₦280"
              size="1GB"
              validity="30 Days"
              color="bg-red-100 text-red-600"
            />
  
            {/* Glo */}
            <PlanCard
              network="Glo"
              price="₦270"
              size="1GB"
              validity="30 Days"
              color="bg-green-100 text-green-600"
            />
          </div>
  
          <p className="text-sm text-gray-500 mt-6">
            Prices may vary slightly based on availability. More bundles available when you sign up!
          </p>
        </div>
      </section>
    );
  }
  
  function PlanCard({ network, price, size, validity, color }) {
    const {route, pax26} = useGlobalContext();
    return (
      <div className="p-6 rounded-xl shadow hover:shadow-md transition text-left"
      style={{ backgroundColor: pax26.card}}>
        <div className={`px-3 py-1 text-sm font-semibold rounded-full w-fit mb-4 ${color}`}>
          {network}
        </div>
        <h3 className="text-2xl font-bold mb-2"
        style={{ color: pax26.textPrimary }}>{price}</h3>
        <p className="text-gray-600">{size} Data Plan</p>
        <p className="text-gray-500 text-sm mb-4">Valid for {validity}</p>
        <button onClick={()=>route.push("/dashboard")}  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
          Get Started
        </button>
      </div>
    );
  }
  