// price-axis-pane.js

import { createElement } from '../Utils.js';

export class PriceAxisPane {
    constructor(options = {}) {
        this.width = options.width || 64;
        this.height = options.height || 200;
        this.barWidth = options.barWidth || 5;
        this.barSpacing = options.barSpacing || 2;
        this.offset = options.offset || 0;
        this.mainChartWidth = options.mainChartWidth || 300;
        this.stockData = options.stockData || [];
        this.scrollIndex = 0;

        this.canvas = null;
        this.context = null;

        this.initialize();
    }

    initialize() {
        this.canvas = createElement('canvas', {
            class: 'price-axis-pane'
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

    setScrollIndex(newScrollIndex) {
        this.scrollIndex = newScrollIndex;
        this.render();
    }

    // Called by Chart when zoom changes
    setBarSize(newBarWidth, newBarSpacing) {
        this.barWidth = newBarWidth;
        this.barSpacing = newBarSpacing;
        // re-render
        this.render();
    }

    render() {
        const ctx = this.context;
        if (!ctx) return;
        ctx.clearRect(0, 0, this.width, this.height);

        const totalBars = this.stockData.length;
        if (totalBars === 0) return;

        const candleSpace = this.barWidth + this.barSpacing;
        const maxVisible = Math.floor(this.mainChartWidth / candleSpace);
        const visibleBars = Math.min(totalBars, maxVisible);
        if (visibleBars <= 0) return;

        let rightMostIndex = totalBars - 1 - this.scrollIndex;
        if (rightMostIndex < 0) rightMostIndex = 0;

        const startIndex = rightMostIndex - (visibleBars - 1);
        const endIndex = totalBars - 1;

        let minPrice = Number.MAX_VALUE;
        let maxPrice = Number.MIN_VALUE;
        for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.stockData[i];
            if (bar.low < minPrice) minPrice = bar.low;
            if (bar.high > maxPrice) maxPrice = bar.high;
        }
        if (minPrice === Number.MAX_VALUE || maxPrice === Number.MIN_VALUE) return;

        const range = maxPrice - minPrice;
        if (range <= 0) {
            // Just a single line in the middle
            this.drawTick(ctx, minPrice, 0.5 * this.height, minPrice);
            return;
        }

        const tickCount = 5;
        const rawStep = range / (tickCount - 1);
        const niceStep = this.niceStep(rawStep);

        const niceMin = Math.floor(minPrice / niceStep) * niceStep;
        const niceMax = Math.ceil(maxPrice / niceStep) * niceStep;

        let val = niceMin;
        while (val <= niceMax + 1e-9) {
            if (val >= minPrice && val <= maxPrice) {
                const y = this.priceToY(val, minPrice, maxPrice);
                this.drawTick(ctx, val, y, minPrice);
            }
            val += niceStep;
        }
    }

    drawTick(ctx, price, y, minPrice) {
        // short horizontal line
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(4, y);
        ctx.strokeStyle = '#666';
        ctx.stroke();

        // label
        const label = this.formatPrice(price);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#ccc';
        ctx.textAlign = 'center';
        ctx.textBaseline = "middle";
        ctx.fillText(label, this.width / 2, y);
    }

    priceToY(price, minPrice, maxPrice) {
        const chartHeight = this.height * 0.95;
        const topPadding = (this.height - chartHeight) / 2;
        const range = maxPrice - minPrice;
        if (range === 0) return this.height / 2;
        return topPadding + (maxPrice - price) / range * chartHeight;
    }

    niceStep(rawStep) {
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

    formatPrice(price) {
        return price.toFixed(2);
    }
}
