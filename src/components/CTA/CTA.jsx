"use client";
import { useGlobalContext } from "../Context";

export default function CTA() {
  const { openModal } = useGlobalContext();

  return (
    <section className="py-24 bg-black text-white text-center">
      <h2 className="text-4xl font-bold">
        Let AI Handle Your Customer Conversations
      </h2>

      <button
        onClick={() => openModal("register")}
        className="mt-8 px-8 py-4 bg-white text-black rounded-lg"
      >
        Create Free Account
      </button>
    </section>
  );
}