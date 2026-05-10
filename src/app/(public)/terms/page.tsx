import { Container } from "@/components/ui/Container";
import { FileText, AlertTriangle, Scale } from "lucide-react";

export default function TermsOfServicePage() {
  const lastUpdated = "May 2026";

  return (
    <div className="min-h-screen bg-[#F7F7F4] text-slate-900 dark:bg-[#092128] dark:text-white py-12 lg:py-20">
      <Container className="max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tight text-primary dark:text-white sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#0C2A33] sm:p-12">
          <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-black prose-headings:text-primary dark:prose-headings:text-white prose-a:text-accent hover:prose-a:text-primary">
            <p className="lead text-lg font-medium text-slate-600 dark:text-slate-300">
              Welcome to Z.M.G Education Solution. By accessing or using our website, Student Document Portal, and admission support services, you agree to comply with and be bound by the following Terms of Service.
            </p>

            <hr className="my-8 border-slate-200 dark:border-white/10" />

            <div className="mb-8 grid gap-6 sm:grid-cols-2">
              <div className="flex gap-4 rounded-2xl bg-slate-50 p-5 dark:bg-white/5">
                <Scale className="h-6 w-6 shrink-0 text-accent" />
                <div>
                  <h3 className="mt-0 text-base font-bold">Agreement to Terms</h3>
                  <p className="mb-0 mt-2 text-sm text-slate-600 dark:text-slate-400">By using our services, you agree to these terms.</p>
                </div>
              </div>
              <div className="flex gap-4 rounded-2xl bg-slate-50 p-5 dark:bg-white/5">
                <AlertTriangle className="h-6 w-6 shrink-0 text-accent" />
                <div>
                  <h3 className="mt-0 text-base font-bold">Authorized Use</h3>
                  <p className="mb-0 mt-2 text-sm text-slate-600 dark:text-slate-400">The portal must only be used to access your own records.</p>
                </div>
              </div>
            </div>

            <h2>1. Use of the Student Portal</h2>
            <p>
              The Z.M.G Student Document Portal is provided solely for the convenience of students and their authorized guardians to access official educational documents, such as Enrollment Cards, Admit Cards, and Fee Verification statuses.
            </p>
            <ul>
              <li>You agree to provide accurate, truthful, and complete information (including your correct CNIC/B-Form and Date of Birth) when using the portal.</li>
              <li>You are strictly prohibited from attempting to access, download, or view the educational records of any other student.</li>
              <li>Unauthorized access, data scraping, or attempting to breach the security of the portal is strictly forbidden and may result in legal action.</li>
            </ul>

            <h2>2. Nature of Services</h2>
            <p>
              Z.M.G Education Solution operates as a support and guidance center for students enrolled in or seeking admission to the Karachi Board, Ziauddin Board, and Allama Iqbal Open University (AIOU).
            </p>
            <ul>
              <li>We assist with admission processing, form submission, and document retrieval.</li>
              <li>The final authority regarding board policies, exam schedules, enrollment issuance, and admit card distribution rests entirely with the respective educational boards.</li>
              <li>We are not responsible for delays, rejections, or errors caused by the official boards themselves.</li>
            </ul>

            <h2>3. Document Availability</h2>
            <p>
              Documents are uploaded to the Student Document Portal as soon as they are processed and made available by our office in coordination with the respective boards. While we strive to ensure 24/7 availability of the portal, we do not guarantee uninterrupted access and are not liable for temporary downtime due to maintenance or technical issues.
            </p>

            <h2>4. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Z.M.G Education Solution shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services or the Student Document Portal. Our responsibility is limited to providing the best possible support and ensuring the secure delivery of documents provided to us.
            </p>

            <h2>5. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Any changes will be effective immediately upon posting on this page. Your continued use of the website and services constitutes your acceptance of the revised terms.
            </p>

            <h2>6. Contact Information</h2>
            <p>If you have any questions or require clarification regarding these terms, please reach out to us:</p>
            <ul>
              <li><strong>Office:</strong> Shop #06 Near Sevri Baba Mazaar, Ahmed Market, Karachi.</li>
              <li><strong>Contact:</strong> +92 314 3061669</li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}
