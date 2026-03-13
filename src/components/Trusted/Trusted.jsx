"use client";
import { useGlobalContext } from "../Context";

export default function Trusted() {

  return (
    <section className="py-20 px-6 text-center">
      <h2 className="text-3xl font-bold text-gray-300">Built For Modern Businesses</h2>

      <p className="mt-4 text-gray-400">
        Thousands of businesses use Pax26 to automate customer conversations.
      </p>

      <div className="grid md:grid-cols-3 gap-10 mt-12 max-w-5xl mx-auto">
        <div>
          <h3 className="text-4xl font-bold text-gray-300">10K+</h3>
          <p className="text-gray-400">Automated Conversations</p>
        </div>

        <div>
          <h3 className="text-4xl font-bold text-gray-300">2K+</h3>
          <p className="text-gray-400">Businesses</p>
        </div>

        <div>
          <h3 className="text-4xl font-bold text-gray-300">24/7</h3>
          <p className="text-gray-400">AI Customer Support</p>
        </div>
      </div>
    </section>
  );
}