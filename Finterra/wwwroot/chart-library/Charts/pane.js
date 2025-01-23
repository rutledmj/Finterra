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

        this.scrollIndex = 0;

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

    // Called by Chart when the user hits ArrowLeft/ArrowRight
    setScrollIndex(newScrollIndex) {
        this.scrollIndex = newScrollIndex;
        this.priceAxisPane.scrollIndex = newScrollIndex;
        this.render();
    }

    render() {
        const ctx = this.indicatorPane.context;
        if (!ctx) return;

        this.indicatorPane.clearCanvas();
        if (!this.stockData.length) return;

        // 1) Figure out how many bars fit horizontally
        const candleSpace = this.barWidth + this.barSpacing;
        const maxVisible = Math.floor(this.indicatorPane.width / candleSpace);
        const totalBars = this.stockData.length;

        const visibleBars = Math.min(totalBars, maxVisible);
        if (visibleBars <= 0) return;

        // 2) The rightmost bar index = (totalBars - 1) - scrollIndex
        let rightMostIndex = totalBars - 1 - this.scrollIndex;
        if (rightMostIndex < 0) {
            rightMostIndex = 0; // clamp if we overshot
        }

        // startIndex is 'rightMostIndex - (visibleBars - 1)'
        let startIndex = rightMostIndex - (visibleBars - 1);
        if (startIndex < 0) {
            startIndex = 0; // clamp
        }

        // 3) Find minPrice / maxPrice among these bars
        let minPrice = Number.MAX_VALUE;
        let maxPrice = Number.MIN_VALUE;
        for (let i = startIndex; i <= rightMostIndex; i++) {
            const bar = this.stockData[i];
            if (bar.low < minPrice) minPrice = bar.low;
            if (bar.high > maxPrice) maxPrice = bar.high;
        }
        if (minPrice === Number.MAX_VALUE || maxPrice === Number.MIN_VALUE) return;
        const priceRange = maxPrice - minPrice;

        // 4) Draw horizontal gridlines
        this.drawHorizontalGridlines(ctx, minPrice, maxPrice, priceRange);

        // 5) Draw vertical gridlines (dates) by calling Chart.computeDateTicks()
        this.drawVerticalGridlines(ctx, startIndex, rightMostIndex);

        // 6) Finally, draw candlesticks
        this.indicatorPane.drawCandles(startIndex, rightMostIndex, minPrice, maxPrice);

        this.priceAxisPane.render();
    }

    setBarSize(newBarWidth, newBarSpacing) {
        this.barWidth = newBarWidth;
        this.barSpacing = newBarSpacing;

        // Update sub-panes
        this.indicatorPane.barWidth = newBarWidth;
        this.indicatorPane.barSpacing = newBarSpacing;

        this.priceAxisPane.barWidth = newBarWidth;
        this.priceAxisPane.barSpacing = newBarSpacing;

        // Re-render with the new settings
        this.render();
    }


    /**
     * Horizontal gridlines: uses "nice" price steps
     */
    // ~~~~ Same as your previous logic, just referencing startIndex..endIndex ~~~~
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
        ctx.setLineDash([]);
    }

    drawVerticalGridlines(ctx, startIndex, endIndex) {
        // Use chart.js static method
        const ticks = Chart.computeDateTicks(
            this.stockData,
            startIndex,
            endIndex,
            this.indicatorPane.width,
            this.barWidth,
            this.barSpacing,
            this.offset,
            5 // desiredTimeTicks
        );

        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';

        for (const tick of ticks) {
            ctx.beginPath();
            ctx.moveTo(tick.x, 0);
            ctx.lineTo(tick.x, this.indicatorPane.height);
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
