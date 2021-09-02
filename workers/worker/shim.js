import '../../../ocean/lib/shim.bundle.js'

const root = globalThis[Symbol.for('dom-shim.defaultView')]
const { HTMLElement, customElements, document } = root

globalThis.HTMLElement = HTMLElement
globalThis.customElements = customElements
globalThis.document = document
