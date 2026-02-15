import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Dumbbell } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              FitTracker
            </span>
          </div>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl text-card-foreground">
                Registro exitoso
              </CardTitle>
              <CardDescription>
                Revisa tu email para confirmar tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Te has registrado correctamente. Revisa tu email y confirma tu
                cuenta antes de iniciar sesion.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
