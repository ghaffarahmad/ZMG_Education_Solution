import { cn } from "@/lib/utils";

type DecorativeDividerProps = {
  className?: string;
};

export function DecorativeDivider({ className }: DecorativeDividerProps) {
  return (
    <span className={cn("premium-animated-underline", className)} aria-hidden="true" />
  );
}
