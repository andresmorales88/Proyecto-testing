import { EntriesTable } from "@/components/entries-table"

export default function TablaPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">
        Historial de Registros
      </h1>
      <div className="rounded-lg border border-border bg-card">
        <EntriesTable />
      </div>
    </div>
  )
}
