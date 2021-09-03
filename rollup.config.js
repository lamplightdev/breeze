import urlResolve from 'rollup-plugin-url-resolve';

export default [
  {
    input: 'src/http/get-index/ssr.mjs',
    output: [
      {
        file: 'src/http/get-index/ssr.js',
        format: 'cjs',
        exports: 'default',
      },
    ],
    plugins: [urlResolve()],
  },
];
