import { PhotoGallery } from "@/components/photo-gallery"

export default function FotosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">
        Galeria de Progreso
      </h1>
      <PhotoGallery />
    </div>
  )
}
