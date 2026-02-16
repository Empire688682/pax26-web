"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { Trash } from "lucide-react";

export function FaqBuilder({ faqs = [], onChange }) {
  const [localFaqs, setLocalFaqs] = useState(faqs);

  const handleAddFaq = () => {
    const newFaq = { question: "", answer: "" };
    const updated = [...localFaqs, newFaq];
    setLocalFaqs(updated);
    onChange(updated);
  };

  const handleRemoveFaq = (index) => {
    const updated = localFaqs.filter((_, i) => i !== index);
    setLocalFaqs(updated);
    onChange(updated);
  };

  const handleChange = (index, key, value) => {
    const updated = [...localFaqs];
    updated[index][key] = value;
    setLocalFaqs(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">FAQs</h3>
        <Button size="sm" onClick={handleAddFaq}>
          Add FAQ
        </Button>
      </div>

      {localFaqs.map((faq, index) => (
        <Card key={index} className="border">
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="font-medium">FAQ {index + 1}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFaq(index)}
              >
                <Trash className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Question"
                value={faq.question}
                onChange={(e) => handleChange(index, "question", e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                placeholder="Answer"
                value={faq.answer}
                onChange={(e) => handleChange(index, "answer", e.target.value)}
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
