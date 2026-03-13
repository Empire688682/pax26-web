export default function Pricing() {
  const plans = [
    { name: "Starter", price: "₦0", desc: "Basic AI automation" },
    { name: "Growth", price: "₦9,000", desc: "Advanced automation" },
    { name: "Business", price: "₦25,000", desc: "Full AI automation" },
  ];

  return (
    <section id="pricing" className="py-24">
      <h2 className="text-4xl text-center text-white font-bold">Simple Pricing</h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12 px-6">
        {plans.map((p, i) => (
          <div key={i} className="bg-gray-200 p-8 rounded-xl shadow text-center">
            <h3 className="text-xl font-bold">{p.name}</h3>
            <p className="text-3xl mt-4">{p.price}</p>
            <p className="text-gray-500 mt-2">{p.desc}</p>
            <button className="mt-6 px-6 py-3 bg-black text-white rounded-lg">
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}