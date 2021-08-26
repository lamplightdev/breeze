import 'https://cdn.spooky.click/ocean/1.2.1/shim.js?global';
import {
  Ocean,
  HydrateLoad,
} from 'https://cdn.spooky.click/ocean/1.2.1/mod.js';

import '../../../public/components/el.js';
import '../../../public/components/el2.js';

const { document } = globalThis;

console.log({ document });

const { html, elements } = new Ocean({
  document,
  polyfillURL: '/_static/dsd.js',
  hydrators: [new HydrateLoad()],
});

elements.set('wafer-el', '/_static/components/el.js');
elements.set('wafer-el-2', '/_static/components/el2.js');

let iterator = html`
  <!DOCTYPE html>
  <html lang="en">
    <title>My app</title>

    <wafer-el count="5" ocean-hydrate="load"></wafer-el>
    <wafer-el-2 count="50" ocean-hydrate="load"></wafer-el-2>
  </html>
`;

let code = '';
for await (let chunk of iterator) {
  code += chunk;
}

export async function handler(req) {
  return {
    statusCode: 200,
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    body: code,
  };
}
