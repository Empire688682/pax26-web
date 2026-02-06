"use client";

import { useGlobalContext } from "../Context";

export default function PrivacyPage() {
  const { pax26 } = useGlobalContext();
  return (
    <main className="py-12 px-6"
      style={{ backgroundColor: pax26.secondaryBg, color: pax26.textPrimary }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <p className="text-sm text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="space-y-6 leading-relaxed">
          <p>
            Pax26 (“we”, “our”, “us”) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you use our application and services.
          </p>

          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Personal Information:</strong> name, email address, phone
              number, and other details you provide when creating an account.
            </li>
            <li>
              <strong>Verification Data:</strong> OTPs, phone verification status,
              and authentication tokens.
            </li>
            <li>
              <strong>Usage Information:</strong> app interactions, device
              information, IP address, and log data.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <p>Your information is used to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and maintain Pax26 services</li>
            <li>Verify your identity and secure your account</li>
            <li>Process transactions and service requests</li>
            <li>Send important notifications and updates</li>
            <li>Improve app performance and user experience</li>
          </ul>

          <h2 className="text-xl font-semibold">3. Sharing of Information</h2>
          <p>
            We do not sell or rent your personal data. We may only share your
            information with:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Trusted service providers (e.g. payment or messaging services)</li>
            <li>Legal authorities when required by law</li>
            <li>Security or fraud prevention partners</li>
          </ul>

          <h2 className="text-xl font-semibold">4. Data Security</h2>
          <p>
            We use industry-standard security measures such as encryption,
            authentication, and access control to protect your data. However, no
            system is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-xl font-semibold">5. Data Retention</h2>
          <p>
            We retain your information only for as long as necessary to fulfill
            the purposes outlined in this policy or as required by law.
          </p>

          <h2 className="text-xl font-semibold">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access and update your personal information</li>
            <li>Request deletion of your account</li>
            <li>Withdraw consent where applicable</li>
          </ul>

          <h2 className="text-xl font-semibold">7. Third-Party Services</h2>
          <p>
            Pax26 may contain links or integrations with third-party services.
            We are not responsible for the privacy practices of those services.
          </p>

          <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will
            be posted on this page with an updated revision date.
          </p>

          <h2 className="text-xl font-semibold">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or how we handle
            your data, please contact us at:
          </p>
          <p className="font-medium">
            📧 info@pax26.com
          </p>
        </section>
      </div>
    </main>
  );
}