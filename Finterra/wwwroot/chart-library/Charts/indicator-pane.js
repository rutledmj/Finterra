// indicator-pane.js

import { createElement } from '../Utils.js';

export class IndicatorPane {
    constructor(options = {}) {
        this.width = options.width || 300;
        this.height = options.height || 200;

        this.barWidth = options.barWidth || 5;
        this.barSpacing = options.barSpacing || 2;
        this.offset = options.offset || 0;  // horizontal offset at the right edge
        this.stockData = options.stockData || [];

        // Desired number of time ticks; must match date-axis if you want identical spacing
        this.desiredTimeTicks = options.desiredTimeTicks || 5;
        // For price lines
        this.desiredPriceTicks = options.desiredPriceTicks || 5;

        this.canvas = null;
        this.context = null;
        this.initialize();
    }

    initialize() {
        this.canvas = createElement('canvas', {
            className: 'indicator-pane'
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

    render() {
        const ctx = this.context;
        if (!ctx) return;

        ctx.clearRect(0, 0, this.width, this.height);

        const totalBars = this.stockData.length;
        if (totalBars === 0) return;

        // 1) Visible bars logic (rightmost subset)
        const candleSpace = this.barWidth + this.barSpacing;
        const maxVisible = Math.floor(this.width / candleSpace);
        const visibleBars = Math.min(totalBars, maxVisible);
        if (visibleBars <= 0) return;

        const startIndex = totalBars - visibleBars;
        const endIndex = totalBars - 1;

        // 2) Price range
        let minPrice = Number.MAX_VALUE;
        let maxPrice = Number.MIN_VALUE;
        for (let i = startIndex; i <= endIndex; i++) {
            const bar = this.stockData[i];
            if (bar.low < minPrice) minPrice = bar.low;
            if (bar.high > maxPrice) maxPrice = bar.high;
        }
        if (minPrice === Number.MAX_VALUE || maxPrice === Number.MIN_VALUE) return;

        const priceRange = maxPrice - minPrice;
        const chartHeight = this.height * 0.95;
        const topPadding = (this.height - chartHeight) / 2;

        // 3) Draw gridlines first
        this.drawGridlines(ctx, startIndex, endIndex, minPrice, maxPrice, priceRange, topPadding, chartHeight);

        // 4) Draw candlesticks on top of the gridlines
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

    /**
     * Draws horizontal + vertical gridlines aligned with price + date logic
     */
    drawGridlines(ctx, startIndex, endIndex, minPrice, maxPrice, priceRange, topPadding, chartHeight) {
        // ========== Horizontal Lines for Price Ticks ==========
        const priceLevels = this.getPriceTicks(minPrice, maxPrice, priceRange, this.desiredPriceTicks);

        ctx.setLineDash([8, 8]);

        priceLevels.forEach(p => {
            const y = topPadding + (maxPrice - p) / priceRange * chartHeight;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.stroke();
        });

        // ========== Vertical Lines for Date Ticks ==========
        // 1) Time range
        const startT = this.getTimeValue(this.stockData[startIndex].time);
        const endT = this.getTimeValue(this.stockData[endIndex].time);
        if (startT >= endT) return;

        const rangeMs = endT - startT;
        const timeStep = this.computeTimeStepCustom(rangeMs, this.desiredTimeTicks);

        const niceStart = this.roundDownToInterval(startT, timeStep);
        const niceEnd = this.roundUpToInterval(endT, timeStep);

        const candleSpace = this.barWidth + this.barSpacing;
        const xRightmost = this.width - this.barWidth - this.offset;

        for (let t = niceStart; t <= niceEnd + 1e-9; t += timeStep) {
            if (t < startT || t > endT) continue;

            const barIndex = this.findClosestBarIndex(t, startIndex, endIndex);

            const distBars = endIndex - barIndex;
            let xPos = xRightmost - distBars * candleSpace;
            // center in bar
            xPos += this.barWidth / 2;

            if (xPos >= 0 && xPos <= this.width) {
                ctx.beginPath();
                ctx.moveTo(xPos, 0);
                ctx.lineTo(xPos, this.height);
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.stroke();
            }
        }
        ctx.setLineDash([0, 0]);
        ctx.closePath();
    }

    // ~~~~~~~~~~ PRICE TICKS LOGIC ~~~~~~~~~~
    getPriceTicks(minPrice, maxPrice, priceRange, desiredTicks) {
        if (priceRange <= 0) return [minPrice];

        const rawStep = priceRange / (desiredTicks - 1);
        const niceStep = this.nicePriceStep(rawStep);

        const niceMin = Math.floor(minPrice / niceStep) * niceStep;
        const niceMax = Math.ceil(maxPrice / niceStep) * niceStep;

        const levels = [];
        for (let val = niceMin; val <= niceMax + 1e-9; val += niceStep) {
            if (val >= minPrice && val <= maxPrice) {
                levels.push(val);
            }
        }
        return levels;
    }

    nicePriceStep(rawStep) {
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const scaled = rawStep / magnitude;
        let niceScaled;
        if (scaled < 1.5) niceScaled = 1;
        else if (scaled < 3) niceScaled = 2;
        else if (scaled < 7) niceScaled = 5;
        else niceScaled = 10;
        return niceScaled * magnitude;
    }

    // ~~~~~~~~~~ TIME TICKS LOGIC ~~~~~~~~~~
    getTimeValue(time) {
        // If ~seconds, multiply by 1000
        if (time > 1e9 && time < 2e10) {
            return time * 1000;
        }
        return time;
    }

    computeTimeStepCustom(rangeMs, desiredTicks) {
        const INTERVALS = [
            60000, 300000, 900000, 1200000, 1800000,
            3600000, 7200000, 10800000, 14400000,
            86400000, 172800000, 259200000,
            604800000, 1209600000, 2592000000,
            5184000000, 7776000000, 15552000000,
            31536000000
        ];
        if (rangeMs <= 0) return 60000;

        let best = INTERVALS[0];
        let bestDiff = Infinity;
        for (let interval of INTERVALS) {
            const tickCount = Math.floor(rangeMs / interval) + 1;
            const diff = Math.abs(tickCount - desiredTicks);
            if (diff < bestDiff) {
                bestDiff = diff;
                best = interval;
            }
        }
        return best;
    }

    roundDownToInterval(time, step) {
        return Math.floor(time / step) * step;
    }
    roundUpToInterval(time, step) {
        return Math.ceil(time / step) * step;
    }

    findClosestBarIndex(t, startIndex, endIndex) {
        let left = startIndex;
        let right = endIndex;
        while (left < right) {
            const mid = (left + right) >>> 1;
            const midTime = this.getTimeValue(this.stockData[mid].time);
            if (midTime === t) return mid;
            else if (midTime < t) left = mid + 1;
            else right = mid;
        }
        const leftTime = this.getTimeValue(this.stockData[left].time);
        if (left > startIndex) {
            const prevTime = this.getTimeValue(this.stockData[left - 1].time);
            if (Math.abs(prevTime - t) <= Math.abs(leftTime - t)) {
                return left - 1;
            }
        }
        return left;
    }
}
