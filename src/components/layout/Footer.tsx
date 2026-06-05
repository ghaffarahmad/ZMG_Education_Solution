"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { Container } from "@/components/ui/Container";

interface PublicSettings {
  websiteName?: string;
  footerDescription?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  emailAddress?: string;
  officeAddress?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
}

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s-.002 3.254-.42 4.814a2.504 2.504 0 01-1.768 1.768c-1.56.419-7.812.419-7.812.419s-6.252 0-7.812-.419a2.505 2.505 0 01-1.768-1.768C2 15.254 2 12 2 12s.002-3.254.42-4.814a2.507 2.507 0 011.768-1.768C5.748 5 12 5 12 5s6.252 0 7.812.418zM10 15.464L15.5 12 10 8.536v6.928z" clipRule="evenodd" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
);

export function Footer() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/public");
        if (res.ok) {
          const data = await res.json() as { data?: PublicSettings };
          if (data.data) {
            setSettings(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings for Footer", error);
      }
    };
    fetchSettings();
  }, []);

  const currentYear = new Date().getFullYear();

  const brandName = settings?.websiteName || "Z.M.G Education Solution";
  const footerDesc = settings?.footerDescription || "Providing comprehensive admission support, board services, and a secure student document portal for Karachi Board, Ziauddin Board, and AIOU students.";
  const phone = "+92 314 3061669";
  const email = settings?.emailAddress || "info@zmgeducation.com";
  const address = settings?.officeAddress || "Shop #06 Near Sevri Baba Mazaar, Ahmed Market";

  const socialLinks = [
    { icon: FacebookIcon, href: settings?.facebookUrl, label: "Facebook" },
    { icon: InstagramIcon, href: settings?.instagramUrl, label: "Instagram" },
    { icon: YoutubeIcon, href: settings?.youtubeUrl, label: "YouTube" },
    { icon: LinkedinIcon, href: settings?.linkedinUrl, label: "LinkedIn" },
  ].filter(link => link.href);

  return (
    <footer className="bg-primary pb-24 pt-10 text-white sm:pb-8 sm:pt-16">
      <Container>
        <div className="mb-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="col-span-2 space-y-4 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/darklogo1.png"
                alt={`${brandName} logo`}
                width={52}
                height={52}
              className="h-auto w-10 shrink-0 object-contain sm:w-12"
            />
              <span className="text-base font-bold text-white sm:text-lg">
                Z.M.G Education Solution
              </span>
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed">
              {footerDesc}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex space-x-4 pt-1 sm:pt-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-accent transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-span-1">
            <h4 className="mb-4 text-base font-semibold text-white sm:mb-6 sm:text-lg">Quick Links</h4>
            <ul className="space-y-2.5 sm:space-y-3">
              <li><Link href="/" className="text-slate-300 hover:text-accent transition-colors text-sm">Home</Link></li>
              <li><Link href="/about" className="text-slate-300 hover:text-accent transition-colors text-sm">About Us</Link></li>
              <li><Link href="/student-portal" className="text-slate-300 hover:text-accent transition-colors text-sm">Student Portal</Link></li>
              <li><Link href="/notices" className="text-slate-300 hover:text-accent transition-colors text-sm">Notices</Link></li>
              <li><Link href="/contact" className="text-slate-300 hover:text-accent transition-colors text-sm">Contact Office</Link></li>
              <li><Link href="/admin/login" className="text-slate-300 hover:text-accent transition-colors text-sm">Admin Login</Link></li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="col-span-1">
            <h4 className="mb-4 text-base font-semibold text-white sm:mb-6 sm:text-lg">Our Support</h4>
            <ul className="space-y-2.5 sm:space-y-3">
              <li><Link href="/services#karachi-board" className="text-slate-300 hover:text-accent transition-colors text-sm">Karachi Board Support</Link></li>
              <li><Link href="/services#ziauddin-board" className="text-slate-300 hover:text-accent transition-colors text-sm">Ziauddin Board Support</Link></li>
              <li><Link href="/services#aiou" className="text-slate-300 hover:text-accent transition-colors text-sm">AIOU Programs</Link></li>
              <li><Link href="/admission-support" className="text-slate-300 hover:text-accent transition-colors text-sm">Admission Assistance</Link></li>
              <li><Link href="/student-portal" className="text-slate-300 hover:text-accent transition-colors text-sm">Document Access</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="mb-4 text-base font-semibold text-white sm:mb-6 sm:text-lg">Contact Us</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-slate-300 text-sm leading-relaxed">{address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-slate-300 text-sm">{phone}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-slate-300 text-sm">{email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 border-t border-slate-700/50 pt-6 md:flex-row md:justify-between md:gap-0">
          <div className="order-3 px-12 text-center md:order-1 md:w-1/3 md:px-0 md:text-left">
            <p className="text-slate-400 text-sm">
              &copy; {currentYear} {brandName}.<br className="block sm:hidden" /> All rights reserved.
            </p>
          </div>
          
          <div className="order-1 flex justify-center md:order-2 md:w-1/3">
            <a
              href="https://samidev.pk/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <div className="premium-border-spin inline-flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-300 transition-transform duration-300 hover:scale-105">
                <span className="relative z-10 flex items-center gap-1.5 tracking-wide">
                  Built by <span className="premium-text-shimmer font-bold drop-shadow-sm">Sami Web Systems</span>
                </span>
                <span className="relative z-10 flex items-center justify-center text-accent">
                  <Globe className="h-3 w-3 animate-pulse" />
                </span>
              </div>
            </a>
          </div>
          
          <div className="order-2 flex space-x-4 text-sm text-slate-400 md:order-3 md:w-1/3 md:justify-end">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
