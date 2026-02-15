import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "FitTracker - Tu Evolución Fitness",
  description:
    "Seguimiento diario de métricas fitness: peso, grasa corporal, masa muscular, sueño, pasos y más.",
}

export const viewport: Viewport = {
  themeColor: "#0f1318",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={_inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
