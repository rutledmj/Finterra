// chart.js

import { Window } from '../components.js';  // Your updated window class
import { Pane } from './pane.js';
import { DateAxisPane } from './date-axis-pane.js';
import { Interval } from './interval.js';
import { createElement } from '../Utils.js';

export class Chart extends Window {
    constructor(options = {}) {
        // 1) Create a container for our chart's body
        const chartContainer = createElement('div', {
            class: 'chart-container',
            style: {
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden'
            }
        });

        // 2) Pass relevant options (including 'body') to the Window constructor
        super({
            ...options,
            body: chartContainer,
            title: options.title || 'Stock Chart'
        });

        // 3) Chart-specific fields
        this.stock = options.stock || 'AAPL';
        this.interval = options.interval || new Interval(1, 'day', '1 Day');
        this.barWidth = options.barWidth || 5;
        this.barSpacing = options.barSpacing || 2;
        this.offset = options.offset || 10;
        this.numPanes = options.panes || 1;

        // Data arrays
        this.rawData = [];
        this.processedData = [];

        // Pane references
        this.panes = [];
        this.dateAxisPane = null;
        this.dateAxisHeight = 32; // fixed date-axis height

        // At this point, the parent Window constructor has ALREADY
        // appended the modal + chartContainer to the DOM.
        // But we can't measure it instantly, so we wait 1 frame:
        requestAnimationFrame(() => {
            this.postInit();
        });
    }

    /**
     * Called 1 frame after the parent Window has appended everything to the DOM.
     * We can now measure .body size, build panes, and fetch data.
     */
    postInit() {
        // 1) Measure the .body size
        const { width: bodyWidth, height: bodyHeight } = this.getBodyDimensions();

        // 2) Build the chart layout (panes, date axis)
        this.initChartLayout(bodyWidth, bodyHeight);

        // 3) Fetch data and render
        this.fetchAndRender();
    }

    /**
     * Utility: measure the .body container's current size in the DOM.
     */
    getBodyDimensions() {
        // this.body is the chartContainer we passed to the Window constructor
        const rect = this.body.getBoundingClientRect();
        return {
            width: Math.floor(rect.width),
            height: Math.floor(rect.height)
        };
    }

    /**
     * Creates N stacked panes + 1px divider after each + bottom date axis
     */
    initChartLayout(containerWidth, containerHeight) {
        // totalDividers = N (one after each pane)
        const totalDividers = this.numPanes;
        // eachPaneHeight = floor((containerHeight - dateAxisHeight - totalDividers) / N)
        const eachPaneHeight = Math.floor(
            (containerHeight - this.dateAxisHeight - totalDividers) / this.numPanes
        );

        for (let i = 0; i < this.numPanes; i++) {
            const pane = new Pane({
                width: containerWidth,
                height: eachPaneHeight,
                stockData: this.processedData,
                barWidth: this.barWidth,
                barSpacing: this.barSpacing,
                offset: this.offset,
                priceAxisWidth: 64
            });
            this.panes.push(pane);

            // Add the pane container
            this.body.appendChild(pane.container);

            // Add a 1px divider after each pane
            const divider = createElement('div', {
                style: {
                    width: '100%',
                    height: '1px',
                    backgroundColor: 'var(--toolbar-border)'
                }
            });
            this.body.appendChild(divider);
        }

        // The DateAxisPane at the bottom
        this.dateAxisPane = new DateAxisPane({
            width: this.width,
            height: 32,
            stockData: this.processedData,
            barWidth: this.barWidth,
            barSpacing: this.barSpacing,
            offset: this.offset,
            mainChartWidth: (this.width - this.priceAxisWidth - 1),
            interval: this.interval


        });
        this.body.appendChild(this.dateAxisPane.canvas);
    }

    /**
     * Called automatically after the window's size changes
     * (if you do `if (typeof this.resize==='function') this.resize(...)`
     * in window.js handleResizeMouseMove).
     */
    resize(newWidth, newHeight) {
        // We can measure the body container again
        const { width: bodyWidth, height: bodyHeight } = this.getBodyDimensions();

        const totalDividers = this.numPanes;
        const eachPaneHeight = Math.floor(
            (bodyHeight - this.dateAxisHeight - totalDividers) / this.numPanes
        );

        // Resize each Pane
        for (const pane of this.panes) {
            pane.resize(bodyWidth, eachPaneHeight);
        }

        // Resize the DateAxis
        if (this.dateAxisPane) {
            this.dateAxisPane.resize(bodyWidth, this.dateAxisHeight);
        }
    }

    async fetchAndRender() {
        try {
            this.rawData = this.generateMockData(1000);
            this.processedData = this.compileData(this.rawData);
            this.updateAllPanes();
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    }

    compileData(rawData) {
        return rawData;
    }

    updateAllPanes() {
        for (const pane of this.panes) {
            pane.updateData(this.processedData);
        }
        if (this.dateAxisPane) {
            this.dateAxisPane.updateData(this.processedData);
        }
    }

    generateMockData(count) {
        let price = 1000;
        const data = [];

        // Start from today's date (can be changed to any date)
        let currentDate = new Date();

        for (let i = 0; i < count; i++) {
            const open = price;
            const close = open + (Math.random() - 0.5) * 2;
            const high = Math.max(open, close) + Math.random();
            const low = Math.min(open, close) - Math.random();
            price = close;

            // Convert current date to a timestamp (in seconds).
            // Some charting libraries expect time in seconds, others in milliseconds, or even a Date object.
            // Adjust accordingly if your library requires a different format.
            const timestamp = new Date(currentDate);

            data.push({
                time: timestamp,
                open,
                high,
                low,
                close,
                volume: Math.floor(Math.random() * 10000)
            });

            // Move to the next day (change as needed for your time increments)
            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log(data);

        return data;
    }

}
