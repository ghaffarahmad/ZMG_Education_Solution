import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/public/FloatingActions";
import { NoticeTicker } from "@/components/public/NoticeTicker";
import {
  jsonLdScriptProps,
  localBusinessJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScriptProps(localBusinessJsonLd)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScriptProps(organizationJsonLd)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScriptProps(websiteJsonLd)}
      />
      <FloatingActions />
      <Navbar />
      <NoticeTicker />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
