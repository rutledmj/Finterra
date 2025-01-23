// date-axis-pane.js

import { createElement } from '../Utils.js';

export class DateAxisPane {
    constructor(options = {}) {
        this.width = options.width || 300;
        this.height = options.height || 32;

        // Must match the indicator pane's barWidth / barSpacing / offset
        this.barWidth = options.barWidth || 5;
        this.barSpacing = options.barSpacing || 2;
        this.offset = options.offset || 0; // matches indicator-pane offset

        this.stockData = options.stockData || [];
        this.desiredTimeTicks = options.desiredTimeTicks || 5;

        this.canvas = null;
        this.context = null;
        this.initialize();
    }

    initialize() {
        this.canvas = createElement('canvas', {
            className: 'date-axis-pane'
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

        // 1) Determine how many bars fit horizontally, same as indicator-pane
        const candleSpace = this.barWidth + this.barSpacing;
        const maxVisible = Math.floor(this.width / candleSpace);

        const visibleBars = Math.min(totalBars, maxVisible);
        if (visibleBars <= 0) return;

        // We show the rightmost subset [startIndex..endIndex]
        const startIndex = totalBars - visibleBars;
        const endIndex = totalBars - 1;

        // 2) Time range among these bars
        const startTimeMs = this.getTimeValue(this.stockData[startIndex].time);
        const endTimeMs = this.getTimeValue(this.stockData[endIndex].time);
        if (startTimeMs >= endTimeMs) return;

        const rangeMs = endTimeMs - startTimeMs;

        // 3) Choose a "nice" custom time step
        const timeStep = this.computeTimeStepCustom(rangeMs, this.desiredTimeTicks);

        // 4) Round start/end to multiples of that step
        const niceStart = this.roundDownToInterval(startTimeMs, timeStep);
        const niceEnd = this.roundUpToInterval(endTimeMs, timeStep);

        // 5) For each tick from niceStart..niceEnd in increments of timeStep
        for (let t = niceStart; t <= niceEnd + 1e-9; t += timeStep) {
            if (t < startTimeMs || t > endTimeMs) continue;

            // find bar index closest to 't'
            const barIndex = this.findClosestBarIndex(t, startIndex, endIndex);

            // 6) Mirror indicator-pane's X formula:
            // last bar at x=(width - barWidth - offset),
            // each bar to the left is candleSpace further left
            const distBars = (endIndex - barIndex);
            let xPos = (this.width - this.barWidth - this.offset) - distBars * candleSpace;

            // Optionally shift xPos to center the tick in the bar:
            xPos += this.barWidth * 0.5;

            // draw the tick if inside the axis
            if (xPos >= 0 && xPos <= this.width) {
                this.drawTick(ctx, xPos, t, timeStep);
            }
        }
    }

    // if time is ~ seconds, multiply by 1000
    getTimeValue(time) {
        if (time > 1e9 && time < 2e10) {
            return time * 1000;
        }
        return time;
    }

    computeTimeStepCustom(rangeMs, desiredTicks) {
        // same intervals you used
        const CUSTOM_INTERVALS = [
            60000, 300000, 900000, 1200000, 1800000,
            3600000, 7200000, 10800000, 14400000,
            86400000, 172800000, 259200000,
            604800000, 1209600000, 2592000000,
            5184000000, 7776000000, 15552000000,
            31536000000
        ];

        if (rangeMs <= 0) return 60000;

        let best = CUSTOM_INTERVALS[0];
        let bestDiff = Infinity;

        for (let interval of CUSTOM_INTERVALS) {
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

    /**
     * Binary search to find bar whose time is closest to t. 
     * Same approach as you had.
     */
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

    drawTick(ctx, xPos, timestampMs, timeStep) {
        // short vertical line
        ctx.beginPath();
        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos, 4);
        ctx.strokeStyle = '#666';
        ctx.stroke();

        // Format label
        const dateObj = new Date(timestampMs);
        const label = this.formatDateByStep(dateObj, timeStep);

        // place label
        ctx.fillStyle = '#ccc';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, xPos, this.height / 2);
    }

    /**
     * e.g. if step<1day => "HH:mm", else if step<1month => "dd", etc.
     * same as your code above
     */
    formatDateByStep(dateObj, step) {
        if (step < 86400000) {
            const hh = String(dateObj.getHours()).padStart(2, '0');
            const mm = String(dateObj.getMinutes()).padStart(2, '0');
            return `${hh}:${mm}`;
        }
        else if (step < 2592000000) {
            const d = String(dateObj.getDate()).padStart(2, '0');
            return d;
        }
        else if (step < 31536000000) {
            return dateObj.toLocaleString('en-US', { month: 'short' });
        }
        else {
            return String(dateObj.getFullYear());
        }
    }
}
