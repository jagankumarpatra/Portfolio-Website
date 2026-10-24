import { ArrowRight } from "lucide-react";

const steps = [
  { number: "01", title: "Start analysis", detail: "Client submits a recording link" },
  { number: "02", title: "Validate input", detail: "HTTPS only · duration up to 2 hours" },
  { number: "03", title: "Run analysis", detail: "AI call-analysis workflow" },
  { number: "04", title: "Return results", detail: "Status/details endpoints or webhook" },
];

export default function RequestFlow() {
  return (
    <ol aria-label="AI Call Analysis request flow" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.number} className="request-step min-h-32">
          <p className="font-mono text-xs font-medium text-accent">{step.number}</p>
          <h3 className="mt-3 text-sm font-semibold text-fg">{step.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">{step.detail}</p>
          {index < steps.length - 1 && (
            <ArrowRight aria-hidden="true" className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-accent lg:block" />
          )}
        </li>
      ))}
    </ol>
  );
}
