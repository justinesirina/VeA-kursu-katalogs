/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vea: {
          green:          '#007B4D',
          'green-dark':   '#005C39',
          'green-light':  '#E6F3EE',
          orange:         '#E95614',
          'orange-light': '#FDF0EA',
          neutral:        '#464F4D',
          bg:             '#EEEEEE',
          text:           '#333333',
        },
      },
      fontFamily: {
        heading: ['"Exo 2"', '"Open Sans"', 'sans-serif'],
        body:    ['"Source Sans Pro"', '"Open Sans"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
