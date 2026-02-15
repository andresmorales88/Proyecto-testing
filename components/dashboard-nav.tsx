"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  PlusCircle,
  Table2,
  BarChart3,
  ImageIcon,
  LogOut,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navItems = [
  { href: "/dashboard", label: "Registro", icon: PlusCircle },
  { href: "/dashboard/tabla", label: "Tabla", icon: Table2 },
  { href: "/dashboard/graficos", label: "Graficos", icon: BarChart3 },
  { href: "/dashboard/fotos", label: "Fotos", icon: ImageIcon },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:static md:border-t-0 md:border-b">
      <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2 md:max-w-6xl md:justify-center md:gap-8 md:py-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span>Salir</span>
        </button>
      </div>
    </nav>
  )
}
