import 'https://cdn.spooky.click/ocean/1.2.1/shim.js?global';
import {
  Ocean,
  HydrateLoad,
} from 'https://cdn.spooky.click/ocean/1.2.1/mod.js';

import './vendor/views/components/el.js';

const { document } = globalThis;

const { html, elements } = new Ocean({
  document,
  polyfillURL: '/_static/dsd.js',
  hydrators: [new HydrateLoad()],
});

elements.set('wafer-el', '/_static/components/el.dist.js');

let iterator = html`
  <!DOCTYPE html>
  <html lang="en">
    <title>My app</title>

    <wafer-el count="5" ocean-hydrate="load"></wafer-el>
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
