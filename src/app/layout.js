import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
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
        {/* 
          Componente Toaster para notificaciones en toda la aplicación.
          Lo configuramos para que aparezca en la esquina superior derecha
          y con estilos que coinciden con la paleta de colores del proyecto.
        */}
        <Toaster 
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#111827',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10B981', // Tailwind's green-500
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444', // Tailwind's red-500
                secondary: '#ffffff',
              },
            }
          }}
        />
        {children}
      </body>
    </html>
  );
}