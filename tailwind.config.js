/** @type {import('tailwindcss').Config} */
module.exports = {
  // Esta sección le dice a Tailwind dónde buscar sus clases para optimizar el CSS.
  // Es importante que apunte a todos los archivos que usan clases de Tailwind.
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Aquí podríamos extender la paleta de colores, fuentes, etc. en el futuro.
    extend: {},
  },
  // Aquí es donde añadimos los plugins que extienden la funcionalidad de Tailwind.
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
};
