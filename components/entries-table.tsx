"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Download } from "lucide-react"
import { toast } from "sonner"

interface Entry {
  id: string
  entry_date: string
  sleep_score: number | null
  sleep_hours: string | null
  body_battery_am: number | null
  stress_avg: number | null
  steps: number | null
  kcal_burned: number | null
  vfc_7d: number | null
  weight: number | null
  body_fat_pct: number | null
  muscle_mass: number | null
  mb_kcal: number | null
  training_type: string | null
  cardio_yesterday: boolean
  alcohol: boolean
  mental_state: string | null
  principle_1: string | null
  principle_1_status: string | null
  principle_2: string | null
  principle_2_status: string | null
  observations: string | null
}

function statusColor(status: string | null) {
  if (!status) return "secondary"
  if (status === "Cumplido" || status === "OK") return "default"
  if (status === "Parcial") return "secondary"
  return "destructive"
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function escapeCsv(val: string) {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return '"' + val.replace(/"/g, '""') + '"'
  }
  return val
}

function downloadExcel(entries: Entry[]) {
  const headers = [
    "Fecha", "Peso", "% Grasa", "Masa Muscular", "MB (kcal)",
    "Sueno (score)", "Sueno (horas)", "Body Battery AM", "Estres promedio",
    "Pasos ayer", "Kcal quemadas", "VFC 7d (ms)", "Entrenamiento",
    "Cardio ayer", "Alcohol", "Estado Mental", "Principio 1",
    "Estado P1", "Principio 2", "Estado P2", "Observaciones",
  ]

  const rows = entries.map((e) => [
    e.entry_date,
    e.weight ?? "",
    e.body_fat_pct ?? "",
    e.muscle_mass ?? "",
    e.mb_kcal ?? "",
    e.sleep_score ?? "",
    e.sleep_hours ?? "",
    e.body_battery_am ?? "",
    e.stress_avg ?? "",
    e.steps ?? "",
    e.kcal_burned ?? "",
    e.vfc_7d ?? "",
    e.training_type ?? "",
    e.cardio_yesterday ? "Si" : "No",
    e.alcohol ? "Si" : "No",
    e.mental_state ?? "",
    e.principle_1 ?? "",
    e.principle_1_status ?? "",
    e.principle_2 ?? "",
    e.principle_2_status ?? "",
    e.observations ?? "",
  ])

  const BOM = "\uFEFF"
  const csv =
    BOM +
    headers.map(escapeCsv).join(",") +
    "\n" +
    rows.map((r) => r.map((v) => escapeCsv(String(v))).join(",")).join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `fitness_tracker_${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success("Archivo descargado. Abrelo en Excel.")
}

export function EntriesTable() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  const loadEntries = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("daily_entries")
      .select("*")
      .order("entry_date", { ascending: false })
      .limit(200)

    if (data) setEntries(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("daily_entries")
      .delete()
      .eq("id", id)
    if (error) {
      toast.error("Error al eliminar")
    } else {
      toast.success("Registro eliminado")
      loadEntries()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Cargando datos...
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
        <p>No hay registros aun.</p>
        <p className="text-sm">Comienza agregando tu primer registro diario.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="text-sm text-muted-foreground">
          {entries.length} registros
        </span>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => downloadExcel(entries)}
        >
          <Download className="h-4 w-4" />
          Descargar Excel
        </Button>
      </div>
      <ScrollArea className="w-full">
        <div className="min-w-[1200px]">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-secondary/50">
                <TableHead className="sticky left-0 z-10 bg-card text-xs text-muted-foreground">Fecha</TableHead>
                <TableHead className="text-xs text-muted-foreground">Peso</TableHead>
                <TableHead className="text-xs text-muted-foreground">% Grasa</TableHead>
                <TableHead className="text-xs text-muted-foreground">Masa Musc.</TableHead>
                <TableHead className="text-xs text-muted-foreground">MB</TableHead>
                <TableHead className="text-xs text-muted-foreground">Sueno</TableHead>
                <TableHead className="text-xs text-muted-foreground">Hrs Sueno</TableHead>
                <TableHead className="text-xs text-muted-foreground">BB AM</TableHead>
                <TableHead className="text-xs text-muted-foreground">Estres</TableHead>
                <TableHead className="text-xs text-muted-foreground">Pasos</TableHead>
                <TableHead className="text-xs text-muted-foreground">Kcal</TableHead>
                <TableHead className="text-xs text-muted-foreground">VFC 7d</TableHead>
                <TableHead className="text-xs text-muted-foreground">Entreno</TableHead>
                <TableHead className="text-xs text-muted-foreground">Cardio</TableHead>
                <TableHead className="text-xs text-muted-foreground">Alcohol</TableHead>
                <TableHead className="text-xs text-muted-foreground">Estado Mental</TableHead>
                <TableHead className="text-xs text-muted-foreground">P1</TableHead>
                <TableHead className="text-xs text-muted-foreground">Est. P1</TableHead>
                <TableHead className="text-xs text-muted-foreground">P2</TableHead>
                <TableHead className="text-xs text-muted-foreground">Est. P2</TableHead>
                <TableHead className="text-xs text-muted-foreground">Obs.</TableHead>
                <TableHead className="text-xs text-muted-foreground" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id} className="border-border hover:bg-secondary/30">
                  <TableCell className="sticky left-0 z-10 bg-card text-xs font-medium text-foreground">
                    {formatDate(e.entry_date)}
                  </TableCell>
                  <TableCell className="text-xs text-foreground">{e.weight ?? "-"}</TableCell>
                  <TableCell className="text-xs text-foreground">{e.body_fat_pct ?? "-"}</TableCell>
                  <TableCell className="text-xs text-foreground">{e.muscle_mass ?? "-"}</TableCell>
                  <TableCell className="text-xs text-foreground">{e.mb_kcal ?? "-"}</TableCell>
                  <TableCell className="text-xs text-foreground">{e.sleep_score ?? "-"}</TableCell>
                  <TableCell className="text-xs text-foreground">{e.sleep_hours ?? "-"}</TableCell>
                  <TableCell className="text-xs text-foreground">{e.body_battery_am ?? "-"}</TableCell>
                  <TableCell className="text-xs text-foreground">{e.stress_avg ?? "-"}</TableCell>
                  <TableCell className="text-xs text-foreground">{e.steps?.toLocaleString() ?? "-"}</TableCell>
                  <TableCell className="text-xs text-foreground">{e.kcal_burned?.toLocaleString() ?? "-"}</TableCell>
                  <TableCell className="text-xs text-foreground">{e.vfc_7d ?? "-"}</TableCell>
                  <TableCell className="max-w-[120px] truncate text-xs text-foreground">{e.training_type ?? "-"}</TableCell>
                  <TableCell className="text-xs">{e.cardio_yesterday ? <Badge variant="default" className="text-[10px]">Si</Badge> : <span className="text-muted-foreground">No</span>}</TableCell>
                  <TableCell className="text-xs">{e.alcohol ? <Badge variant="destructive" className="text-[10px]">Si</Badge> : <span className="text-muted-foreground">No</span>}</TableCell>
                  <TableCell className="max-w-[100px] truncate text-xs text-foreground">{e.mental_state ?? "-"}</TableCell>
                  <TableCell className="max-w-[100px] truncate text-xs text-foreground">{e.principle_1 ?? "-"}</TableCell>
                  <TableCell className="text-xs">
                    {e.principle_1_status && (
                      <Badge variant={statusColor(e.principle_1_status)} className="text-[10px]">
                        {e.principle_1_status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[100px] truncate text-xs text-foreground">{e.principle_2 ?? "-"}</TableCell>
                  <TableCell className="text-xs">
                    {e.principle_2_status && (
                      <Badge variant={statusColor(e.principle_2_status)} className="text-[10px]">
                        {e.principle_2_status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-xs text-foreground">{e.observations ?? "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(e.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  )
}
