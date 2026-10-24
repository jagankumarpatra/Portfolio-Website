"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export default function TrackOnMount({ event, props }: { event: string; props?: Record<string, string> }) {
  const key = JSON.stringify(props ?? {});
  useEffect(() => {
    trackEvent(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, key]);
  return null;
}
