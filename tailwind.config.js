// --- START OF FILE: tailwind.config.js (WITH OKLCH DISABLED) ---

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
    // --- CORRECCIÓN CLAVE: Se añade esta sección para desactivar oklch ---
    // Al redefinir los colores usando la paleta base de Tailwind,
    // forzamos al compilador a usar los valores RGB/HEX en lugar de OKLCH.
    // Esto asegura la compatibilidad con librerías como html2canvas.
    colors: {
      ...require('tailwindcss/colors')
    }
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
};