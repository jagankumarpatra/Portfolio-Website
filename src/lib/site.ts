import { getSite } from "./content";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export function buildMailto() {
  const site = getSite();
  const body = site.mailtoBody.replaceAll("[site]", SITE_URL);
  const crlf = body.replace(/\r?\n/g, "\r\n");
  const href = `mailto:${site.email}?subject=${encodeURIComponent(site.mailtoSubject)}&body=${encodeURIComponent(crlf)}`;
  return { href, subject: site.mailtoSubject, body, email: site.email };
}
