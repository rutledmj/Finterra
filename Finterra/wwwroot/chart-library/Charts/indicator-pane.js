// indicator-pane.js
import { createElement } from '../Utils.js';

export class IndicatorPane {
    constructor(options = {}) {
        this.width = options.width || 300;
        this.height = options.height || 200;
        this.barWidth = options.barWidth || 5;
        this.barSpacing = options.barSpacing || 2;
        this.offset = options.offset || 0;
        this.stockData = options.stockData || [];

        this.canvas = null;
        this.context = null;
        this.initialize();
    }

    initialize() {
        this.canvas = createElement('canvas', {
            class: 'indicator-pane'
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
        // The parent Pane calls our drawCandles() after it draws gridlines
    }

    updateData(newStockData) {
        this.stockData = newStockData;
    }

    clearCanvas() {
        if (this.context) {
            this.context.clearRect(0, 0, this.width, this.height);
        }
    }

    /**
     * Draw candlesticks for the visible bars [startIndex..endIndex],
     * using minPrice..maxPrice to map candle heights.
     */
    drawCandles(startIndex, endIndex, minPrice, maxPrice) {
        const ctx = this.context;
        if (!ctx) return;

        const totalBars = this.stockData.length;
        if (!totalBars) return;
        if (startIndex < 0 || endIndex >= totalBars) return;

        const candleSpace = this.barWidth + this.barSpacing;
        const priceRange = maxPrice - minPrice;
        if (priceRange <= 0) return;

        const chartHeight = this.height * 0.95;
        const topPadding = (this.height - chartHeight) / 2;

        let xPos = this.width - this.barWidth - this.offset;
        for (let i = endIndex; i >= startIndex; i--) {
            const { open, high, low, close } = this.stockData[i];

            const yHigh = topPadding + (maxPrice - high) / priceRange * chartHeight;
            const yLow = topPadding + (maxPrice - low) / priceRange * chartHeight;
            const yOpen = topPadding + (maxPrice - open) / priceRange * chartHeight;
            const yClose = topPadding + (maxPrice - close) / priceRange * chartHeight;

            const isBullish = (close >= open);
            ctx.strokeStyle = isBullish ? '#26a69a' : '#ef5350';
            ctx.fillStyle = isBullish ? '#26a69a' : '#ef5350';

            // Wick
            ctx.beginPath();
            ctx.moveTo(xPos + this.barWidth / 2, yHigh);
            ctx.lineTo(xPos + this.barWidth / 2, yLow);
            ctx.stroke();

            // Body
            const rectY = Math.min(yOpen, yClose);
            const rectH = Math.abs(yClose - yOpen);
            if (rectH < 1) {
                ctx.fillRect(xPos, rectY, this.barWidth, 1);
            } else {
                ctx.fillRect(xPos, rectY, this.barWidth, rectH);
            }

            xPos -= candleSpace;
        }
    }
}
