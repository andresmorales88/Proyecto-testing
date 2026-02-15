import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FitnessCharts } from "@/components/fitness-charts"

export default async function GraficosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">
        Evolucion Fitness
      </h1>
      <FitnessCharts userId={user.id} />
    </div>
  )
}
