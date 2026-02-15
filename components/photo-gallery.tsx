"use client"

import React from "react"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Camera, Trash2, Upload, X } from "lucide-react"

interface Photo {
  id: string
  photo_url: string
  photo_date: string
  category: string
  notes: string | null
  created_at: string
}

const categories = [
  { value: "progress", label: "Progreso" },
  { value: "front", label: "Frontal" },
  { value: "side", label: "Lateral" },
  { value: "back", label: "Espalda" },
  { value: "garmin", label: "Screenshot Garmin" },
  { value: "eufy", label: "Screenshot Eufy" },
  { value: "other", label: "Otro" },
]

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [uploadDate, setUploadDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [uploadCategory, setUploadCategory] = useState("progress")
  const [uploadNotes, setUploadNotes] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadPhotos = async () => {
    const supabase = createClient()
    let query = supabase
      .from("progress_photos")
      .select("*")
      .order("photo_date", { ascending: false })

    if (filterCategory !== "all") {
      query = query.eq("category", filterCategory)
    }

    const { data, error } = await query.limit(100)
    if (error) {
      console.log("[v0] Error loading photos:", error.message)
      toast.error("Error cargando fotos: " + error.message)
    }
    if (data) setPhotos(data)
    setLoading(false)
  }

  useEffect(() => {
    loadPhotos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory])

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    setPendingFiles(fileArray)

    // Generate previews
    const newPreviews = fileArray.map((file) => URL.createObjectURL(file))
    setPreviews(newPreviews)
  }

  const removePendingFile = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (pendingFiles.length === 0) {
      toast.error("Selecciona al menos una foto")
      return
    }

    setUploading(true)
    const supabase = createClient()

    let successCount = 0

    for (const file of pendingFiles) {
      const fileExt = file.name.split(".").pop()
      const filePath = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("progress-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        toast.error("Error subiendo foto: " + uploadError.message)
        continue
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("progress-photos").getPublicUrl(filePath)

      const { error: dbError } = await supabase
        .from("progress_photos")
        .insert({
          photo_url: publicUrl,
          photo_date: uploadDate,
          category: uploadCategory,
          notes: uploadNotes || null,
        })

      if (dbError) {
        toast.error("Error guardando registro: " + dbError.message)
      } else {
        successCount++
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} foto${successCount > 1 ? "s" : ""} subida${successCount > 1 ? "s" : ""} correctamente`)
    }

    setUploading(false)
    setDialogOpen(false)
    setUploadNotes("")
    setPendingFiles([])
    previews.forEach((url) => URL.revokeObjectURL(url))
    setPreviews([])
    loadPhotos()

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setPendingFiles([])
      previews.forEach((url) => URL.revokeObjectURL(url))
      setPreviews([])
      setUploadNotes("")
    }
    setDialogOpen(open)
  }

  const handleDelete = async (photo: Photo) => {
    const supabase = createClient()

    // Extract file path from URL
    const urlParts = photo.photo_url.split("/progress-photos/")
    if (urlParts[1]) {
      await supabase.storage
        .from("progress-photos")
        .remove([decodeURIComponent(urlParts[1])])
    }

    const { error } = await supabase
      .from("progress_photos")
      .delete()
      .eq("id", photo.id)

    if (error) {
      toast.error("Error al eliminar")
    } else {
      toast.success("Foto eliminada")
      setSelectedPhoto(null)
      loadPhotos()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Cargando fotos...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Camera className="h-4 w-4" />
              Subir Foto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">
                Subir Foto de Progreso
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="grid gap-1.5">
                <Label className="text-sm text-muted-foreground">Fecha</Label>
                <Input
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="bg-secondary text-foreground"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-sm text-muted-foreground">
                  Categoria
                </Label>
                <Select
                  value={uploadCategory}
                  onValueChange={setUploadCategory}
                >
                  <SelectTrigger className="bg-secondary text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-sm text-muted-foreground">
                  Notas (opcional)
                </Label>
                <Input
                  type="text"
                  placeholder="Semana 4, post entreno..."
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  className="bg-secondary text-foreground"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-sm text-muted-foreground">
                  Seleccionar fotos
                </Label>
                <label
                  htmlFor="photo-upload"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  <Upload className="h-5 w-5" />
                  {pendingFiles.length > 0
                    ? `${pendingFiles.length} foto${pendingFiles.length > 1 ? "s" : ""} seleccionada${pendingFiles.length > 1 ? "s" : ""}`
                    : "Toca para seleccionar"}
                </label>
                <input
                  ref={fileInputRef}
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </div>

              {/* Preview thumbnails */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((url, idx) => (
                    <div key={url} className="group relative aspect-square overflow-hidden rounded-lg">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Preview ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePendingFile(idx)}
                        className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {pendingFiles.length > 0 && (
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full gap-2"
                >
                  {uploading ? (
                    "Subiendo..."
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Confirmar subida ({pendingFiles.length} foto{pendingFiles.length > 1 ? "s" : ""})
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[140px] bg-secondary text-foreground">
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
          <Camera className="h-10 w-10" />
          <p>No hay fotos aun.</p>
          <p className="text-sm">Sube tu primera foto de progreso.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              className="group relative cursor-pointer overflow-hidden border-border bg-card"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="aspect-square">
                <img
                  src={photo.photo_url || "/placeholder.svg"}
                  alt={`Progreso ${photo.photo_date}`}
                  className="h-full w-full object-cover"

                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-card/80 px-2 py-1.5 backdrop-blur-sm">
                <p className="text-xs font-medium text-foreground">
                  {new Date(photo.photo_date + "T12:00:00").toLocaleDateString(
                    "es-CL"
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {categories.find((c) => c.value === photo.category)?.label}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Photo Detail Dialog */}
      {selectedPhoto && (
        <Dialog
          open={!!selectedPhoto}
          onOpenChange={(open) => !open && setSelectedPhoto(null)}
        >
          <DialogContent className="max-h-[90vh] border-border bg-card p-0 sm:max-w-lg">
            <div className="relative">
              <img
                src={selectedPhoto.photo_url || "/placeholder.svg"}
                alt={`Progreso ${selectedPhoto.photo_date}`}
                className="max-h-[70vh] w-full object-contain"

              />
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="absolute right-2 top-2 rounded-full bg-card/80 p-1.5 text-foreground backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between px-4 pb-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {new Date(
                    selectedPhoto.photo_date + "T12:00:00"
                  ).toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {categories.find(
                    (c) => c.value === selectedPhoto.category
                  )?.label}
                  {selectedPhoto.notes && ` - ${selectedPhoto.notes}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(selectedPhoto)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
