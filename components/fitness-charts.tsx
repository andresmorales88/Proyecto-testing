"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

interface Entry {
  entry_date: string
  weight: number | null
  body_fat_pct: number | null
  muscle_mass: number | null
  sleep_score: number | null
  steps: number | null
  kcal_burned: number | null
  stress_avg: number | null
  vfc_7d: number | null
  body_battery_am: number | null
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
  })
}

const chartColors = {
  primary: "hsl(152, 60%, 48%)",
  blue: "hsl(199, 70%, 50%)",
  amber: "hsl(35, 92%, 60%)",
  grid: "hsl(220, 14%, 18%)",
  text: "hsl(215, 15%, 55%)",
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}) {
  if (!active || !payload) return null
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function FitnessCharts({ userId }: { userId: string }) {
  const [data, setData] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: entries } = await supabase
        .from("daily_entries")
        .select(
          "entry_date,weight,body_fat_pct,muscle_mass,sleep_score,steps,kcal_burned,stress_avg,vfc_7d,body_battery_am"
        )
        .eq("user_id", userId)
        .order("entry_date", { ascending: true })
        .limit(90)

      if (entries) setData(entries)
      setLoading(false)
    }
    load()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Cargando graficos...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
        <p>No hay datos para graficar aun.</p>
        <p className="text-sm">Agrega registros diarios para ver tu evolucion.</p>
      </div>
    )
  }

  const chartData = data.map((e) => ({
    ...e,
    date: formatDate(e.entry_date),
  }))

  return (
    <div className="flex flex-col gap-4">
      {/* Weight + Body Fat */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-card-foreground">
            Peso y % Grasa Corporal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: chartColors.text, fontSize: 10 }}
                axisLine={{ stroke: chartColors.grid }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: chartColors.text, fontSize: 10 }}
                axisLine={{ stroke: chartColors.grid }}
                domain={["dataMin - 1", "dataMax + 1"]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: chartColors.text, fontSize: 10 }}
                axisLine={{ stroke: chartColors.grid }}
                domain={["dataMin - 1", "dataMax + 1"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="weight"
                stroke={chartColors.primary}
                strokeWidth={2}
                dot={false}
                name="Peso (kg)"
                connectNulls
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="body_fat_pct"
                stroke={chartColors.amber}
                strokeWidth={2}
                dot={false}
                name="% Grasa"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Muscle Mass */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-card-foreground">
            Masa Muscular (kg)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: chartColors.text, fontSize: 10 }}
                axisLine={{ stroke: chartColors.grid }}
              />
              <YAxis
                tick={{ fill: chartColors.text, fontSize: 10 }}
                axisLine={{ stroke: chartColors.grid }}
                domain={["dataMin - 0.5", "dataMax + 0.5"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="muscle_mass"
                stroke={chartColors.blue}
                strokeWidth={2}
                dot={false}
                name="Masa Muscular"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sleep + Body Battery */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-card-foreground">
            Sueno y Body Battery AM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: chartColors.text, fontSize: 10 }}
                axisLine={{ stroke: chartColors.grid }}
              />
              <YAxis
                tick={{ fill: chartColors.text, fontSize: 10 }}
                axisLine={{ stroke: chartColors.grid }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="sleep_score"
                stroke={chartColors.blue}
                strokeWidth={2}
                dot={false}
                name="Sueno"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="body_battery_am"
                stroke={chartColors.primary}
                strokeWidth={2}
                dot={false}
                name="Body Battery"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Steps Bar Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-card-foreground">
            Pasos Diarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: chartColors.text, fontSize: 10 }}
                axisLine={{ stroke: chartColors.grid }}
              />
              <YAxis
                tick={{ fill: chartColors.text, fontSize: 10 }}
                axisLine={{ stroke: chartColors.grid }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="steps"
                fill={chartColors.primary}
                radius={[2, 2, 0, 0]}
                name="Pasos"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stress + VFC */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-card-foreground">
            Estres y VFC 7d
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: chartColors.text, fontSize: 10 }}
                axisLine={{ stroke: chartColors.grid }}
              />
              <YAxis
                tick={{ fill: chartColors.text, fontSize: 10 }}
                axisLine={{ stroke: chartColors.grid }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="stress_avg"
                stroke={chartColors.amber}
                strokeWidth={2}
                dot={false}
                name="Estres"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="vfc_7d"
                stroke={chartColors.primary}
                strokeWidth={2}
                dot={false}
                name="VFC 7d"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Kcal Burned */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-card-foreground">
            Calorias Quemadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: chartColors.text, fontSize: 10 }}
                axisLine={{ stroke: chartColors.grid }}
              />
              <YAxis
                tick={{ fill: chartColors.text, fontSize: 10 }}
                axisLine={{ stroke: chartColors.grid }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="kcal_burned"
                fill={chartColors.blue}
                radius={[2, 2, 0, 0]}
                name="Kcal"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
