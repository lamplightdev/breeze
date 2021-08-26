import Wafer from 'https://cdn.skypack.dev/@lamplightdev/wafer@1.0.4';

class MyElement extends Wafer {
  static get template() {
    return `
    Hi!
      <span id="count"></span>
      <button id="dec">-</button>
      <button id="inc">+</button>
    `;
  }

  static get props() {
    return {
      count: {
        type: Number,
        reflect: true,
        initial: 10,
        targets: [
          {
            selector: '$#count',
            text: true,
          },
        ],
      },
    };
  }

  get events() {
    return {
      '$#dec': {
        click: () => this.count--,
      },
      '$#inc': {
        click: () => this.count++,
      },
    };
  }
}
customElements.define('wafer-el-2', MyElement);
