import { Container } from "@/components/ui/Container";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "May 2026";

  return (
    <div className="min-h-screen bg-[#F7F7F4] text-slate-900 dark:bg-[#092128] dark:text-white py-12 lg:py-20">
      <Container className="max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tight text-primary dark:text-white sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#0C2A33] sm:p-12">
          <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-black prose-headings:text-primary dark:prose-headings:text-white prose-a:text-accent hover:prose-a:text-primary">
            <p className="lead text-lg font-medium text-slate-600 dark:text-slate-300">
              At Z.M.G Education Solution, we take your privacy and the security of your educational records very seriously. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our website and Student Document Portal.
            </p>

            <hr className="my-8 border-slate-200 dark:border-white/10" />

            <div className="mb-8 grid gap-6 sm:grid-cols-2">
              <div className="flex gap-4 rounded-2xl bg-slate-50 p-5 dark:bg-white/5">
                <ShieldCheck className="h-6 w-6 shrink-0 text-accent" />
                <div>
                  <h3 className="mt-0 text-base font-bold">Secure Verification</h3>
                  <p className="mb-0 mt-2 text-sm text-slate-600 dark:text-slate-400">Your CNIC and Date of Birth are used strictly for encrypted verification.</p>
                </div>
              </div>
              <div className="flex gap-4 rounded-2xl bg-slate-50 p-5 dark:bg-white/5">
                <Lock className="h-6 w-6 shrink-0 text-accent" />
                <div>
                  <h3 className="mt-0 text-base font-bold">No Data Sharing</h3>
                  <p className="mb-0 mt-2 text-sm text-slate-600 dark:text-slate-400">We do not sell, rent, or share your personal data with third parties.</p>
                </div>
              </div>
            </div>

            <h2>1. Information We Collect</h2>
            <p>We collect information that you voluntarily provide to us when using our services:</p>
            <ul>
              <li><strong>Verification Data:</strong> CNIC or B-Form numbers, and Date of Birth when accessing the Student Document Portal.</li>
              <li><strong>Contact Information:</strong> Your name, phone number, and support inquiry details when you fill out our contact or support forms.</li>
              <li><strong>Educational Records:</strong> We securely manage fee submission statuses, enrollment cards, and admit cards strictly for providing them to the verified student.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We strictly use the collected information for the following educational and support purposes:</p>
            <ul>
              <li>To securely verify your identity before granting access to official board documents (Karachi Board, Ziauddin Board, AIOU).</li>
              <li>To provide customer support, admission guidance, and respond to your inquiries.</li>
              <li>To notify you of important updates regarding fee verifications or document availability.</li>
            </ul>

            <h2>3. Data Security and Protection</h2>
            <p>
              Security is our highest priority. All data transmitted through the Student Document Portal is encrypted using industry-standard protocols. We restrict access to student records to authorized personnel only. Your CNIC and Date of Birth are never exposed publicly and are solely used as authentication tokens to retrieve your specific documents.
            </p>

            <h2>4. Third-Party Services</h2>
            <p>
              We do not share your personal educational records with third parties for marketing or advertising purposes. We only interact with official educational boards (such as the Board of Secondary Education Karachi, Ziauddin Board, and Allama Iqbal Open University) on your behalf as part of the admission and document support services you explicitly request.
            </p>

            <h2>5. Contact Us</h2>
            <p>If you have any questions or concerns about our Privacy Policy or how your data is handled, please contact our office:</p>
            <ul>
              <li><strong>Address:</strong> Shop #06 Near Sevri Baba Mazaar, Ahmed Market, Karachi.</li>
              <li><strong>WhatsApp/Phone:</strong> +92 314 3061669</li>
              <li><strong>Email:</strong> info@zmgeducation.com</li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}
