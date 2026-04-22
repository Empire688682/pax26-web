/**
 * nigerianBusinessTemplates.js
 * Pre-built AI training templates for common Nigerian business types.
 * Selecting a template auto-fills the entire training form.
 */

export const NIGERIAN_BUSINESS_TEMPLATES = [
  {
    id: "fashion",
    label: "Fashion & Clothing",
    emoji: "👗",
    industry: "Fashion & Retail",
    description:
      "We sell quality men's, women's, and children's clothing including casual wear, office wear, traditional attire (Ankara, Aso-oke), and accessories. We offer both ready-to-wear and made-to-order styles.",
    services: [
      "Ready-to-wear outfits",
      "Made-to-order / custom sewing",
      "Ankara fabric & accessories",
      "Office & corporate wear",
      "Traditional attire (Aso-ebi, Agbada)",
      "Fashion styling advice",
      "Delivery across Nigeria",
    ],
    faqs: [
      {
        question: "Do you do custom sewing?",
        answer:
          "Yes! We offer made-to-order outfits. Simply send us your measurements and style preference and we'll get it done within 5–7 working days.",
      },
      {
        question: "How do I place an order?",
        answer:
          "You can order via WhatsApp by sending us your size, preferred style, and delivery address. We accept bank transfer, card payment, and cash on pickup.",
      },
      {
        question: "Do you deliver?",
        answer:
          "Yes, we deliver nationwide. Lagos same-day delivery is available. Other states take 2–5 business days via courier.",
      },
      {
        question: "What are your prices?",
        answer:
          "Prices depend on the item. Ready-to-wear starts from ₦5,000. Custom sewing starts from ₦15,000. Contact us for a full price list.",
      },
      {
        question: "Can I return or exchange an item?",
        answer:
          "We accept exchanges within 48 hours of delivery if the item is unworn and undamaged. Custom orders are non-refundable.",
      },
    ],
    tone: "friendly",
    workingHours: "Mon–Sat 9am–7pm",
  },

  {
    id: "food",
    label: "Food & Restaurant",
    emoji: "🍲",
    industry: "Food & Hospitality",
    description:
      "We serve freshly cooked Nigerian meals including rice dishes, soups, swallow, grills, and small chops. We offer dine-in, takeaway, and home delivery services.",
    services: [
      "Dine-in",
      "Takeaway",
      "Home delivery",
      "Party catering & bulk orders",
      "Small chops & event snacks",
      "Jollof rice & fried rice",
      "Soups (Egusi, Ogbono, Banga, Afang)",
      "Grilled chicken & fish",
    ],
    faqs: [
      {
        question: "Do you deliver?",
        answer:
          "Yes! We deliver within our local area. Send us your address and we'll confirm if you're within our delivery zone. Delivery fee applies.",
      },
      {
        question: "How do I order?",
        answer:
          "Simply tell us what you'd like, your quantity, and your delivery address. We'll confirm your order and give you a total with delivery time.",
      },
      {
        question: "Do you do catering for events?",
        answer:
          "Yes, we cater for parties, corporate events, and occasions of all sizes. Please contact us at least 3 days in advance to discuss your menu and pricing.",
      },
      {
        question: "What are your prices?",
        answer:
          "Our meals start from ₦1,500 per plate. Bulk and catering orders get discounted pricing. Contact us for today's full menu and prices.",
      },
      {
        question: "What time do you close?",
        answer: "We are open Monday to Sunday from 9am to 9pm.",
      },
    ],
    tone: "friendly",
    workingHours: "Mon–Sun 9am–9pm",
  },

  {
    id: "logistics",
    label: "Logistics & Delivery",
    emoji: "🚚",
    industry: "Logistics & Transportation",
    description:
      "We provide fast, reliable dispatch and delivery services for individuals and businesses across Lagos and other major Nigerian cities. We handle documents, packages, and bulk goods.",
    services: [
      "Same-day Lagos delivery",
      "Interstate delivery",
      "Document dispatch",
      "E-commerce fulfillment",
      "Bulk goods haulage",
      "Pick-up & drop-off",
      "Corporate delivery contracts",
    ],
    faqs: [
      {
        question: "How do I book a delivery?",
        answer:
          "Send us the pickup address, delivery address, item description, and your contact number. We'll send you a quote and arrange pickup.",
      },
      {
        question: "How much does delivery cost?",
        answer:
          "Pricing depends on distance and item size. Lagos intra-state starts from ₦1,500. Interstate rates vary by destination. Send us your details for a quote.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Same-day delivery within Lagos is available if booked before 12pm. Interstate deliveries take 1–3 business days depending on the destination.",
      },
      {
        question: "Is my package insured?",
        answer:
          "We handle all items with care. For high-value items, we recommend declaring the value so we can advise on appropriate handling. Contact us for insurance options.",
      },
      {
        question: "Do you deliver on weekends?",
        answer: "Yes, we operate 7 days a week including Saturdays and Sundays.",
      },
    ],
    tone: "professional",
    workingHours: "Mon–Sun 7am–8pm",
  },

  {
    id: "salon",
    label: "Hair & Beauty Salon",
    emoji: "💇",
    industry: "Beauty & Personal Care",
    description:
      "We are a full-service beauty salon offering hair, makeup, nails, and skincare treatments. We specialize in natural hair care, braiding, weaves, and professional makeup for events.",
    services: [
      "Hair braiding & twists",
      "Weave & wig installation",
      "Hair relaxing & treatment",
      "Natural hair care",
      "Makeup (bridal, events, photoshoots)",
      "Manicure & pedicure",
      "Facials & skincare",
      "Hair colouring & highlights",
    ],
    faqs: [
      {
        question: "Do I need an appointment?",
        answer:
          "Appointments are recommended to avoid waiting, especially on weekends. Walk-ins are welcome but subject to availability. Book via WhatsApp.",
      },
      {
        question: "How much does hair braiding cost?",
        answer:
          "Braiding prices depend on the style. Simple cornrows start from ₦3,000, box braids from ₦8,000, and passion twists from ₦10,000. Contact us for the full price list.",
      },
      {
        question: "Do you use quality products?",
        answer:
          "Yes, we use trusted, professional-grade hair and skincare products. We also carry organic and natural product options on request.",
      },
      {
        question: "Do you offer home service?",
        answer:
          "Yes, we offer home service for makeup and some hair treatments. A travel fee applies. Book in advance as slots fill up fast.",
      },
      {
        question: "How long does a full makeup take?",
        answer:
          "A full glam makeup session typically takes 1.5 to 2 hours. We recommend booking at least 2 hours before your event.",
      },
    ],
    tone: "friendly",
    workingHours: "Tue–Sun 9am–7pm",
  },

  {
    id: "real_estate",
    label: "Real Estate & Rentals",
    emoji: "🏠",
    industry: "Real Estate",
    description:
      "We help individuals and families find, buy, sell, and rent residential and commercial properties across Nigeria. We also manage properties on behalf of landlords.",
    services: [
      "Property sales",
      "Short & long-term rentals",
      "Property management",
      "Land sales",
      "Commercial property leasing",
      "Property inspection & valuation",
      "Landlord advisory services",
    ],
    faqs: [
      {
        question: "How do I find a property to rent?",
        answer:
          "Tell us your preferred location, budget, and property type (e.g. 2-bedroom flat). We'll shortlist available options and schedule inspections for you.",
      },
      {
        question: "What documents do I need to rent?",
        answer:
          "Typically: a valid ID, 2 guarantor forms, 1–2 years' rent upfront (depending on the landlord), and an agency fee (usually 10% of annual rent).",
      },
      {
        question: "Do you have land for sale?",
        answer:
          "Yes, we have verified plots of land in various locations. Prices depend on location and size. Contact us with your preferred area and budget.",
      },
      {
        question: "How do I know a property is legitimate?",
        answer:
          "We conduct due diligence on all listings and verify title documents before listing. We recommend always confirming documents with a legal practitioner.",
      },
      {
        question: "What is your agency fee?",
        answer:
          "Our agency fee is typically 10% of the annual rent for rentals, and 5% of the property value for sales. This is paid once at the point of agreement.",
      },
    ],
    tone: "professional",
    workingHours: "Mon–Sat 9am–6pm",
  },

  {
    id: "pharmacy",
    label: "Pharmacy & Health",
    emoji: "💊",
    industry: "Healthcare & Pharmacy",
    description:
      "We are a registered community pharmacy providing prescription and over-the-counter medications, health supplements, baby care products, and basic health consultations.",
    services: [
      "Prescription dispensing",
      "Over-the-counter medications",
      "Health supplements & vitamins",
      "Baby care & infant products",
      "Blood pressure & blood sugar checks",
      "Wound care & dressing",
      "Health product delivery",
    ],
    faqs: [
      {
        question: "Do I need a prescription to buy drugs?",
        answer:
          "For prescription-only medicines (POM), a valid prescription from a licensed doctor is required. Over-the-counter (OTC) drugs are available without a prescription.",
      },
      {
        question: "Do you deliver medications?",
        answer:
          "Yes, we offer delivery within our local area. Send us your prescription or the medication name, and we'll confirm availability and arrange delivery.",
      },
      {
        question: "Can I get health advice here?",
        answer:
          "Our pharmacist is available for basic health consultations and drug counselling. For more serious concerns, we will refer you to the appropriate specialist.",
      },
      {
        question: "Do you sell generic medications?",
        answer:
          "Yes, we stock both branded and NAFDAC-approved generic alternatives, which are often more affordable with the same effectiveness.",
      },
      {
        question: "What are your opening hours?",
        answer: "We are open Monday to Saturday from 8am to 9pm, and Sundays from 10am to 6pm.",
      },
    ],
    tone: "professional",
    workingHours: "Mon–Sat 8am–9pm, Sun 10am–6pm",
  },

  {
    id: "tech_support",
    label: "Tech & Gadget Repair",
    emoji: "🔧",
    industry: "Technology & Repairs",
    description:
      "We repair smartphones, laptops, tablets, and other electronics. We also sell accessories, refurbished phones, and offer IT support for individuals and small businesses.",
    services: [
      "Phone screen replacement",
      "Laptop repair & servicing",
      "Battery replacement",
      "Software installation & virus removal",
      "Data recovery",
      "Sale of accessories & gadgets",
      "Refurbished phone sales",
      "IT support for small businesses",
    ],
    faqs: [
      {
        question: "How much does a screen repair cost?",
        answer:
          "Screen repair prices vary by phone model. iPhone screens start from ₦25,000, Samsung from ₦15,000, and other Android brands from ₦8,000. Send your phone model for an exact quote.",
      },
      {
        question: "How long does a repair take?",
        answer:
          "Most screen replacements and battery swaps are done same-day within 1–2 hours. Complex repairs like motherboard issues may take 2–5 days.",
      },
      {
        question: "Is my data safe during repairs?",
        answer:
          "We handle all devices with care and confidentiality. We recommend backing up your data before bringing in your device as a precaution.",
      },
      {
        question: "Do you offer a warranty on repairs?",
        answer:
          "Yes, we offer a 30-day warranty on parts and labour for most repairs. If the same fault recurs within that period, we fix it at no extra charge.",
      },
      {
        question: "Do you buy or sell used phones?",
        answer:
          "Yes, we buy, sell, and swap used phones. Bring in your device for assessment and we'll make you a fair offer based on its condition.",
      },
    ],
    tone: "friendly",
    workingHours: "Mon–Sat 9am–7pm",
  },

  {
    id: "general_retail",
    label: "General Retail / Store",
    emoji: "🛒",
    industry: "Retail & Commerce",
    description:
      "We are a general goods store selling a wide range of everyday products including groceries, household items, personal care products, and electronics accessories.",
    services: [
      "Groceries & food items",
      "Household supplies",
      "Personal care & toiletries",
      "Electronics accessories",
      "Stationery & office supplies",
      "Baby & children's products",
      "Wholesale & bulk purchases",
      "Home delivery",
    ],
    faqs: [
      {
        question: "Do you sell in bulk?",
        answer:
          "Yes, we offer wholesale pricing for bulk purchases. Contact us with the item and quantity you need and we'll provide a bulk quote.",
      },
      {
        question: "Do you deliver?",
        answer:
          "Yes, we offer delivery within our local area. Delivery fee depends on your location. Minimum order for delivery is ₦5,000.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept bank transfer, POS (card payment), and cash. For orders above ₦20,000, we require a deposit before processing.",
      },
      {
        question: "Can I return a product?",
        answer:
          "Returns are accepted within 24 hours for damaged or incorrect items. Perishable goods (food, drinks) cannot be returned once sold.",
      },
      {
        question: "Do you have a price list?",
        answer:
          "Yes, we can send you our current price list on WhatsApp. Just let us know the category of items you're interested in.",
      },
    ],
    tone: "friendly",
    workingHours: "Mon–Sat 8am–8pm, Sun 10am–5pm",
  },
];
