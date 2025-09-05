export default function Testimonials() {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            What Our Users Say
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Real feedback from satisfied users who trust Pax26 for their daily data and utility needs.
          </p>
  
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <TestimonialCard
              name="Precious A."
              role="Student, UI"
              quote="Pax26 is my go-to for cheap data! I don’t stress anymore and it’s super fast!"
            />
            <TestimonialCard
              name="Femi L."
              role="Freelancer, Lagos"
              quote="I use it to pay for my light and GOTV every month. No failed transactions ever."
            />
            <TestimonialCard
              name="Ijeoma E."
              role="Small Biz Owner"
              quote="I even earn extra by reselling airtime with Pax26. Highly recommend!"
            />
          </div>
        </div>
      </section>
    );
  }
  
  function TestimonialCard({ name, role, quote }) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-md transition">
        <p className="text-gray-700 text-sm italic mb-4">"{quote}"</p>
        <hr className="my-4 border-gray-200" />
        <div>
          <p className="text-gray-800 font-semibold">{name}</p>
          <p className="text-gray-500 text-sm">{role}</p>
        </div>
      </div>
    );
  }
  