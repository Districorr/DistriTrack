// --- START OF FILE: src/app/layout.js (SYNTAX FIXED) ---

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DistriTrack - Gestión de Pedidos",
  description: "Plataforma para la gestión y trazabilidad de pedidos de materiales quirúrgicos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
// --- CORREGIDO: Se eliminó la llave de cierre extra que causaba el error de sintaxis ---
