import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Terms of Service | Cloud AIF Shivamogga",
  description: "Read our Terms of Service to understand platform rules, intermediary liability, and payment structures.",
};

export default async function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <SiteHeader />
      
      <main className="flex-1 py-12 px-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 md:p-12 shadow-sm border" style={{ borderColor: "var(--line)" }}>
          <h1 className="font-display text-[32px] font-bold mb-2" style={{ color: "var(--forest)" }}>Terms of Service</h1>
          <p className="text-[13px] mb-8" style={{ color: "var(--slate)" }}>Last Updated: June 27, 2026</p>

          <section className="space-y-6 text-[15px] leading-relaxed" style={{ color: "var(--ink)" }}>
            <p>
              Welcome to <strong>Cloud AIF</strong>. By registering an account, submitting a service request, or registering as a service provider on our platform, you agree to be bound by these Terms of Service.
            </p>

            <h2 className="text-[20px] font-semibold pt-4" style={{ color: "var(--forest)" }}>1. Scope of Services</h2>
            <p>
              Cloud AIF acts as an <strong>intermediary marketplace technology platform</strong>. We connect customers who need local home services (e.g. electrical work, repairs, plumbing) with independent service providers in Shivamogga. 
              We do not directly employ service providers, nor do we perform the actual services ourselves.
            </p>

            <h2 className="text-[20px] font-semibold pt-4" style={{ color: "var(--forest)" }}>2. Verification Intermediary Role</h2>
            <p>
              We run background check verification steps (collecting ID and Address proofs) for providers during onboarding. 
              While we make commercial efforts to verify documents, <strong>verification does not constitute an endorsement, guarantee, or warranty</strong> of a provider&apos;s competency, skill, or safety. Users are advised to exercise standard caution when inviting service providers into their premises.
            </p>

            <h2 className="text-[20px] font-semibold pt-4" style={{ color: "var(--forest)" }}>3. Code of Conduct</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Zero Tolerance for Abuse:</strong> Any form of harassment, discrimination, or abusive behavior between customers and providers will result in immediate account suspension.</li>
              <li><strong>No-Shows and Cancellations:</strong> Providers who accept assignments but fail to show up without 24 hours prior notice will be issued conduct strikes. Customers with excessive fake bookings will have their accounts banned.</li>
            </ul>

            <h2 className="text-[20px] font-semibold pt-4" style={{ color: "var(--forest)" }}>4. Offline Payments and Financial Disclaimers</h2>
            <p>
              Payments for services are settled directly between the customer and the provider (via cash, local UPI, or bank transfer). 
              Cloud AIF does not handle financial transactions in the current version. We are not responsible for pricing disputes, non-payment, or unsatisfactory quality of work. All service pricing must be negotiated between parties directly.
            </p>

            <h2 className="text-[20px] font-semibold pt-4" style={{ color: "var(--forest)" }}>5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable laws in India, Cloud AIF, its officers, and directors will not be liable for any direct, indirect, incidental, or consequential damages resulting from service quality issues, property damage, bodily injury, or delays in matching requests.
            </p>

            <h2 className="text-[20px] font-semibold pt-4" style={{ color: "var(--forest)" }}>6. Governing Law and Jurisdiction</h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the local courts in <strong>Shivamogga, Karnataka, India</strong>.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
