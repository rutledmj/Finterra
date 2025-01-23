// pane.js

import { createElement } from '../Utils.js';
import { IndicatorPane } from './indicator-pane.js';
import { PriceAxisPane } from './price-axis-pane.js';

/**
 * A single "pane" in the chart. Displays:
 *  - An IndicatorPane (candlestick/line chart, etc.) on the left
 *  - A vertical 1px divider
 *  - A PriceAxisPane on the right
 */
export class Pane {
    /**
     * @param {object} options
     *   - width: number
     *   - height: number
     *   - stockData: array of bar data
     *   - barWidth, barSpacing, offset
     *   - priceAxisWidth: number (default 64)
     */
    constructor(options = {}) {
        this.width = options.width || 800;
        this.height = options.height || 200;
        this.stockData = options.stockData || [];

        this.barWidth = options.barWidth || 5;
        this.barSpacing = options.barSpacing || 2;
        this.offset = options.offset || 0;
        this.priceAxisWidth = options.priceAxisWidth || 64;

        // Container that holds everything
        this.container = null;

        // Sub-panes
        this.indicatorPane = null;
        this.priceAxisPane = null;

        this.initialize();
    }

    initialize() {
        // 1) Create a container div for the entire pane
        this.container = createElement('div', {
            className: 'chart-pane',
            style: {
                display: 'flex',
                flexDirection: 'row',
                width: `${this.width}px`,
                height: `${this.height}px`,
                boxSizing: 'border-box',
                position: 'relative'
            }
        });

        // 2) The main chart area (IndicatorPane)
        // We'll subtract priceAxisWidth + 1px for the vertical divider
        const indicatorWidth = this.width - this.priceAxisWidth - 1;
        this.indicatorPane = new IndicatorPane({
            width: indicatorWidth,
            height: this.height,
            barWidth: this.barWidth,
            barSpacing: this.barSpacing,
            offset: this.offset,
            stockData: this.stockData
        });

        // 3) Vertical 1px divider
        const verticalDivider = createElement('div', {
            style: {
                width: '1px',
                backgroundColor: 'var(--toolbar-border)'
            }
        });

        // 4) Price axis area (PriceAxisPane)
        // We pass mainChartWidth so price-axis can match the visible data subset
        this.priceAxisPane = new PriceAxisPane({
            width: this.priceAxisWidth,
            height: this.height,
            barWidth: this.barWidth,
            barSpacing: this.barSpacing,
            offset: this.offset,
            stockData: this.stockData,
            mainChartWidth: indicatorWidth
        });

        // 5) Append them side by side
        this.container.appendChild(this.indicatorPane.canvas);
        this.container.appendChild(verticalDivider);
        this.container.appendChild(this.priceAxisPane.canvas);
    }

    /**
     * Resize this Pane to newWidth/newHeight, then resize sub-panes.
     */
    resize(newWidth, newHeight) {
        this.width = newWidth;
        this.height = newHeight;

        // Update container's style
        this.container.style.width = `${newWidth}px`;
        this.container.style.height = `${newHeight}px`;

        // Recompute how wide the indicator area is
        const indicatorWidth = Math.max(0, newWidth - this.priceAxisWidth - 1);

        // Resize the indicator pane
        this.indicatorPane.resize(indicatorWidth, newHeight);

        // Update the price-axis' notion of mainChartWidth, then resize
        this.priceAxisPane.mainChartWidth = indicatorWidth;
        this.priceAxisPane.resize(this.priceAxisWidth, newHeight);
    }

    /**
     * Update the data in both sub-panes, then re-render.
     */
    updateData(newStockData) {
        this.stockData = newStockData;

        // Update sub-panes
        this.indicatorPane.updateData(newStockData);
        // Make sure the price-axis sees the same data
        this.priceAxisPane.updateData(newStockData);
    }
}
