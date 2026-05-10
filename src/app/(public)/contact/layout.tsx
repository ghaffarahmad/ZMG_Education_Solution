import { createSeoMetadata, pageSeo } from "@/lib/seo";

export const metadata = createSeoMetadata(pageSeo.contact);

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
