import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DailyEntryForm } from "@/components/daily-entry-form"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">
        Registro Diario
      </h1>
      <DailyEntryForm userId={user.id} />
    </div>
  )
}
