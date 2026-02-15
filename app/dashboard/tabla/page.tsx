import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EntriesTable } from "@/components/entries-table"

export default async function TablaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">
        Historial de Registros
      </h1>
      <div className="rounded-lg border border-border bg-card">
        <EntriesTable userId={user.id} />
      </div>
    </div>
  )
}
