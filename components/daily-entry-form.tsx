"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import {
  Moon,
  Battery,
  Brain,
  Footprints,
  Flame,
  Heart,
  Scale,
  Dumbbell,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { ScreenshotScanner } from "@/components/screenshot-scanner"

interface DailyEntry {
  id?: string
  entry_date: string
  sleep_score: number | null
  sleep_hours: string
  body_battery_am: number | null
  stress_avg: number | null
  steps: number | null
  kcal_burned: number | null
  vfc_7d: number | null
  weight: number | null
  body_fat_pct: number | null
  muscle_mass: number | null
  mb_kcal: number | null
  training_type: string
  cardio_yesterday: boolean
  alcohol: boolean
  mental_state: string
  principle_1: string
  principle_1_status: string
  principle_2: string
  principle_2_status: string
  observations: string
}

const emptyEntry: DailyEntry = {
  entry_date: new Date().toISOString().split("T")[0],
  sleep_score: null,
  sleep_hours: "",
  body_battery_am: null,
  stress_avg: null,
  steps: null,
  kcal_burned: null,
  vfc_7d: null,
  weight: null,
  body_fat_pct: null,
  muscle_mass: null,
  mb_kcal: null,
  training_type: "",
  cardio_yesterday: false,
  alcohol: false,
  mental_state: "",
  principle_1: "",
  principle_1_status: "",
  principle_2: "",
  principle_2_status: "",
  observations: "",
}

const principleStatusOptions = ["Cumplido", "Parcial", "OK", "No cumplido"]

