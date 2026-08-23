import dynamic from 'next/dynamic';
import Hero from '@/components/Hero/Hero';
import Trusted from '@/components/Trusted/Trusted';
import QueryHandler from '@/components/Landing/QueryHandler';

// Dynamic imports for below-the-fold components to reduce initial JS bundle size on mobile
const Problem = dynamic(() => import('@/components/Problem/Problem'));
const AutomationFeatures = dynamic(() => import('@/components/AutomationFeatures/AutomationFeatures'));
const Services = dynamic(() => import('@/components/Services/Services'));
const Demo = dynamic(() => import('@/components/Demo/Demo'));
const MasterclassVideo = dynamic(() => import('@/components/MasterclassVideo/MasterclassVideo'));
const HowItWorks = dynamic(() => import('@/components/HowItWorks/HowItWorks'));
const WhyChooseUs = dynamic(() => import('@/components/WhyChooseUs/WhyChooseUs'));
const Testimonials = dynamic(() => import('@/components/Testimonials/Testimonials'));
const Pricing = dynamic(() => import('@/components/Pricing/Pricing'));
const CTA = dynamic(() => import('@/components/CTA/CTA'));

export default function Page() {
  return (
    <div className="overflow-hidden">
      <QueryHandler />

      {/* Hero Section */}
      <Hero />

      {/* Trusted Partners / Social Proof */}
      <Trusted />

      {/* Problem Section */}
      <Problem />

      {/* Automation Features */}
      <div className="border-t-[2px] border-black/80">
        <AutomationFeatures />
      </div>

      {/* Services */}
      <Services />

      {/* Demo / Storefront Showcase */}
      <Demo />

      {/* Official Masterclass Video */}
      <MasterclassVideo />

      {/* How It Works */}
      <HowItWorks />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Testimonials */}
      <Testimonials />

      {/* Pricing */}
      <Pricing />

      {/* Call to Action */}
      <CTA />
    </div>
  );
}
