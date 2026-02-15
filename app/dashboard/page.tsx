import { DailyEntryForm } from "@/components/daily-entry-form"

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">
        Registro Diario
      </h1>
      <DailyEntryForm />
    </div>
  )
}
