import { Chart } from './Charts/chart.js';
import { Interval, createElement } from './Utils.js';

/**
 * The Workspace class is the main area where charts or other
 * large content components live.
 */
export class Workspace {
    /**
     * @param {Object} options
     * @param {Object} options.flex - Reference to the main Finterra instance
     * @param {HTMLElement} options.container - The DOM node where the workspace is appended
     * @param {Object} [options.style] - Optional style overrides
     */
    constructor(options) {
        if (!options.container) {
            throw new Error("Workspace: 'container' option is required.");
        }

        this.flex = options.flex;
        this.parent = options.container;
        this.style = options.style || {};

        // Default dimension props (if needed)
        this.height = 38;
        this.width = 38;
        this.padding = 4;

        // Holds your Chart instances
        this.charts = [];

        this.container = null;
        this._init();
    }

    /**
     * Internal init method to set up the workspace DOM element.
     */
    _init() {
        this.container = this._createWorkspace();
        this.parent.appendChild(this.container);

        // Example: create initial chart(s)
        this._createInitialCharts();
    }

    /**
     * Creates the main workspace DOM element.
     */
    _createWorkspace() {
        const div = createElement('div', {
            class: 'flex-workspace',
            id: 'workspace',
            style: `border:1px solid var(--workspace-border);
            background-color:var(--workspace-border);
            width:100%;
            height:100%;
            border-radius:4px;
            position:relative;
            overflow:auto`
        });

        return div;
    }

    /**
     * Creates initial charts in the workspace.
     * You can adapt this logic or remove it if you want to add charts dynamically later.
     */
    _createInitialCharts() {
        // Example: add one chart
        //const initialChart = new Chart({
        //    symbol: 'GOOG',
        //    interval: new Interval(233, 'm'),
        //    depth: 100,
        //    workspace: this
        //});

        //this.charts.push(initialChart);
    }

    /**
     * Programmatic method to add a chart at runtime.
     */
    addChart(chartOptions) {
        //const chart = new Chart({
        //    ...chartOptions,
        //    workspace: this
        //});
        //this.charts.push(chart);
    }

    /**
     * Optional teardown method if you need to remove DOM or event listeners.
     */
    destroy() {
        // If your Chart class has a destroy method, call it on each chart
        for (const chart of this.charts) {
            // chart.destroy();
        }
        this.charts = [];

        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
    }
}
