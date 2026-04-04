/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // DokaGen Design System — Section 2.1
        primary: {
          DEFAULT: '#1A3C6E',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F5A623',
          foreground: '#FFFFFF',
        },
        success: '#1D9E75',
        warning: '#F5C518',
        danger: '#E24B4A',
        info: '#378ADD',
        bgLight: '#F4F4F8',
        bgDark: '#1A1A2E',
        textPrimary: '#1A1A2E',
        textSecondary: '#9898A8',
        // Status badge colors
        status: {
          lunas: { bg: '#E1F5EE', text: '#085041', dot: '#1D9E75' },
          draft: { bg: '#FAEEDA', text: '#633806', dot: '#F5A623' },
          jatuhTempo: { bg: '#FCEBEB', text: '#791F1F', dot: '#E24B4A' },
          terkirim: { bg: '#E6F1FB', text: '#0C447C', dot: '#378ADD' },
          sph: { bg: '#EEEDFE', text: '#3C3489', dot: '#534AB7' },
          suratHutang: { bg: '#FAECE7', text: '#712B13', dot: '#D85A30' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        'card-lg': '20px',
        button: '12px',
        input: '10px',
        badge: '20px',
      },
    },
  },
  plugins: [],
};
