export default function Demo() {
  return (
    <section className="py-24 px-6 bg-white text-center">
      <h2 className="text-4xl font-bold">See Pax26 AI In Action</h2>

      <div className="mt-10 max-w-xl mx-auto space-y-4 text-left">
        <div className="bg-gray-100 p-4 rounded-lg">
          Customer: Hi do you sell shoes?
        </div>

        <div className="bg-green-100 p-4 rounded-lg">
          AI: Yes 👟 <br />
          1️⃣ Nike <br />
          2️⃣ Adidas
        </div>

        <div className="bg-green-100 p-4 rounded-lg">
          Follow-up: Hi 👋 you left an item in your cart yesterday.
        </div>
      </div>
    </section>
  );
}