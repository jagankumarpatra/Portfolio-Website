import type { Metadata } from "next";
import Link from "next/link";
import { getSkills } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Skills",
  description: "Backend engineering skills linked to the work where they were used.",
  alternates: { canonical: "/skills" },
  openGraph: { title: "Engineering Skills", description: "Backend skills linked to evidence of use.", type: "website" },
};

export default function SkillsPage() {
  const skills = getSkills();
  const categories = [...new Set(skills.map((skill) => skill.category))];
  return (
    <div className="editorial-page space-y-10">
      <header className="space-y-3">
        <p className="eyebrow">Skills</p>
        <h1 className="text-4xl font-semibold tracking-tight text-fg">What I work with</h1>
        <p className="text-muted">Each skill links to evidence showing where it was used.</p>
      </header>
      {categories.map((category) => (
        <section key={category} className="space-y-4" aria-labelledby={`category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
          <h2 id={`category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="text-xl font-semibold text-fg">{category}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skills.filter((skill) => skill.category === category).map((skill) => (
              <li key={skill.id} id={skill.id} className="scroll-mt-24 rounded-lg border border-line bg-card p-5">
                <h3 className="font-semibold text-fg">{skill.name}</h3>
                <p className="eyebrow mt-3">Used in</p>
                <ul className="mt-2 space-y-1">
                  {skill.usedIn.map((item) => (
                    <li key={item.href}><Link href={item.href} className="text-sm text-accent underline-offset-4 hover:underline">{item.label}</Link></li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
