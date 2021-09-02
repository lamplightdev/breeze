import Wafer from 'https://cdn.skypack.dev/@lamplightdev/wafer@1.0.4';

class Header extends Wafer {
  static get template() {
    return `
      <div>Wafer - hi <span id="username"></span></div>
      <span id="a"></span>
    `;
  }

  static get props() {
    return {
      test: {
        type: String,
        targets: [
          {
            selector: '$#a',
            attribute: 'a',
          },
        ],
      },
      username: {
        type: String,
        initial: 'Chris',
        targets: [
          {
            selector: '$#username',
            text: true,
          },
        ],
      },
    };
  }
}
customElements.define('wafer-header', Header);
