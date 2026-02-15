import { FitnessCharts } from "@/components/fitness-charts"

export default function GraficosPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">
        Evolucion Fitness
      </h1>
      <FitnessCharts />
    </div>
  )
}
