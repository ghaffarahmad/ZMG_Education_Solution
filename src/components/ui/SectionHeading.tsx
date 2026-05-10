import { cn } from "@/lib/utils";

interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  alignment?: "left" | "center" | "right";
}

export function SectionHeading({
  title,
  subtitle,
  alignment = "center",
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col sm:mb-12",
        {
          "items-start text-left": alignment === "left",
          "items-center text-center": alignment === "center",
          "items-end text-right": alignment === "right",
        },
        className
      )}
      {...props}
    >
      <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 sm:mb-4 md:text-4xl dark:text-white">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
          {subtitle}
        </p>
      )}
      <div className={cn("mt-4 h-1 w-16 rounded-full bg-accent sm:mt-6 sm:w-20", {
        "ml-auto": alignment === "right",
        "mx-auto": alignment === "center",
        "mr-auto": alignment === "left",
      })} />
    </div>
  );
}
