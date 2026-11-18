import { notFound } from "next/navigation";

// Public estimator hidden per review, portal copies live at
// /dashboard/calculator and /lab/calculator (same SeqCalculator component).
export default function SeqCalculatorPage() {
  notFound();
}
