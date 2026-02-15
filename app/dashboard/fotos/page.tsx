import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PhotoGallery } from "@/components/photo-gallery"

export default async function FotosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">
        Galeria de Progreso
      </h1>
      <PhotoGallery userId={user.id} />
    </div>
  )
}
