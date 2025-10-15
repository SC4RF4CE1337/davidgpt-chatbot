module.exports = {
  theme: {
    extend: {
      keyframes: {
        bounce200: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        bounce400: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        bounce200: 'bounce200 0.6s infinite',
        bounce400: 'bounce400 0.6s infinite',
      },
    },
  },
  plugins: [],
}
