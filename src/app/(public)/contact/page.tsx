"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Container } from "@/components/ui/Container";

const inquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  programInterest: z.string().optional(),
  board: z.string().optional(),
  message: z.string().min(10, "Please provide more details in your message"),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

interface PublicSettings {
  phoneNumber?: string;
  whatsappNumber?: string;
  emailAddress?: string;
  officeAddress?: string;
  officeTiming?: string;
  googleMapEmbedUrl?: string;
}

interface PublicSettingsResponse {
  data?: PublicSettings;
}

const fallbackWhatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923143061669").replace(/[^0-9]/g, "");

export default function ContactPage() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      phone: "",
      programInterest: "",
      board: "",
      message: "",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/public");
        if (res.ok) {
          const data = (await res.json()) as PublicSettingsResponse;
          if (data.data) {
            setSettings(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch contact settings", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  const onSubmit = async (data: InquiryFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsSuccess(true);
        form.reset();
        toast.success("Inquiry sent successfully. We will contact you soon.");
      } else {
        toast.error("Failed to send inquiry. Please try again.");
      }
    } catch (error) {
      console.error("Failed to submit inquiry", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const phone = settings?.phoneNumber || settings?.whatsappNumber || "+92 314 3061669";
  const email = settings?.emailAddress || "info@zmgeducation.com";
  const address = settings?.officeAddress || "Shop #06 Near Sevri Baba Mazaar, Ahmed Market";
  const timing = settings?.officeTiming || "Monday to Saturday, 10:00 AM - 8:00 PM";
  const whatsappNumber = (settings?.whatsappNumber || fallbackWhatsappNumber).replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const mapUrl =
    settings?.googleMapEmbedUrl ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14479.805562095945!2d67.0645607!3d24.8654877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33ea3e459392b%3A0x6b2b64010885e347!2sKarachi%2C%20Karachi%20City%2C%20Sindh%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s";

  const contactCards = [
    { icon: MapPin, title: "Office Address", value: address, skeleton: "w-40" },
    { icon: Phone, title: "Phone & WhatsApp", value: phone, skeleton: "w-28" },
    { icon: Mail, title: "Email Address", value: email, skeleton: "w-44" },
    { icon: Clock, title: "Office Timings", value: timing, skeleton: "w-36" },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F7F4] text-slate-900 dark:bg-[#092128] dark:text-white">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0D3B46_0%,#103743_48%,#071B21_100%)] py-16 text-white sm:py-20 lg:py-24">
        <div className="premium-pattern absolute inset-0 opacity-55" aria-hidden="true" />
        <div className="absolute left-6 top-12 h-28 w-px rotate-12 bg-accent/40" aria-hidden="true" />
        <div className="absolute bottom-10 right-10 h-px w-44 -rotate-12 bg-accent/35" aria-hidden="true" />

        <Container className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)]">
            <div className="premium-fade-up max-w-4xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-accent">
                <ShieldCheck className="h-4 w-4" />
                Contact Support Desk
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">
                Contact Our Office
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
                Reach Z.M.G Education Solution for Admission Support, Board Support, Fee Verification, Enrollment Card Access, Admit Card Access, and Student Document Portal assistance.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-soft-glow inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-black text-primary shadow-lg shadow-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f0cf61]"
                >
                  Contact on WhatsApp
                  <MessageSquare className="ml-2 h-4 w-4" />
                </a>
                <a
                  href="#inquiry-form"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/80 hover:bg-white/15"
                >
                  Send Inquiry
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="premium-slide-in">
              <div className="premium-accent-sweep rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/25 backdrop-blur-md sm:p-6">
                <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Office Desk</p>
                    <h2 className="mt-2 text-2xl font-black text-white">Parent-friendly support</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Clear communication for students, parents, and document-related support.
                    </p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                    <UserCheck className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {["Admission Support", "Board Support", "Student Document Portal"].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <span className="text-sm font-bold text-white">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-6 premium-reveal">
              <div className="premium-card-line rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgb(13_59_70/0.08)] dark:border-white/10 dark:bg-[#0C2A33] sm:p-6">
                <h2 className="text-2xl font-black text-primary dark:text-white">Contact Details</h2>
                <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                  Use these details for direct office communication and document-related support.
                </p>

                <div className="mt-6 grid gap-4">
                  {contactCards.map((card) => {
                    const Icon = card.icon;

                    return (
                      <div key={card.title} className="premium-reveal group flex gap-4 rounded-2xl border border-slate-200 bg-[#F7F7F4] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent/70 hover:shadow-md dark:border-white/10 dark:bg-[#092128]">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:bg-accent/20 group-hover:text-accent dark:bg-accent/15 dark:text-accent">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-950 dark:text-white">{card.title}</h3>
                          <p className="mt-1 leading-6 text-slate-600 dark:text-slate-300">
                            {isLoadingSettings ? (
                              <span className={`inline-block h-4 ${card.skeleton} rounded skeleton-surface skeleton-shimmer`} />
                            ) : (
                              card.value
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#25D366] px-4 text-sm font-black text-white shadow-lg shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#20bd5a] hover:shadow-green-500/30"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Chat on WhatsApp
                </a>
              </div>

            </div>

            <div id="inquiry-form" className="premium-card-line premium-reveal h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_22px_80px_rgb(13_59_70/0.1)] dark:border-white/10 dark:bg-[#0C2A33] sm:p-6 lg:p-8">
              <div className="mb-7">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-accent">Inquiry Form</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-primary dark:text-white">Send an Inquiry</h2>
                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                  Share your details and our office team will contact you for the next step.
                </p>
              </div>

              {isSuccess ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-400/30 dark:bg-green-500/10">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-500/15">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-300" />
                  </div>
                  <h3 className="mb-2 text-xl font-black text-green-900 dark:text-green-100">Inquiry Sent Successfully</h3>
                  <p className="mb-6 leading-7 text-green-700 dark:text-green-200">
                    Thank you for reaching out. We have received your message and will contact you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-green-300 bg-white px-4 text-sm font-black text-green-700 transition-all hover:bg-green-100 dark:border-green-400/30 dark:bg-white/10 dark:text-green-100 dark:hover:bg-white/15"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 dark:text-slate-200">Full Name *</label>
                      <input
                        {...form.register("name")}
                        className="min-h-12 w-full rounded-xl border border-slate-200 bg-[#F7F7F4] px-4 text-slate-900 transition-all focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 dark:border-white/10 dark:bg-[#092128] dark:text-white dark:focus:bg-white/10"
                        placeholder="e.g. Ali Ahmed"
                      />
                      {form.formState.errors.name && (
                        <p className="text-xs font-bold text-red-500">{form.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 dark:text-slate-200">Phone Number *</label>
                      <input
                        {...form.register("phone")}
                        className="min-h-12 w-full rounded-xl border border-slate-200 bg-[#F7F7F4] px-4 text-slate-900 transition-all focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 dark:border-white/10 dark:bg-[#092128] dark:text-white dark:focus:bg-white/10"
                        placeholder="e.g. 0300 1234567"
                      />
                      {form.formState.errors.phone && (
                        <p className="text-xs font-bold text-red-500">{form.formState.errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 dark:text-slate-200">Support Area</label>
                      <select
                        {...form.register("board")}
                        className="min-h-12 w-full rounded-xl border border-slate-200 bg-[#F7F7F4] px-4 text-slate-900 transition-all focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 dark:border-white/10 dark:bg-[#092128] dark:text-white dark:focus:bg-white/10"
                      >
                        <option value="">Select Support Area</option>
                        <option value="Karachi Board Support">Karachi Board Support</option>
                        <option value="Ziauddin Board Support">Ziauddin Board Support</option>
                        <option value="AIOU University Program Support">AIOU University Program Support</option>
                        <option value="Student Document Portal">Student Document Portal</option>
                        <option value="Fee Verification">Fee Verification</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 dark:text-slate-200">Program / Group</label>
                      <input
                        {...form.register("programInterest")}
                        className="min-h-12 w-full rounded-xl border border-slate-200 bg-[#F7F7F4] px-4 text-slate-900 transition-all focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 dark:border-white/10 dark:bg-[#092128] dark:text-white dark:focus:bg-white/10"
                        placeholder="e.g. Pre-Medical, ADC, BS, BBA"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-200">Message *</label>
                    <textarea
                      {...form.register("message")}
                      rows={5}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-[#F7F7F4] px-4 py-3 text-slate-900 transition-all focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25 dark:border-white/10 dark:bg-[#092128] dark:text-white dark:focus:bg-white/10"
                      placeholder="How can we help you?"
                    />
                    {form.formState.errors.message && (
                      <p className="text-xs font-bold text-red-500">{form.formState.errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="premium-soft-glow inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#124C5A] disabled:pointer-events-none disabled:opacity-60 dark:bg-accent dark:text-primary dark:hover:bg-[#f0cf61]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Inquiry
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-8 premium-card-line premium-reveal overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_70px_rgb(13_59_70/0.08)] dark:border-white/10 dark:bg-[#0C2A33]">
            {isLoadingSettings ? (
              <div className="h-[400px] w-full rounded-xl skeleton-surface skeleton-shimmer" />
            ) : (
              <iframe
                src={mapUrl}
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: "0.75rem" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              />
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
