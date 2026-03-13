export default function Utilities() {
  const services = [
    "Airtime",
    "Data",
    "Electricity",
    "TV Subscription",
    "Gift Cards",
    "More"
  ];

  return (
    <section className="py-24 bg-black/60 px-6 text-center">
      <h2 className="text-4xl font-bold text-white">More Business Tools</h2>

      <div className="grid md:grid-cols-5 gap-6 mt-12 max-w-6xl mx-auto px-6">
        {services.map((s, i) => (
          <div key={i} className="p-6 shadow bg-gray-300 rounded-xl">
            {s}
          </div>
        ))}
      </div>
    </section>
  );
}