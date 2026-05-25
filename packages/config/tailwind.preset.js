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
        // Dispatcher app brand — purple (visually distinct from the
        // patient app's red, since dispatchers are operators not patients)
        dispatch: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          400: '#A855F7',
          500: '#9333EA',
          600: '#7E22CE',
          800: '#581C87',
          900: '#3B0764',
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
