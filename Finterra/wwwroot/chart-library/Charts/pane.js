// pane.js

import { createElement } from '../Utils.js';
import { IndicatorPane } from './indicator-pane.js';
import { PriceAxisPane } from './price-axis-pane.js';
// Import the Chart class so we can call Chart.computeDateTicks():
import { Chart } from './chart.js';

/**
 * A single "pane" in the chart. Displays:
 *  - An IndicatorPane (candlestick/line chart, etc.) on the left
 *  - A vertical 1px divider
 *  - A PriceAxisPane on the right
 * 
 * Also responsible for drawing *horizontal* gridlines (price) AND
 * optionally the *vertical* gridlines (dates) in the IndicatorPane area.
 */
export class Pane {
    constructor(options = {}) {
        this.width = options.width || 800;
        this.height = options.height || 200;
        this.stockData = options.stockData || [];

        this.barWidth = options.barWidth || 5;
        this.barSpacing = options.barSpacing || 2;
        this.offset = options.offset || 10;
        this.priceAxisWidth = options.priceAxisWidth || 64;

        // If you want to control how many vertical lines, set desiredTimeTicks:
        this.desiredTimeTicks = options.desiredTimeTicks || 5;

        // Container
        this.container = null;
        // Sub-panes
        this.indicatorPane = null;
        this.priceAxisPane = null;

        this.initialize();
    }

    initialize() {
        // Create container div for the entire pane
        this.container = createElement('div', {
            class: 'chart-pane',
            style: {
                display: 'flex',
                flexDirection: 'row',
                width: `${this.width}px`,
                height: `${this.height}px`,
                boxSizing: 'border-box',
                position: 'relative'
            }
        });

        // The main chart area (IndicatorPane)
        const indicatorWidth = this.width - this.priceAxisWidth - 1;
        this.indicatorPane = new IndicatorPane({
            width: indicatorWidth,
            height: this.height,
            barWidth: this.barWidth,
            barSpacing: this.barSpacing,
            offset: this.offset,
            stockData: this.stockData
        });

        // Vertical 1px divider
        const verticalDivider = createElement('div', {
            style: {
                width: '1px',
                backgroundColor: 'var(--toolbar-border)'
            }
        });

        // Price axis area (PriceAxisPane)
        this.priceAxisPane = new PriceAxisPane({
            width: this.priceAxisWidth,
            height: this.height,
            barWidth: this.barWidth,
            barSpacing: this.barSpacing,
            offset: this.offset,
            stockData: this.stockData,
            mainChartWidth: indicatorWidth
        });

        this.container.appendChild(this.indicatorPane.canvas);
        this.container.appendChild(verticalDivider);
        this.container.appendChild(this.priceAxisPane.canvas);
    }

    resize(newWidth, newHeight) {
        this.width = newWidth;
        this.height = newHeight;

        this.container.style.width = `${newWidth}px`;
        this.container.style.height = `${newHeight}px`;

        const indicatorWidth = Math.max(0, newWidth - this.priceAxisWidth - 1);
        this.indicatorPane.resize(indicatorWidth, newHeight);

        this.priceAxisPane.mainChartWidth = indicatorWidth;
        this.priceAxisPane.resize(this.priceAxisWidth, newHeight);

        // Re-render after resize
        this.render();
    }

    updateData(newStockData) {
        this.stockData = newStockData;
        this.indicatorPane.updateData(newStockData);
        this.priceAxisPane.updateData(newStockData);

        // Re-render
        this.render();
    }

    render() {
        const ctx = this.indicatorPane.context;
        if (!ctx) return;

        // 1) Clear the main canvas
        this.indicatorPane.clearCanvas();
        if (!this.stockData.length) return;

        // 2) Figure out which bars are visible
        const candleSpace = this.barWidth + this.barSpacing;
        const maxVisible = Math.floor(this.indicatorPane.width / candleSpace);
        const totalBars = this.stockData.length;
        const visibleBars = Math.min(totalBars, maxVisible);
        if (visibleBars <= 0) return;

        const startIndex = totalBars - visibleBars;
        const endIndex = totalBars - 1;

        // 3) Find min/max price among visible bars
        let minPrice = Number.MAX_VALUE;
        let maxPrice = Number.MIN_VALUE;
        for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.stockData[i];
            if (bar.low < minPrice) minPrice = bar.low;
            if (bar.high > maxPrice) maxPrice = bar.high;
        }
        if (minPrice === Number.MAX_VALUE || maxPrice === Number.MIN_VALUE) return;
        const priceRange = maxPrice - minPrice;

        // 4) Draw horizontal gridlines (price)
        this.drawHorizontalGridlines(ctx, minPrice, maxPrice, priceRange);

        // 5) Draw vertical gridlines (dates)
        this.drawVerticalGridlines(ctx, startIndex, endIndex);

        // 6) Finally, draw candlesticks on top
        this.indicatorPane.drawCandles(startIndex, endIndex, minPrice, maxPrice);
    }

    /**
     * Horizontal gridlines: uses "nice" price steps
     */
    drawHorizontalGridlines(ctx, minPrice, maxPrice, priceRange) {
        if (priceRange <= 0) return;
        const desiredTicks = 5;
        const rawStep = priceRange / (desiredTicks - 1);
        const niceStep = this.nicePriceStep(rawStep);

        const niceMin = Math.floor(minPrice / niceStep) * niceStep;
        const niceMax = Math.ceil(maxPrice / niceStep) * niceStep;

        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';

        for (let val = niceMin; val <= niceMax + 1e-9; val += niceStep) {
            if (val < minPrice || val > maxPrice) continue;
            const y = this.priceToY(val, minPrice, maxPrice);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.indicatorPane.width, y);
            ctx.stroke();
        }
        ctx.setLineDash([]); // reset
    }

    /**
     * Vertical gridlines: uses Chart.computeDateTicks().
     */
    drawVerticalGridlines(ctx, startIndex, endIndex) {
        // We'll get an array of { x, label, timeValue } from Chart
        const ticks = Chart.computeDateTicks(
            this.stockData,
            startIndex,
            endIndex,
            this.indicatorPane.width,
            this.barWidth,
            this.barSpacing,
            this.offset,
            this.desiredTimeTicks
        );

        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';

        for (const tick of ticks) {
            const x = tick.x;
            // draw a vertical line from top to bottom
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.indicatorPane.height);
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }

    priceToY(price, minPrice, maxPrice) {
        const chartHeight = this.indicatorPane.height * 0.95;
        const topPadding = (this.indicatorPane.height - chartHeight) / 2;
        const range = maxPrice - minPrice;
        if (range === 0) return this.indicatorPane.height / 2;

        return topPadding + (maxPrice - price) / range * chartHeight;
    }

    nicePriceStep(rawStep) {
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const scaled = rawStep / magnitude;
        let niceScaled;
        if (scaled < 1.5) {
            niceScaled = 1;
        } else if (scaled < 3) {
            niceScaled = 2;
        } else if (scaled < 7) {
            niceScaled = 5;
        } else {
            niceScaled = 10;
        }
        return niceScaled * magnitude;
    }
}
