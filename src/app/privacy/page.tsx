import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Privacy Policy | Cloud AIF Shivamogga",
  description: "Read our Privacy Policy to understand how we collect, store, and secure your personal data under the DPDP Act 2023.",
};

export default async function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <SiteHeader />
      
      <main className="flex-1 py-12 px-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 md:p-12 shadow-sm border" style={{ borderColor: "var(--line)" }}>
          <h1 className="font-display text-[32px] font-bold mb-2" style={{ color: "var(--forest)" }}>Privacy Policy</h1>
          <p className="text-[13px] mb-8" style={{ color: "var(--slate)" }}>Last Updated: June 27, 2026</p>

          <section className="space-y-6 text-[15px] leading-relaxed" style={{ color: "var(--ink)" }}>
            <p>
              Welcome to <strong>Cloud AIF</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We operate a local services marketplace matching customers with service providers in Shivamogga, Karnataka. 
              We are committed to protecting your personal data and respecting your privacy in accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023 (India)</strong> and other applicable laws.
            </p>

            <h2 className="text-[20px] font-semibold pt-4" style={{ color: "var(--forest)" }}>1. Consent and Right to Withdraw Consent</h2>
            <p>
              By accessing our platform and creating a Customer or Provider account, you explicitly consent to the collection, processing, and storage of your personal data as outlined in this policy. 
              You have the right to withdraw your consent at any time by contacting our Grievance Officer. Please note that withdrawing consent may result in the termination of services available to you on the platform.
            </p>

            <h2 className="text-[20px] font-semibold pt-4" style={{ color: "var(--forest)" }}>2. Information We Collect</h2>
            <p>
              We collect information necessary to connect customers with local service providers securely:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Personal Identity Details:</strong> Full Name, profile pictures, and email addresses.</li>
              <li><strong>Contact Information:</strong> Phone numbers and alternate contact details.</li>
              <li><strong>Service Address:</strong> Location metadata, service areas, coordinates (latitude/longitude), and postal addresses to dispatch providers.</li>
              <li><strong>KYC Documents (Providers only):</strong> Government-issued identity proofs, address proofs, certifications, and banking details for payout verification.</li>
            </ul>

            <h2 className="text-[20px] font-semibold pt-4" style={{ color: "var(--forest)" }}>3. How We Secure Your Data</h2>
            <p>
              Security of personal data is a top priority:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>KYC Proof Isolation:</strong> All provider identity and address proofs are isolated in secure, non-public directories on the server. Access is strictly limited to authorized platform administrators via secure authentication logs.</li>
              <li><strong>Contact Privacy:</strong> Customer phone numbers and addresses are hidden from service providers until they officially accept a matching job assignment on their dashboard.</li>
            </ul>

            <h2 className="text-[20px] font-semibold pt-4" style={{ color: "var(--forest)" }}>4. Data Retention and Erasure</h2>
            <p>
              Under the DPDP Act, you have the <strong>Right to Correction and Erasure</strong>. We retain your personal data only as long as necessary to fulfill the purposes of connecting you with services or for auditing purposes. You may request account deletion at any time. Upon deletion, your personal data will be erased within 30 days, unless legally required to be retained.
            </p>

            <h2 className="text-[20px] font-semibold pt-4" style={{ color: "var(--forest)" }}>5. Contact Our Grievance Officer</h2>
            <p>
              If you have any questions, concerns, or wish to exercise your rights under the DPDP Act, you can reach out to our designated Grievance Officer:
            </p>
            <div className="rounded-xl p-4 bg-stone-100 border text-[14px] font-mono space-y-1">
              <div><strong>Name:</strong> Shivamogga Operations Grievance Desk</div>
              <div><strong>Email:</strong> compliance@cloudaif.in</div>
              <div><strong>Location:</strong> Shivamogga, Karnataka, India</div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
