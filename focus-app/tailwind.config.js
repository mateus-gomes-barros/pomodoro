/** @type {import('tailwindcss').Config} */
export default {
    theme: {
      extend: {
        colors: {
          bg: {
            primary: '#0A0A0A',
            card: '#161616',
            secondary: '#1E1E1E',
            elevated: '#242424',
          },
          accent: {
            white: '#F5F5F5',
            muted: '#A0A0A0',
            subtle: '#6A6A6A',
            green: '#7EE081',
            'green-dim': '#4A8A4D',
            red: '#E07E7E',
            orange: '#E0A87E',
            blue: '#7EA8E0',
          },
          border: {
            subtle: '#2A2A2A',
            muted: '#333333',
          },
        },
  
        fontFamily: {
          sans: [
            '-apple-system',
            'BlinkMacSystemFont',
            'SF Pro Display',
            'Inter',
            'system-ui',
            'sans-serif',
          ],
  
          mono: [
            'SF Mono',
            'Fira Code',
            'monospace',
          ],
        },
  
        boxShadow: {
          card: '0 1px 3px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)',
          'card-hover':
            '0 4px 12px rgba(0,0,0,0.6), 0 16px 40px rgba(0,0,0,0.4)',
          float: '0 20px 60px rgba(0,0,0,0.6)',
          glow: '0 0 20px rgba(126,224,129,0.15)',
        },
      },
    },
  }