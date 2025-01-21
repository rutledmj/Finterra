import { Chart } from './Charts/chart.js';
import { Interval, createElement } from './Utils.js'

export class Workspace {
    constructor(options) {
        this.flex = options.flex;
        this.position = options.position;
        this.style = options.style;
        this.parent = options.container;

        this.initialize();
    }

    height = 38;
    width = 38;
    padding = 4;

    initialize() {
        this.container = this.createWorkspace();
        this.parent.appendChild(this.container);

        this.charts = [
            new Chart({
                symbol: 'GOOG',
                interval: new Interval(233, 'm'),
                depth: 100,
                workspace: this
            })
        ];
    }

    createWorkspace() {
        let div = createElement('div', '', { border: '1px solid var(--workspace-border)'});
        div.className = `flex-workspace`;

        const styles = this.getToolbarStyles();
        Object.assign(div.style, styles);

        return div;
    }

    getToolbarStyles() {
        return {
            backgroundColor: 'transparent',
            width: '100%',
            height: '100%',
            borderRadius: '4px'
        };
    }
}