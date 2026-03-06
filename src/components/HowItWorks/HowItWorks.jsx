export default function HowItWorks() {
  const steps = [
    "Connect WhatsApp",
    "Add business information",
    "Activate AI automation",
    "Watch AI reply customers",
  ];

  return (
    <section className="py-24 bg-gray-50 text-center">
      <h2 className="text-4xl font-bold">Start Automating in Minutes</h2>

      <div className="grid md:grid-cols-4 gap-8 mt-12 max-w-6xl mx-auto px-6">
        {steps.map((step, i) => (
          <div key={i} className="p-6 bg-white rounded-xl shadow">
            <span className="text-3xl font-bold">{i + 1}</span>
            <p className="mt-4">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}