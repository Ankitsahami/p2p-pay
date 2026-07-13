import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string
  innerClassName?: string
}

export function Logo({ className, innerClassName }: LogoProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full border-2 border-white/60",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full border border-white/60",
          innerClassName
        )}
      />
    </div>
  );
}
