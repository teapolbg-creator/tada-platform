const sharedPreset = require('@tada/config/tailwind.preset.js').default;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset'), sharedPreset],
  theme: {},
};
