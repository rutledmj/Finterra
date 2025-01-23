// price-axis-pane.js

import { createElement } from '../Utils.js';

export class PriceAxisPane {
    /**
     * @param {object} options
     *   - width: number (e.g., 64)
     *   - height: number
     *   - barWidth, barSpacing, offset
     *   - mainChartWidth: number (the actual width of the IndicatorPane)
     *   - stockData: array of bar/candle data
     */
    constructor(options = {}) {
        this.width = options.width || 64;
        this.height = options.height || 200;

        // These match the IndicatorPane settings
        this.barWidth = options.barWidth || 5;
        this.barSpacing = options.barSpacing || 2;
        this.offset = options.offset || 0;

        // The main chart area width, used for counting how many bars are visible
        this.mainChartWidth = options.mainChartWidth || 300;

        this.stockData = options.stockData || [];

        // Canvas
        this.canvas = null;
        this.context = null;

        this.initialize();
    }

    initialize() {
        this.canvas = createElement('canvas', {
            className: 'price-axis-pane'
        });
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext('2d');
    }

    resize(newWidth, newHeight) {
        this.width = newWidth;
        this.height = newHeight;
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.render();
    }

    updateData(newStockData) {
        this.stockData = newStockData;
        this.render();
    }

    /**
     * Renders the price-axis using "nice" round ticks.
     * We replicate the logic from IndicatorPane for the "visible" subset of bars.
     */
    render() {
        const ctx = this.context;
        if (!ctx) return;

        ctx.clearRect(0, 0, this.width, this.height);

        if (this.stockData.length === 0) return;

        // 1) Figure out how many bars are visible in the main chart
        const candleSpace = this.barWidth + this.barSpacing;
        const maxVisible = Math.floor(this.mainChartWidth / candleSpace);

        const totalBars = this.stockData.length;
        const visibleBars = Math.min(totalBars, maxVisible);
        const startIndex = totalBars - visibleBars;
        const endIndex = totalBars - 1;

        // 2) Find min & max among the visible subset
        let minPrice = Number.MAX_VALUE;
        let maxPrice = Number.MIN_VALUE;
        for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.stockData[i];
            if (bar.low < minPrice) minPrice = bar.low;
            if (bar.high > maxPrice) maxPrice = bar.high;
        }
        if (minPrice === Number.MAX_VALUE || maxPrice === Number.MIN_VALUE) return;

        // 3) Compute a "nice" range using the niceNumber algorithm
        // We'll aim for about 5 ticks
        const tickCount = 5;
        const range = maxPrice - minPrice;

        // If range is zero, avoid divide-by-zero
        if (range <= 0) {
            // Just draw a single line
            this.drawTick(ctx, minPrice, minPrice, minPrice, 0);
            return;
        }

        // Step 1: compute a "raw" step
        const rawStep = range / (tickCount - 1);

        // Step 2: "nice" step
        const niceStep = this.niceStep(rawStep);

        // Step 3: round min & max to multiples of that step
        const niceMin = Math.floor(minPrice / niceStep) * niceStep;
        const niceMax = Math.ceil(maxPrice / niceStep) * niceStep;

        // Now we iterate from niceMin to niceMax by step
        let val = niceMin;
        while (val <= niceMax + 1e-9) { // floating precision
            const y = this.priceToY(val, minPrice, maxPrice);
            this.drawTick(ctx, val, minPrice, maxPrice, y);
            val += niceStep;
        }
    }

    /**
     * Draws a single tick line & label at a given price value
     */
    drawTick(ctx, price, minPrice, maxPrice, y) {
        // (Optional) draw a horizontal line across the entire axis
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(4, y);
        ctx.strokeStyle = '#666';
        ctx.stroke();

        // Label
        const label = this.formatPrice(price);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#ccc';
        ctx.textAlign = 'center';
        ctx.textBaseline = "middle"; 
        // Position the text near the right edge
        ctx.fillText(label, this.width / 2, y);
    }

    /**
     * Convert price -> y coordinate, matching ~95% vertical usage
     */
    priceToY(price, minPrice, maxPrice) {
        const chartHeight = this.height * 0.95;
        const topPadding = (this.height - chartHeight) / 2;
        const range = maxPrice - minPrice;
        if (range === 0) return this.height / 2;
        return topPadding + (maxPrice - price) / range * chartHeight;
    }

    /**
     * Produces a "nice" step for axis ticks from a raw step.
     * Typical approach: find magnitude = 10^floor(log10(rawStep)), scale rawStep
     * and pick from {1, 2, 5, 10} then rescale.
     */
    niceStep(rawStep) {
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const scaled = rawStep / magnitude; // e.g. 2.3, 5.2, 0.9, etc.

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

    /**
     * Format the price. You could do .toLocaleString() or more advanced rounding.
     */
    formatPrice(price) {
        return price.toFixed(2);
    }
}
