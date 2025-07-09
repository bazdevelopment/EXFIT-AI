const colors = require('./src/components/ui/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter'],
        'primary-poppins': 'Font-Regular', // For `font-medium`
        'semibold-poppins': 'Font-SemiBold', // For `font-semibold`
        'bold-poppins': 'Font-Bold', // For `font-bold`
        'light-poppins': 'Font-Light', // For "font-light"
        'medium-poppins': 'Font-Medium', // For "medium-poppins"
        'extra-bold-poppins': 'Font-Extra-Bold',
      },
      colors,
    },
  },
  plugins: [],
};