export function DailyEntryForm({ userId }: { userId: string }) {
  const [entry, setEntry] = useState<DailyEntry>(emptyEntry)
  const [isLoading, setIsLoading] = useState(false)
  const [isExisting, setIsExisting] = useState(false)

  useEffect(() => {
    loadEntry(entry.entry_date)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.entry_date])

  const loadEntry = async (date: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("entry_date", date)
      .single()

    if (data) {
      setEntry({ ...data, entry_date: date })
      setIsExisting(true)
    } else {
      setEntry({ ...emptyEntry, entry_date: date })
      setIsExisting(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const payload = {
      user_id: userId,
      entry_date: entry.entry_date,
      sleep_score: entry.sleep_score,
      sleep_hours: entry.sleep_hours || null,
      body_battery_am: entry.body_battery_am,
      stress_avg: entry.stress_avg,
      steps: entry.steps,
      kcal_burned: entry.kcal_burned,
      vfc_7d: entry.vfc_7d,
      weight: entry.weight,
      body_fat_pct: entry.body_fat_pct,
      muscle_mass: entry.muscle_mass,
      mb_kcal: entry.mb_kcal,
      training_type: entry.training_type || null,
      cardio_yesterday: entry.cardio_yesterday,
      alcohol: entry.alcohol,
      mental_state: entry.mental_state || null,
      principle_1: entry.principle_1 || null,
      principle_1_status: entry.principle_1_status || null,
      principle_2: entry.principle_2 || null,
      principle_2_status: entry.principle_2_status || null,
      observations: entry.observations || null,
      updated_at: new Date().toISOString(),
    }

    let error
    if (isExisting && entry.id) {
      ;({ error } = await supabase
        .from("daily_entries")
        .update(payload)
        .eq("id", entry.id))
    } else {
      ;({ error } = await supabase.from("daily_entries").insert(payload))
    }

    if (error) {
      toast.error("Error al guardar: " + error.message)
    } else {
      toast.success(isExisting ? "Registro actualizado" : "Registro guardado")
      loadEntry(entry.entry_date)
    }
    setIsLoading(false)
  }

  const changeDate = (days: number) => {
    const d = new Date(entry.entry_date + "T12:00:00")
    d.setDate(d.getDate() + days)
    setEntry((prev) => ({
      ...prev,
      entry_date: d.toISOString().split("T")[0],
    }))
  }

  const updateField = (field: keyof DailyEntry, value: unknown) => {
    setEntry((prev) => ({ ...prev, [field]: value }))
  }

  const numVal = (v: string) => (v === "" ? null : Number(v))

  const handleScannedData = (
    data: Record<string, unknown>,
    source: "garmin" | "eufy"
  ) => {
    setEntry((prev) => {
      const updated = { ...prev }
      if (source === "garmin") {
        if (data.sleep_score != null) updated.sleep_score = Number(data.sleep_score)
        if (data.sleep_hours != null) updated.sleep_hours = String(data.sleep_hours)
        if (data.body_battery_am != null) updated.body_battery_am = Number(data.body_battery_am)
        if (data.stress_avg != null) updated.stress_avg = Number(data.stress_avg)
        if (data.steps != null) updated.steps = Number(data.steps)
        if (data.kcal_burned != null) updated.kcal_burned = Number(data.kcal_burned)
        if (data.vfc_7d != null) updated.vfc_7d = Number(data.vfc_7d)
      } else {
        if (data.weight != null) updated.weight = Number(data.weight)
        if (data.body_fat_pct != null) updated.body_fat_pct = Number(data.body_fat_pct)
        if (data.muscle_mass != null) updated.muscle_mass = Number(data.muscle_mass)
        if (data.mb_kcal != null) updated.mb_kcal = Number(data.mb_kcal)
      }
      return updated
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Date navigation */}
      <div className="flex items-center justify-between rounded-lg bg-card p-3">
        <button
          type="button"
          onClick={() => changeDate(-1)}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center">
          <input
            type="date"
            value={entry.entry_date}
            onChange={(e) => updateField("entry_date", e.target.value)}
            className="bg-transparent text-center text-lg font-semibold text-foreground"
          />
          {isExisting && (
            <span className="text-xs text-primary">Registro existente</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => changeDate(1)}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Screenshot Scanner - upload photos to auto-fill */}
      <ScreenshotScanner onDataExtracted={handleScannedData} />

      {/* Garmin Data Section */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-card-foreground">
            <Moon className="h-4 w-4 text-primary" />
            Datos Garmin (ayer)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                <Moon className="h-3 w-3" /> Sueno (score)
              </Label>
              <Input
                type="number"
                placeholder="89"
                value={entry.sleep_score ?? ""}
                onChange={(e) =>
                  updateField("sleep_score", numVal(e.target.value))
                }
                className="h-9 bg-secondary text-foreground"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                <Moon className="h-3 w-3" /> Sueno (horas)
              </Label>
              <Input
                type="text"
                placeholder="7h 21m"
                value={entry.sleep_hours}
                onChange={(e) => updateField("sleep_hours", e.target.value)}
                className="h-9 bg-secondary text-foreground"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                <Battery className="h-3 w-3" /> Body Battery AM
              </Label>
              <Input
                type="number"
                placeholder="61"
                value={entry.body_battery_am ?? ""}
                onChange={(e) =>
                  updateField("body_battery_am", numVal(e.target.value))
                }
                className="h-9 bg-secondary text-foreground"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                <Brain className="h-3 w-3" /> Estres promedio
              </Label>
              <Input
                type="number"
                placeholder="36"
                value={entry.stress_avg ?? ""}
                onChange={(e) =>
                  updateField("stress_avg", numVal(e.target.value))
                }
                className="h-9 bg-secondary text-foreground"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                <Footprints className="h-3 w-3" /> Pasos ayer
              </Label>
              <Input
                type="number"
                placeholder="15542"
                value={entry.steps ?? ""}
                onChange={(e) => updateField("steps", numVal(e.target.value))}
                className="h-9 bg-secondary text-foreground"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                <Flame className="h-3 w-3" /> Kcal quemadas
              </Label>
              <Input
                type="number"
                placeholder="2491"
                value={entry.kcal_burned ?? ""}
                onChange={(e) =>
                  updateField("kcal_burned", numVal(e.target.value))
                }
                className="h-9 bg-secondary text-foreground"
              />
            </div>
            <div className="col-span-2 grid gap-1.5">
              <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                <Heart className="h-3 w-3" /> VFC 7d (ms)
              </Label>
              <Input
                type="number"
                placeholder="46"
                value={entry.vfc_7d ?? ""}
                onChange={(e) => updateField("vfc_7d", numVal(e.target.value))}
                className="h-9 bg-secondary text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eufy Scale Data */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-card-foreground">
            <Scale className="h-4 w-4 text-primary" />
            Pesa Eufy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Peso (kg)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="69.7"
                value={entry.weight ?? ""}
                onChange={(e) => updateField("weight", numVal(e.target.value))}
                className="h-9 bg-secondary text-foreground"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">% Grasa</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="14.9"
                value={entry.body_fat_pct ?? ""}
                onChange={(e) =>
                  updateField("body_fat_pct", numVal(e.target.value))
                }
                className="h-9 bg-secondary text-foreground"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Masa Muscular (kg)
              </Label>
              <Input
                type="number"
                step="0.1"
                placeholder="56.4"
                value={entry.muscle_mass ?? ""}
                onChange={(e) =>
                  updateField("muscle_mass", numVal(e.target.value))
                }
                className="h-9 bg-secondary text-foreground"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">MB (kcal)</Label>
              <Input
                type="number"
                placeholder="1533"
                value={entry.mb_kcal ?? ""}
                onChange={(e) =>
                  updateField("mb_kcal", numVal(e.target.value))
                }
                className="h-9 bg-secondary text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training & Lifestyle */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-card-foreground">
            <Dumbbell className="h-4 w-4 text-primary" />
            Entrenamiento y Estilo de Vida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Tipo de Entrenamiento
              </Label>
              <Input
                type="text"
                placeholder="GYM (Upper), Tenis, Caminata..."
                value={entry.training_type}
                onChange={(e) => updateField("training_type", e.target.value)}
                className="h-9 bg-secondary text-foreground"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">
                Cardio ayer
              </Label>
              <Switch
                checked={entry.cardio_yesterday}
                onCheckedChange={(v) => updateField("cardio_yesterday", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Alcohol</Label>
              <Switch
                checked={entry.alcohol}
                onCheckedChange={(v) => updateField("alcohol", v)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Estado Mental / Animo
              </Label>
              <Input
                type="text"
                placeholder="Calmo, enfocado, estable..."
                value={entry.mental_state}
                onChange={(e) => updateField("mental_state", e.target.value)}
                className="h-9 bg-secondary text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Principles */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-card-foreground">
            Principios del Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 grid gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Principio 1
                </Label>
                <Input
                  type="text"
                  placeholder="Disciplina sin rigidez"
                  value={entry.principle_1}
                  onChange={(e) => updateField("principle_1", e.target.value)}
                  className="h-9 bg-secondary text-foreground"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">Estado</Label>
                <Select
                  value={entry.principle_1_status}
                  onValueChange={(v) => updateField("principle_1_status", v)}
                >
                  <SelectTrigger className="h-9 bg-secondary text-foreground">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent>
                    {principleStatusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 grid gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Principio 2
                </Label>
                <Input
                  type="text"
                  placeholder="Control de impulsos"
                  value={entry.principle_2}
                  onChange={(e) => updateField("principle_2", e.target.value)}
                  className="h-9 bg-secondary text-foreground"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">Estado</Label>
                <Select
                  value={entry.principle_2_status}
                  onValueChange={(v) => updateField("principle_2_status", v)}
                >
                  <SelectTrigger className="h-9 bg-secondary text-foreground">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent>
                    {principleStatusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observations */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-card-foreground">
            Observaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Notas del dia, como te sentiste, que ajustar..."
            value={entry.observations}
            onChange={(e) => updateField("observations", e.target.value)}
            className="min-h-[80px] bg-secondary text-foreground"
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isLoading}
        size="lg"
        className="w-full gap-2"
      >
        <Save className="h-4 w-4" />
        {isLoading
          ? "Guardando..."
          : isExisting
            ? "Actualizar Registro"
            : "Guardar Registro"}
      </Button>
    </div>
  )
}
