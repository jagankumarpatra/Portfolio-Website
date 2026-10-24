import Link from "next/link";
import { getSite } from "@/lib/content";

export default function NotFound() {
  const site = getSite();
  return (
    <div className="space-y-6 py-12 text-center">
      <h1 className="text-3xl font-bold">{site.notFoundTitle}</h1>
      <div className="flex justify-center gap-3">
        <Link href="/" className="rounded-lg bg-brand px-5 py-3 text-sm font-medium text-white">Home</Link>
        <Link href="/work" className="rounded-lg border border-line bg-card px-5 py-3 text-sm font-medium">Work</Link>
      </div>
    </div>
  );
}
