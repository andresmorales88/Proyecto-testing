import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

function parseNum(val: string | undefined): number | null {
  if (!val || val === "N/A" || val === "—" || val.trim() === "") return null
  return parseFloat(val.replace(",", "."))
}
function parseBool(val: string | undefined): boolean {
  if (!val || val === "N/A" || val === "—" || val.trim() === "" || val.trim() === "0") return false
  const v = val.trim().toLowerCase()
  return v.startsWith("s") || v === "yes" || v === "1"
}
function parseDate(val: string): string | null {
  const parts = val.split("-")
  if (parts.length !== 3) return null
  const [day, month, year] = parts
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}
function parseStr(val: string | undefined): string | null {
  if (!val || val === "N/A" || val.trim() === "") return null
  return val.replace(/^"|"$/g, "").trim()
}
function parseInt2(val: string | undefined): number | null {
  if (!val || val === "N/A" || val === "—" || val.trim() === "") return null
  const cleaned = val.replace(",", ".")
  const n = parseInt(cleaned)
  return isNaN(n) ? null : n
}

const csvData = `14-12-2025;74,3;17,3;58,5;1623;;;;;;2123;;;0;;;N/A;N/A;N/A;N/A;33
21-12-2025;73,2;17,1;57,7;1603;;;;;;3042;No;No;0;;;N/A;N/A;N/A;N/A;35
22-12-2025;72,9;16,7;57,8;1599;6,4;43;30;35;30144;3122;Sí – Piernas/Espalda;No;0;En paz;Respeto límites;Cumplió;Me cuido física y mentalmente;Cumplió;Entrené bien, dormí poco pero estable;33
23-12-2025;73,8;16,9;58,4;1614;3,1;85;35;32;21123;2639;Sí – Caminata + Sauna;No;0;En paz;Entender y respetar límites explícitos;Cumplió;Priorizar mi bienestar mental y físico;Cumplió;;34
24-12-2025;73,8;17;58,3;1614;7,2;71;73;28;11792;2450;Sí – Gym en casa;Sí;0;En paz;Entender y respetar límites explícitos;Cumplió;Priorizar mi bienestar mental y físico;Cumplió;Sueño reparador, baja ansiedad, buen autocontrol emocional;36
25-12-2025;74,1;17;58,6;1620;5,7;80;84;28;16799;2651;Sí – Caminata + Tenis;No;0;En paz;Priorizar mi bienestar mental y físico;Cumplió;Entender y respetar límites explícitos;Cumplió;Noche corta por Navidad, buen control emocional, comida consciente;38
26-12-2025;74,2;17,1;58,6;1621;7,1;95;96;22;11328;2235;Sí – Fuerza (Pecho/Espalda/Brazos/Core) + Sauna;No;0;Calmo / estable;No buscar validación externa;Cumplido;Caminar al lado;Cumplido;Día sólido: buen sueño, entrenamiento completo, sauna 15 min;41
27-12-2025;72,8;16,8;57,6;1596;5,9;80;72;32;15664;2432;Sí (fuerza ligera);Sí (caminar);0;Calmo / estable;Autocuidado;Cumplió;Control de impulsos;Cumplió;Sueño corto hoy AM; ayer muy buen día fisiológico;42
28-12-2025;72,8;16,5;57,8;1596;8,2;89;96;32;15544;2550;Gym 1h (piernas + espalda);No;0;Alto ánimo / energía;Autocuidado;Cumplió;Control de impulsos;Cumplió;Test Zapier OK;43
29-12-2025;72,5;16,6;57,5;1592;7,7;88;91;29;16094;2515;Dia normal;No;0;Calmo / enfocado;Autocuidado;Cumplio;Control de impulsos;Cumplio;Buen descanso, dia normal de actividad;45
30-12-2025;73,4;16,9;58;1607;7,6;90;96;27;7275;2270;Tenis;Si;0;Calmo / enfocado;Constancia;Cumplio;Autocuidado;Cumplio;Buen descanso, dia normal;47
31-12-2025;72,6;16,6;57,6;1593;7,6;85;87;28;12790;2381;Gym hombros y espalda ligero;N/A;0;Calmo / enfocado;Eje interno primero;Cumplio;Observar sin reaccionar;En entrenamiento;Estimulo externo detectado (IG), observado sin reaccion, rutina matinal sostenida.;48
1-1-2026;72,7;16,7;57,6;1585;4,9;70;68;32;11489;2297;Caminata simple;N/A;0;Calmo;Proceso sobre estado;Cumplio;Autocompasion operacional;En entrenamiento;Ano Nuevo impacto sueno.;50
2-1-2026;N/A;N/A;N/A;N/A;4,9;70;62;27;5114;2032;No;N/A;0;Calmo;Disciplina sin rigidez;Cumplio;Priorizar recuperación;Cumplio;Viaje y sueño corto; sostuve sistema sin apretar.;48
3-1-2026;N/A;N/A;N/A;N/A;4,9;70;62;27;7703;2032;No;N/A;0;Calmo;Disciplina sin rigidez;Cumplio;Priorizar recuperación;Cumplio;Viaje y sueño corto; sostuve sistema sin apretar.;48
4-1-2026;71,6;16,2;57,8;1589;7,1;87;76;30;14817;2454;Full Body light;N/A;0;Pensando en reunion;Disciplina sin rigidez;Cumplio;Priorizar recuperación;Cumplio;Viaje/semana 1 en curso.;47
5-1-2026;71,6;16,2;57,1;1566;7,1;65;62;36;17177;2605;Sí;Sí;0;Calmo;Disciplina sin rigidez;Cumplió;Priorizar recuperación;Cumplió;Día estable;46
6-1-2026;71,8;16,2;57,2;1570;7,0;85;66;36;4947;2163;No;No;0;Calmo;Disciplina sin rigidez;Cumplió;Priorizar recuperación;Cumplió;Menos pasos, rutina ligera;44
7-1-2026;72,6;16,5;57,7;1584;6,9;84;66;36;106;;Tenis;No;0;Calmo;Disciplina sin rigidez;Cumplió;Priorizar recuperación;Cumplió;Dolor pierna posterior;44
8-1-2026;71,8;16,2;57,2;1570;6,9;84;51;33;16727;2451;No;No;0;Calmo;Autocuidado;Cumplió;Escuchar el cuerpo;Cumplió;Dolor bajó a 1 tras caminar;40
9-1-2026;72;16,2;57,4;1573;5,6;74;69;36;7817;2119;Upper;No;0;OK;Disciplina;Cumplido;Recuperación;Parcial;Déficit ~420–520 kcal; media 7d ~760–860 kcal; sueño bajo;41
10-1-2026;71,7;16,2;57,1;1567;4,9;69;72;31;8498;2302;Sí (upper);No;0;Irritado, funcional;Autocuidado;Cumplido;Regulación;Cumplido;Despertar activado 4-6am con rumiación emocional;43
11-1-2026;71,2;15,9;56,9;1559;7,4;85;88;28;9005;2190;No;No;0;Calmo / enfocado;Consistencia;Cumplido;Autocuidado;Cumplido;Sueño recuperado (7h26m); rebote fuerte de BB (88);44
12-1-2026;71,1;15,8;56,9;1557;7,4;82;74;30;13841;2399;Gym upper (pecho/hombro/espalda);Caminata 90min;0;Calmo, enfocado;Disciplina sin rigidez;Cumplido;Proceso sobre resultado;Cumplido;Día muy activo; déficit alto pero puntual;45
13-1-2026;71,5;15,9;57,2;1564;;64;59;36;11901;2453;GYM (glúteo + escaleras);Caminar + escalera;0;Bien pero algo cargado;Autocuidado;OK;Disciplina sin castigo;OK;Sueño bajo, buen cumplimiento físico;45
14-1-2026;71,5;15,9;57,2;1564;6,0;75;80;28;9540;2301;GYM (Upper + glúteo);Caminar + escalera;0;Energía alta, foco claro;Autocuidado;OK;Disciplina sin rigidez;OK;Déficit controlado, buena energía AM;46
16-1-2026;71;15,6;57;1556;;82;62;37;16866;2609;GYM Glúteo + Abducción;Caminata 2.44km;0;Estable / enfocado;Rutina;OK;Alimentación;OK;Día activo, alto NEAT, buen déficit;47
18-1-2026;70,6;15,4;56,8;1549;;91;80;31;13551;2386;GYM;No;0;Estable / enfocado;Rutina;OK;Alimentación;OK;Buen sueño, alto NEAT, día activo sin exceso;47
19-1-2026;70,8;15,3;57;1552;7,1;91;49;35;16803;2530;Sí;No;0;Estable;;;;;VO2max 50 (Excelente), VFC 48ms equilibrado;48
21-1-2026;69,8;15,2;56,3;1535;6,2;82;59;33;17815;2574;Sí (Gym + Tenis);Sí (Tenis);0;Estable;Rutina;OK;Alimentación;OK;Déficit alto controlado, tenis + gym;48
26-1-2026;69,9;14,8;56,6;1536;5,9;48;18;;14598;2608;GYM (Espalda/Bíceps/Tríceps);No;Sí;Estable;Rutina;OK;Alimentación;OK;Sueño corto; alcohol previo;38
27-1-2026;69,9;15,2;56,5;1536;;82;39;;3563;2224;GYM (Espalda light);No;0;Estresado;Respeto límites;Cumplió;Priorizar mi bienestar;Cumplió;;
4-2-2026;70,2;15,2;56,6;1542;;82;9;;;;;;;;;;;Buena recuperación, sueño sólido, déficit activo;
5-2-2026;70;15,1;56,5;1538;7,4;89;27;28;22948;3171;Fuerza + running largo;1h20 (Z3-Z4);No;Calmo, enfocado;Entrenar;Cumplido;Nutrición consciente;Parcial;Cardio intenso, alto gasto calórico;46
10-2-2026;69,7;15;56,4;1533;6,8;91;97;32;15476;2581;Sí;Sí;No;Enfocado;Entrenar;Cumplido;Comer bien;Cumplido;Buena recuperación;48
11-2-2026;70;14,9;56,6;1538;6,2;85;78;26;13445;2367;Sí;Sí;No;Enfocado;Entrenar;Cumplido;Comer bien;Cumplido;Buena recuperación, VFC estable;48
12-2-2026;69,7;14,7;56,5;1533;6,2;85;82;30;16903;2524;Sí;Sí;No;Enfocado;Entrenar;Cumplido;Comer bien;Cumplido;Buen nivel de pasos, VFC estable;48
13-2-2026;69;14,5;56,1;1521;6,8;86;90;28;18734;2684;Caminar 8.02 km;1h03m zona baja;0;Estable;Disciplina;OK;Consistencia;OK;Buen HRV y buena carga aeróbica ayer;48
14-2-2026;69,1;14,4;56,2;1522;;;;;;;;;;;;;;;;;
15-2-2026;68,1;14;55,7;1505;6,4;82;87;29;32535;2922;Caminar 2.73 km;Zona 2 ligera;0;Enfocado;Disciplina;Alta;Ansiedad controlada;Media;Tendencia bajando grasa, alto NEAT;52`

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const rows = csvData.split("\n").filter((r) => r.trim())
  let inserted = 0
  let errors: string[] = []

  for (const row of rows) {
    const cols = row.split(";")
    const date = parseDate(cols[0])
    if (!date) continue

    const entry = {
      entry_date: date,
      weight: parseNum(cols[1]),
      body_fat_pct: parseNum(cols[2]),
      muscle_mass: parseNum(cols[3]),
      mb_kcal: parseInt2(cols[4]),
      sleep_hours: parseStr(cols[5]),
      sleep_score: parseNum(cols[6]),
      body_battery_am: parseNum(cols[7]),
      stress_avg: parseNum(cols[8]),
      steps: parseInt2(cols[9]),
      kcal_burned: parseInt2(cols[10]),
      training_type: parseStr(cols[11]),
      cardio_yesterday: parseBool(cols[12]),
      alcohol: parseBool(cols[13]),
      mental_state: parseStr(cols[14]),
      principle_1: parseStr(cols[15]),
      principle_1_status: parseStr(cols[16]),
      principle_2: parseStr(cols[17]),
      principle_2_status: parseStr(cols[18]),
      observations: parseStr(cols[19]),
      vfc_7d: parseNum(cols[20]),
    }

    const { error } = await supabase
      .from("daily_entries")
      .upsert(entry, { onConflict: "entry_date" })

    if (error) {
      errors.push(`${date}: ${error.message}`)
    } else {
      inserted++
    }
  }

  return NextResponse.json({ inserted, errors, total: rows.length })
}
