"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Cards";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";
import { FaqBuilder } from "@/components/ui/FaqBuilder";
import { motion } from "framer-motion";
import { useGlobalContext } from "../Context";

const steps = [
  "Business Info",
  "Services",
  "FAQs",
  "Tone & Hours",
  "WhatsApp",
  "Review",
  "Train AI",
];

export default function AiTrainingPage() {
  const { pax26 } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    businessName: "",
    industry: "",
    businessUrl: "",
    description: "",
    services: [],
    faqs: [],
    tone: "professional",
    workingHours: "",
    whatsappBusiness: {
      phoneNumber: "",
      businessId: "",
    },
  });


  const next = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (step === steps.length - 1) {
      handleTrain();
    } else {
      setStep((s) => Math.min(s + 1, steps.length - 1))
    }
    
  };
  
  const back = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((s) => Math.max(s - 1, 0))
  };

  const nextDisabled = () => {
    switch (step) {
      case 0:
        return !form.businessName.trim() ||
          !form.industry.trim() ||
          !form.description.trim();
      case 1:
        return form.services.length === 0;
      case 2:
        return form.faqs.length === 0;
      case 3:
        return !form.tone || !form.workingHours.trim();
      case 4:
        return !form.whatsappBusiness.phoneNumber.trim();
      default:
        return false;
    }
  };

  const handleTrain = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/automations/train", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        alert("AI training started successfully!");
        setForm({
          businessName: "",
          industry: "",
          businessUrl: "",
          description: "",
          services: [],
          faqs: [],
          tone: "professional",
          workingHours: "",
          whatsappBusiness: {
            phoneNumber: "",
            businessId: "",
          },
        });
        setStep(0);
      } else {
        alert("Failed to start AI training: " + data.message);
      }
    } catch (error) {
      console.log("TrainErr: ", error);
      alert("An error occurred while starting AI training.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10" style={{ color: pax26.textPrimary }}>
      {/* Progress */}
      <p className="text-sm mb-2 text-muted-foreground">
        Step {step + 1} of {steps.length}
      </p>

      <h1 className="text-2xl font-bold mb-6">{steps[step]}</h1>

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-6 space-y-4">
            {renderStep(step, form, setForm)}
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {step > 0 && <Button variant="outline" disabled={loading} onClick={back}>Back</Button>}
        <Button onClick={next} disabled={nextDisabled() || loading}>
          {step === steps.length - 1 ? `${loading ? "Processing" : "Train AI"}` : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
}

function renderStep(step, form, setForm) {
  switch (step) {
    case 0:
      return (
        <>
          <Input
            label="Business Name"
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />
          <Input
            label="Industry"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
          />
          <Input
            label="Business URL"
            value={form.businessUrl}
            onChange={(e) => setForm({ ...form, businessUrl: e.target.value })}
          />
          <Textarea
            label="Business Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </>
      );

    case 1:
      return (
        <TagInput
          example="e.g. Web Design, SEO, Consulting"
          label="Services You Offer"
          tags={form.services}
          onChange={(services) => setForm({ ...form, services })}
        />
      );

    case 2:
      return (
        <FaqBuilder
          faqs={form.faqs}
          onChange={(faqs) => setForm({ ...form, faqs })}
        />
      );

    case 3:
      return (
        <>
          <Select
            label="Conversation Tone"
            value={form.tone}
            options={["friendly", "professional", "salesy"]}
            onChange={(tone) => setForm({ ...form, tone })}
          />
          <Input
            label="Working Hours"
            placeholder="Mon–Fri 9am–6pm"
            value={form.workingHours}
            onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
          />
        </>
      );

    case 4:
      return (
        <Input
          label="WhatsApp Business Number"
          value={form.whatsappBusiness.phoneNumber}
          onChange={(e) =>
            setForm({
              ...form,
              whatsappBusiness: {
                ...form.whatsappBusiness,
                phoneNumber: e.target.value,
              },
            })
          }
        />
      );

    case 5: // REVIEW STEP
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Review Your Details</h3>
          <Card>
            <CardContent>
              <p><strong>Business Name:</strong> {form.businessName}</p>
              <p><strong>Industry:</strong> {form.industry}</p>
              <p><strong>Business URL:</strong> {form.businessUrl}</p>
              <p><strong>Description:</strong> {form.description}</p>
              <p><strong>Services:</strong> {form.services.join(", ")}</p>
              <p>
                <strong>FAQs:</strong>{" "}
                {form.faqs.length > 0
                  ? form.faqs.map((f, i) => (
                    <div key={i}>
                      Q: {f.question} <br /> A: {f.answer}
                    </div>
                  ))
                  : "None"}
              </p>
              <p><strong>Tone:</strong> {form.tone}</p>
              <p><strong>Working Hours:</strong> {form.workingHours}</p>
              <p><strong>WhatsApp Number:</strong> {form.whatsappBusiness.phoneNumber}</p>
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground">
            Please review your details carefully before training your AI.
          </p>
        </div>
      );

    case 6: // FINAL STEP: TRAIN AI
      return (
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold capitalize">
            Ready to Train {form?.businessName} AI 🚀
          </h3>
          <p className="text-sm text-muted-foreground">
            Your AI will learn your business, services, FAQs, and tone.
          </p>
        </div>
      );

    default:
      return null;
  }
}
