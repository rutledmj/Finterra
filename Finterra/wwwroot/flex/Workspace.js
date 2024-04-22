import { Chart } from './Chart.js';
import { Interval } from './Utils.js'

export class Workspace {
    constructor(options) {
        this.flex = options.flex;
        this.position = options.position;
        this.style = options.style;
        this.parent = options.parent;

        this.initialize();
    }

    height = 38;
    width = 38;
    padding = 4;

    initialize() {
        this.container = this.createWorkspace();
        this.parent.appendChild(this.container);

        //this.appendCharts();

        this.charts = [
            new Chart({
                symbol: 'GOOG',
                interval: new Interval(233, 'm'),
                depth: 100,
                workspace: this
            })
        ];
    }

    appendCharts() {
        if (this.charts)
            for (let chart of this.charts) {
                //chart.appendTo(this.container);
            }
    }

    createWorkspace() {
        let div = document.createElement('div');
        div.className = `flex-workspace`;

        const styles = this.getToolbarStyles();
        Object.assign(div.style, styles);

        return div;
    }

    getToolbarStyles() {
        const commonStyles = {
            backgroundColor: 'white',
            position: 'absolute',
        };

        const width = this.flex.container.clientWidth;
        const height = this.flex.container.clientHeight;

        return {
            ...commonStyles,
            top: `${this.height + this.padding}px`,
            left: `${this.width + this.padding}px`,
            width: `${this.flex.container.clientWidth - (this.width * 2) - (this.padding * 2)}px`,
            height: `${this.flex.container.clientHeight - (this.height * 2) - (this.padding * 2)}px`,
            borderRadius: '3px'
        };
    }
}