"use client";
import { useGlobalContext } from "../Context";

export default function Trusted() {
  const { pax26 } = useGlobalContext();

  return (
    <section className="py-20 px-6 bg-white text-center">
      <h2 className="text-3xl font-bold">Built For Modern Businesses</h2>

      <p className="mt-4 text-gray-600">
        Thousands of businesses use Pax26 to automate customer conversations.
      </p>

      <div className="grid md:grid-cols-3 gap-10 mt-12 max-w-5xl mx-auto">
        <div>
          <h3 className="text-4xl font-bold">10K+</h3>
          <p className="text-gray-500">Automated Conversations</p>
        </div>

        <div>
          <h3 className="text-4xl font-bold">2K+</h3>
          <p className="text-gray-500">Businesses</p>
        </div>

        <div>
          <h3 className="text-4xl font-bold">24/7</h3>
          <p className="text-gray-500">AI Customer Support</p>
        </div>
      </div>
    </section>
  );
}