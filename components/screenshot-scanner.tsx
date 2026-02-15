"use client"

import React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, Loader2, X, ScanLine, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface ParsedGarminData {
  sleep_score?: number | null
  sleep_hours?: string | null
  body_battery_am?: number | null
  stress_avg?: number | null
  steps?: number | null
  kcal_burned?: number | null
  vfc_7d?: number | null
}

interface ParsedEufyData {
  weight?: number | null
  body_fat_pct?: number | null
  muscle_mass?: number | null
  mb_kcal?: number | null
}

type ParsedData = ParsedGarminData & ParsedEufyData

interface ScreenshotScannerProps {
  onDataExtracted: (data: ParsedData, source: "garmin" | "eufy") => void
}

export function ScreenshotScanner({ onDataExtracted }: ScreenshotScannerProps) {
  const [garminImages, setGarminImages] = useState<string[]>([])
  const [eufyImages, setEufyImages] = useState<string[]>([])
  const [isParsingGarmin, setIsParsingGarmin] = useState(false)
  const [isParsingEufy, setIsParsingEufy] = useState(false)
  const [garminDone, setGarminDone] = useState(false)
  const [eufyDone, setEufyDone] = useState(false)
  const garminInputRef = useRef<HTMLInputElement>(null)
  const eufyInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    source: "garmin" | "eufy"
  ) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string
        if (source === "garmin") {
          setGarminImages((prev) => [...prev, base64])
          setGarminDone(false)
        } else {
          setEufyImages((prev) => [...prev, base64])
          setEufyDone(false)
        }
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ""
  }

  const removeImage = (source: "garmin" | "eufy", index: number) => {
    if (source === "garmin") {
      setGarminImages((prev) => prev.filter((_, i) => i !== index))
      setGarminDone(false)
    } else {
      setEufyImages((prev) => prev.filter((_, i) => i !== index))
      setEufyDone(false)
    }
  }

  const parseImages = async (source: "garmin" | "eufy") => {
    const images = source === "garmin" ? garminImages : eufyImages
    if (images.length === 0) {
      toast.error("Sube al menos una captura de pantalla")
      return
    }

    if (source === "garmin") setIsParsingGarmin(true)
    else setIsParsingEufy(true)

    try {
      const res = await fetch("/api/parse-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, source }),
      })

      if (!res.ok) {
        throw new Error("Error al procesar")
      }

      const result = await res.json()

      if (result.data) {
        onDataExtracted(result.data, source)
        if (source === "garmin") setGarminDone(true)
        else setEufyDone(true)
        toast.success(
          source === "garmin"
            ? "Datos Garmin extraidos correctamente"
            : "Datos Eufy extraidos correctamente"
        )
      } else {
        toast.error("No se pudieron extraer los datos")
      }
    } catch {
      toast.error("Error al procesar la imagen. Intenta de nuevo.")
    } finally {
      if (source === "garmin") setIsParsingGarmin(false)
      else setIsParsingEufy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Garmin Scanner */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                <ScanLine className="h-4 w-4 text-chart-2" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Garmin</p>
                <p className="text-xs text-muted-foreground">
                  Sueno, BB, estres, pasos, kcal, VFC
                </p>
              </div>
            </div>
            {garminDone && <CheckCircle2 className="h-5 w-5 text-primary" />}
          </div>

          {garminImages.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {garminImages.map((img, i) => (
                <div key={`garmin-${i}`} className="relative flex-shrink-0">
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Garmin screenshot ${i + 1}`}
                    className="h-20 w-14 rounded-md border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage("garmin", i)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={garminInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={(e) => handleImageSelect(e, "garmin")}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1 gap-1.5 text-secondary-foreground"
              onClick={() => garminInputRef.current?.click()}
            >
              <Camera className="h-3.5 w-3.5" />
              <span className="text-xs">Foto</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1 gap-1.5 text-secondary-foreground"
              onClick={() => {
                if (garminInputRef.current) {
                  garminInputRef.current.removeAttribute("capture")
                  garminInputRef.current.click()
                  garminInputRef.current.setAttribute("capture", "environment")
                }
              }}
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="text-xs">Galeria</span>
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1 gap-1.5"
              disabled={garminImages.length === 0 || isParsingGarmin}
              onClick={() => parseImages("garmin")}
            >
              {isParsingGarmin ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ScanLine className="h-3.5 w-3.5" />
              )}
              <span className="text-xs">
                {isParsingGarmin ? "Leyendo..." : "Leer"}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Eufy Scanner */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                <ScanLine className="h-4 w-4 text-chart-3" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Eufy</p>
                <p className="text-xs text-muted-foreground">
                  Peso, grasa, masa muscular, MB
                </p>
              </div>
            </div>
            {eufyDone && <CheckCircle2 className="h-5 w-5 text-primary" />}
          </div>

          {eufyImages.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {eufyImages.map((img, i) => (
                <div key={`eufy-${i}`} className="relative flex-shrink-0">
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Eufy screenshot ${i + 1}`}
                    className="h-20 w-14 rounded-md border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage("eufy", i)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={eufyInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={(e) => handleImageSelect(e, "eufy")}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1 gap-1.5 text-secondary-foreground"
              onClick={() => eufyInputRef.current?.click()}
            >
              <Camera className="h-3.5 w-3.5" />
              <span className="text-xs">Foto</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1 gap-1.5 text-secondary-foreground"
              onClick={() => {
                if (eufyInputRef.current) {
                  eufyInputRef.current.removeAttribute("capture")
                  eufyInputRef.current.click()
                  eufyInputRef.current.setAttribute("capture", "environment")
                }
              }}
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="text-xs">Galeria</span>
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1 gap-1.5"
              disabled={eufyImages.length === 0 || isParsingEufy}
              onClick={() => parseImages("eufy")}
            >
              {isParsingEufy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ScanLine className="h-3.5 w-3.5" />
              )}
              <span className="text-xs">
                {isParsingEufy ? "Leyendo..." : "Leer"}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
