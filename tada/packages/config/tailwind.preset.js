/**
 * Shared Tailwind preset for all TADA web apps and (via NativeWind) mobile apps.
 * Defines the TADA design tokens.
 */

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        // Brand
        tada: {
          50: '#FFEBEC',
          100: '#FFC9CB',
          200: '#FF9CA0',
          400: '#FF4248',
          500: '#E1252C',
          600: '#B81A20',
          800: '#771013',
          900: '#4D0A0C',
        },
        // Semantic status colors (mapped to trip status tones)
        status: {
          neutral: '#6B7280',
          info: '#2563EB',
          progress: '#D97706',
          success: '#16A34A',
          warning: '#CA8A04',
          danger: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        button: '12px',
      },
    },
  },
};
