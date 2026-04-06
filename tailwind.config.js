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
        primary: { DEFAULT: '#1A3C6E', foreground: '#FFFFFF' },
        accent:  { DEFAULT: '#F5A623', foreground: '#FFFFFF' },
        success: '#1D9E75',
        warning: '#F5C518',
        danger:  '#E24B4A',
        info:    '#378ADD',
        bgLight:     '#F2F2F7',
        bgCard:      '#FFFFFF',
        bgDark:      '#1A1A2E',
        textPrimary:   '#1C1C1E',
        textSecondary: '#8E8E93',
        border:        '#E5E5EA',
        status: {
          lunas:      { bg: '#E1F5EE', text: '#085041', dot: '#1D9E75' },
          draft:      { bg: '#FFF3E0', text: '#633806', dot: '#F5A623' },
          jatuhTempo: { bg: '#FCEBEB', text: '#791F1F', dot: '#E24B4A' },
          terkirim:   { bg: '#E6F1FB', text: '#0C447C', dot: '#378ADD' },
          sph:        { bg: '#EEEDFE', text: '#3C3489', dot: '#534AB7' },
          suratHutang:{ bg: '#FAECE7', text: '#712B13', dot: '#D85A30' },
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card:    '20px',
        'card-lg': '28px',
        'card-xl': '36px',
        button:  '14px',
        input:   '12px',
        badge:   '20px',
        bento:   '24px',
        pill:    '999px',
      },
      boxShadow: {
        'ios':    '0 2px 20px rgba(0,0,0,0.06)',
        'ios-md': '0 4px 30px rgba(0,0,0,0.10)',
        'ios-lg': '0 8px 40px rgba(0,0,0,0.14)',
        'ios-inset': 'inset 0 1px 0 rgba(255,255,255,0.15)',
      },
      backdropBlur: {
        ios: '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
