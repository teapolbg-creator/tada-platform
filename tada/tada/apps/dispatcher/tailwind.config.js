const sharedPreset = require('@tada/config/tailwind.preset.js').default;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  presets: [sharedPreset],
};
