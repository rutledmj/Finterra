export class Divider {
    constructor(options) {
        this.toolbar = options.toolbar;
        this.initialize();
    }

    initialize() {
        const divider = document.createElement("span");

        Object.assign(divider, {
            style: `height:100%;border-right:1px solid var(--toolbar-border); padding:5px 0px; margin:auto 4px`
        });

        this.toolbar.container.appendChild(divider);
    }
}