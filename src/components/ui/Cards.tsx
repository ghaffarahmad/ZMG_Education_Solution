import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

export function ServiceCard({ title, description, icon: Icon, className }: ServiceCardProps) {
  return (
    <div className={cn("group rounded-2xl bg-white p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-accent/50 transition-all duration-300 dark:bg-[#0c2a33] dark:border-white/10", className)}>
      <div className="h-14 w-14 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-accent transition-colors duration-300 mb-6 dark:bg-white/10 dark:text-accent">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors dark:text-white dark:group-hover:text-accent">
        {title}
      </h3>
      <p className="text-slate-600 leading-relaxed dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}

interface TrustCardProps {
  number: string;
  label: string;
  className?: string;
}

export function TrustCard({ number, label, className }: TrustCardProps) {
  return (
    <div className={cn("text-center p-6", className)}>
      <div className="mb-2 text-4xl font-extrabold text-[#D4AF37] dark:text-[#E5C354]">{number}</div>
      <div className="text-sm font-semibold uppercase tracking-wider text-[#CBD5E1]">{label}</div>
    </div>
  );
}

interface ProcessStepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  className?: string;
}

export function ProcessStepCard({ stepNumber, title, description, className }: ProcessStepCardProps) {
  return (
    <div className={cn("relative flex flex-col items-center text-center p-6 group", className)}>
      <div className="h-20 w-20 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-2xl font-bold text-primary mb-6 group-hover:scale-110 group-hover:border-accent transition-transform duration-300 relative z-10 dark:bg-[#0c2a33] dark:border-white/10 dark:text-accent">
        {stepNumber}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-3 dark:text-white">{title}</h3>
      <p className="text-slate-600 max-w-xs dark:text-slate-300">{description}</p>
    </div>
  );
}
