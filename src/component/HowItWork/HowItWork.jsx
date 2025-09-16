import { Smartphone, Wallet2, Zap } from 'lucide-react';
import { useGlobalContext } from '../Context';

export default function HowItWorks() {
  const { pax26 } = useGlobalContext();
  return (
    <section
      className="py-16"
      style={{ backgroundColor: pax26.secondaryBg }}
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: pax26.textPrimary }}
        >
          How It Works
        </h2>
        <p className="mb-12 max-w-2xl mx-auto"
          style={{ color: pax26.textSecondary }}>
          Get started with #Pax26 in just a few taps. Fast, easy, and stress-free!
        </p>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
              <Smartphone size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2"
              style={{ color: pax26.textPrimary }}
            >Create an Account</h3>
            <p className="text-gray-600"
              style={{ color: pax26.textSecondary }}
            >
              Sign up in seconds and get access to cheap data and airtime instantly.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
              <Wallet2 size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2"
              style={{ color: pax26.textPrimary }}
            >Fund Your Wallet</h3>
            <p className="text-gray-600"
              style={{ color: pax26.textSecondary }}
            >
              Add money to your wallet using bank transfer or card payments.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
              <Zap size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2"
              style={{ color: pax26.textPrimary }}
            >Buy Data Instantly</h3>
            <p className="text-gray-600"
              style={{ color: pax26.textSecondary }}
            >
              Choose a network, pick a plan, and boom — your data arrives in seconds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
