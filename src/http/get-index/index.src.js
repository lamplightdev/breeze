import arc from 'https://raw.githubusercontent.com/architect/functions-deno/main/src/index.js';

import 'https://cdn.spooky.click/ocean/1.2.5/shim.js?global';
import {
  Ocean,
  HydrateLoad,
} from 'https://cdn.spooky.click/ocean/1.2.5/mod.js';

import '../../../public/components/header.js';
import '../../../public/components/el.js';
import '../../../public/components/el2.js';

const { document } = globalThis;

const div = document.createElement('div');
div.textContent = '<strong>hi</strong>';

const { html, elements } = new Ocean({
  document,
  polyfillURL: '/_static/dsd.js',
  hydrators: [new HydrateLoad()],
});

// elements.set('wafer-header', '/_static/components/header.js');
elements.set('wafer-el', '/_static/components/el.js');
elements.set('wafer-el-2', '/_static/components/el2.js');

const bee = html`<wafer-header
  ocean-hydrate="load"
  username="Gary"
></wafer-header>`;

const iterator = html`
  <!DOCTYPE html>
  <html lang="en">
    <head> </head>
    <body>
      <div a="${`"a`}"></div>
      ${bee}
      <wafer-header
        ocean-hydrate="load"
        username="<strong>test</strong>"
        test='"a'
      ></wafer-header>

      <wafer-el count="5" ocean-hydrate="load"></wafer-el>
      <wafer-el-2 count="50" ocean-hydrate="load"></wafer-el-2>
    </body>
  </html>
`;

let code = '';
for await (let chunk of iterator) {
  code += chunk;
}

export const handler = arc.http.async((req) => {
  return {
    session: {
      blah: Date.now(),
    },
    statusCode: 200,
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    body: code,
  };
});
