import { generateText, Output } from "ai"
import * as z from "zod"

const garminSchema = z.object({
  sleep_score: z.number().nullable().describe("Puntuacion de sueno, e.g. 89"),
  sleep_hours: z
    .string()
    .nullable()
    .describe("Duracion de sueno, e.g. '7h 21m'"),
  body_battery_am: z
    .number()
    .nullable()
    .describe("Body Battery cargada/AM, e.g. 61"),
  stress_avg: z.number().nullable().describe("Estres promedio, e.g. 36"),
  steps: z.number().nullable().describe("Pasos del dia, e.g. 15542"),
  kcal_burned: z
    .number()
    .nullable()
    .describe("Calorias quemadas, e.g. 2491"),
  vfc_7d: z
    .number()
    .nullable()
    .describe("VFC media 7 dias en ms, e.g. 46"),
})

const eufySchema = z.object({
  weight: z.number().nullable().describe("Peso en kg, e.g. 69.7"),
  body_fat_pct: z
    .number()
    .nullable()
    .describe("Porcentaje de grasa corporal, e.g. 14.9"),
  muscle_mass: z
    .number()
    .nullable()
    .describe("Masa muscular en kg, e.g. 56.4"),
  mb_kcal: z
    .number()
    .nullable()
    .describe("Metabolismo basal en kcal, e.g. 1533"),
})

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
  if (match) {
    return { mimeType: match[1], data: match[2] }
  }
  // If it's already a plain URL or base64 without prefix, return as-is
  return { mimeType: "image/jpeg", data: dataUrl }
}

export async function POST(req: Request) {
  try {
    const { images, source } = await req.json()

    if (!images || images.length === 0) {
      return Response.json({ error: "No images provided" }, { status: 400 })
    }

    const schema = source === "eufy" ? eufySchema : garminSchema

    const imageContent = images.map((img: string) => {
      const { mimeType, data } = parseDataUrl(img)
      return {
        type: "image" as const,
        mimeType,
        image: data,
      }
    })

    const { output } = await generateText({
      model: "openai/gpt-4o",
      output: Output.object({ schema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                source === "eufy"
                  ? "Extract the body composition data from this Eufy smart scale screenshot. Look for: Peso (weight in kg), % de Grasa Corporal (body fat percentage), Masa Muscular (muscle mass in kg), MB/Metabolismo Basal (basal metabolic rate in kcal). Return null for any value you cannot find."
                  : "Extract the fitness data from this Garmin Connect screenshot. Look for: Puntuacion de sueno (sleep score as number), duracion de sueno (sleep hours as text like '7h 21m'), Body Battery (the positive/charged value as AM value), Estres (stress average), Pasos (steps), Calorias quemadas (burned calories), Estado de VFC/HRV (VFC 7-day average in ms). Return null for any value you cannot find.",
            },
            ...imageContent,
          ],
        },
      ],
    })

    return Response.json({ data: output, source })
  } catch (error) {
    console.error("[v0] Error parsing screenshot:", error)
    const message =
      error instanceof Error ? error.message : "Error al procesar la imagen"
    return Response.json({ error: message }, { status: 500 })
  }
}
