export default function AutomationFeatures() {
  const features = [
    {
      title: "WhatsApp Automation",
      text: "Automatically respond to customers instantly.",
    },
    {
      title: "AI Chatbot",
      text: "Train AI with your business information.",
    },
    {
      title: "Smart Follow-ups",
      text: "Automatically message leads who didn’t respond.",
    },
    {
      title: "Lead Qualification",
      text: "AI asks questions before sending leads to you.",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 px-6">
        {features.map((f, i) => (
          <div key={i} className="p-8 shadow rounded-xl">
            <h3 className="text-xl font-bold">{f.title}</h3>
            <p className="mt-2 text-gray-600">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}