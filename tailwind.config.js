/** @type {import('tailwindcss').Config} */
// Antes Tailwind se cargaba desde el CDN en index.html; esta es la misma
// configuración, compilada en el build (sin depender de internet).
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        navy: {
          700: '#1b2a4a',
          800: '#131f37',
          850: '#0e172e',
          900: '#0b132b',
          950: '#070c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        // Usada en las plantillas; no existe en Tailwind 3 por defecto.
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
};
