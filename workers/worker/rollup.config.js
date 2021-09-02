import urlResolve from 'rollup-plugin-url-resolve'

export default [
  {
    input: 'index.js',
    output: [
      {
        dir: 'dist/',
        format: 'es',
      },
    ],
    plugins: [urlResolve()],
  },
]
