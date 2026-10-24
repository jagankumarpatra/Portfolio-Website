"use client";

import { trackEvent } from "@/lib/analytics";

type Props = {
  href: string;
  event: string;
  className?: string;
  download?: boolean;
  children: React.ReactNode;
};

export default function TrackedLink({ href, event, className, download, children }: Props) {
  return (
    <a href={href} download={download} className={className} onClick={() => trackEvent(event)}>
      {children}
    </a>
  );
}
