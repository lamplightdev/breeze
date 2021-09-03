import '../../../ocean/lib/shim-node.js'
import {
  HydrateLoad,
  Ocean,
} from 'https://cdn.spooky.click/ocean/1.2.5/mod.bundle.js'

import '../../public/components/header.js'
import '../../public/components/el.js'
import '../../public/components/el2.js'

export default {
  // * request is the same as `event.request` from the service worker format
  // * waitUntil() and passThroughOnException() are accessible from `ctx` instead of `event` from the service worker format
  // * env is where bindings like KV namespaces, Durable Object namespaces, Config variables, and Secrets
  // are exposed, instead of them being placed in global scope.
  async fetch(request, env, ctx) {
    const div = document.createElement('div')
    div.textContent = '<strong>hi</strong>'

    const { html, elements } = new Ocean({
      document,
      hydrators: [new HydrateLoad()],
    })

    elements.set('wafer-header', '/el-7baae73c.js')
    elements.set('wafer-el', '/_static/components/el.js')
    elements.set('wafer-el-2', '/_static/components/el2.js')

    const bee = html`
      <wafer-header ocean-hydrate="load" username="Gary"></wafer-header>
    `

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
    `

    let code = ''
    for await (let chunk of iterator) {
      code += chunk
    }

    const headers = { 'Content-Type': 'text/html;charset=UTF-8' }
    return new Response(code, { headers })
  },
}
