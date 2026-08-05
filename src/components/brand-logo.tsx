import Link from "next/link";
import { Sun02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  link = true,
}: {
  className?: string;
  link?: boolean;
}) {
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-bold tracking-tight",
        className,
      )}
    >
      <span className="grid size-8 place-items-center rounded-lg  text-primary-foreground">
        <HugeiconsIcon icon={Sun02Icon} size={19} strokeWidth={2.25} />
      </span>
      <span>Ascend</span>
    </span>
  );
  return link ? (
    <Link href="/" aria-label="Ascend home">
      {content}
    </Link>
  ) : (
    content
  );
}
