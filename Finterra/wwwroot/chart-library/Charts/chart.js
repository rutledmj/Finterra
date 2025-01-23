// chart.js

import { Window } from '../components.js';
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
        this.scrollIndex = 0;

        // Data arrays
        this.rawData = [];
        this.processedData = [];

        // Pane references
        this.panes = [];
        this.dateAxisPane = null;
        this.dateAxisHeight = 32; // fixed date-axis height
        this.priceAxisWidth = 64; // if you keep a fixed price-axis width

        // At this point, the parent Window has appended everything to the DOM
        requestAnimationFrame(() => {
            this.postInit();
        });
    }

    postInit() {
        // 1) Measure the .body size
        const { width: bodyWidth, height: bodyHeight } = this.getBodyDimensions();

        // 2) Build the chart layout (panes, date axis)
        this.initChartLayout(bodyWidth, bodyHeight);

        this.body.addEventListener('wheel', (ev) => this.handleWheel(ev), { passive: false });
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // 3) Fetch data and render
        this.fetchAndRender();
    }

    /**
     * Returns the current .body dimensions in the DOM
     */
    getBodyDimensions() {
        const rect = this.body.getBoundingClientRect();
        return {
            width: Math.floor(rect.width),
            height: Math.floor(rect.height)
        };
    }

    /**
     * Creates N stacked panes, 1px divider after each, and a bottom date axis
     */
    initChartLayout(containerWidth, containerHeight) {
        // totalDividers = N (one after each pane)
        const totalDividers = this.numPanes;
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
                priceAxisWidth: this.priceAxisWidth
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

        // ~~~~~~ IMPORTANT ~~~~~~
        // Compute the "indicator" width so that the date-axis
        // matches the candlestick area.
        const indicatorWidth = containerWidth - this.priceAxisWidth - 1;

        // The DateAxisPane at the bottom (matching indicatorWidth)
        this.dateAxisPane = new DateAxisPane({
            width: indicatorWidth,
            height: this.dateAxisHeight,
            stockData: this.processedData,
            barWidth: this.barWidth,
            barSpacing: this.barSpacing,
            offset: this.offset
        });

        // Append the date-axis
        this.body.appendChild(this.dateAxisPane.canvas);
    }

    /**
     * Called automatically on window resize
     */
    resize(newWidth, newHeight) {
        // Re-measure body container
        const { width: bodyWidth, height: bodyHeight } = this.getBodyDimensions();

        const totalDividers = this.numPanes;
        const eachPaneHeight = Math.floor(
            (bodyHeight - this.dateAxisHeight - totalDividers) / this.numPanes
        );

        // Resize each Pane
        for (const pane of this.panes) {
            pane.resize(bodyWidth, eachPaneHeight);
        }

        // Resize the DateAxisPane so it stays the same width as the indicator area
        if (this.dateAxisPane) {
            const indicatorWidth = bodyWidth - this.priceAxisWidth - 1;
            this.dateAxisPane.resize(indicatorWidth, this.dateAxisHeight);
        }
    }

    async fetchAndRender() {
        try {
            this.rawData = this.generateMockData(1000);
            this.processedData = this.compileData(this.rawData);

            // Update all panes
            for (const pane of this.panes) {
                pane.updateData(this.processedData);
            }
            // Update date-axis
            if (this.dateAxisPane) {
                this.dateAxisPane.updateData(this.processedData);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    }

    compileData(rawData) {
        // In real usage, do any data transformations or merges here
        return rawData;
    }

    generateMockData(count) {
        let price = 1000;
        const data = [];
        let currentDate = new Date();

        for (let i = 0; i < count; i++) {
            const open = price;
            const close = open + (Math.random() - 0.5) * 2;
            const high = Math.max(open, close) + Math.random();
            const low = Math.min(open, close) - Math.random();
            price = close;

            const timestamp = new Date(currentDate);
            data.push({
                time: timestamp,
                open,
                high,
                low,
                close,
                volume: Math.floor(Math.random() * 10000)
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }
        return data;
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //   KEYBOARD HANDLER: ARROW LEFT / ARROW RIGHT
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.panLeft();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.panRight();
                break;
            default:
                break;
        }
    }

    /**
     * Move the chart "one bar" or "one interval" to the left.
     * Meaning show an older bar on the right edge.
     */
    panLeft() {
        // For demonstration, let's define "one interval" = 1 bar:
        this.scrollIndex++;

        // Update all panes & date-axis
        this.updateScrollIndexOnAll();
    }

    /**
     * Move chart "one bar" to the right
     */
    panRight() {
        // Can't scroll beyond 0 (the newest bar at right edge).
        if (this.scrollIndex > 0) {
            this.scrollIndex--;
        }
        this.updateScrollIndexOnAll();
    }

    /**
     * Pass the new scrollIndex to all panes and date-axis,
     * then re-render them so they shift their visible subset.
     */
    updateScrollIndexOnAll() {
        for (const pane of this.panes) {
            pane.setScrollIndex(this.scrollIndex);
        }
        if (this.dateAxisPane) {
            this.dateAxisPane.setScrollIndex(this.scrollIndex);
        }
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //        WHEEL / SCROLL ZOOM HANDLER
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    handleWheel(e) {
        // Prevent default scrolling
        e.preventDefault();

        // e.deltaY < 0 => Scrolled up => zoom in
        // e.deltaY > 0 => Scrolled down => zoom out
        if (e.deltaY < 0) {
            this.zoomIn();
        } else {
            this.zoomOut();
        }
    }

    zoomIn() {
        // Increase barWidth and barSpacing
        this.barWidth = Math.min(this.barWidth + 1, 100);   // put some max limit if you like
        this.barSpacing = Math.min(this.barSpacing + 0.5, 50);

        // Update all Panes
        for (const pane of this.panes) {
            pane.setBarSize(this.barWidth, this.barSpacing);
        }
        // Also update date-axis
        this.dateAxisPane.setBarSize(this.barWidth, this.barSpacing);
    }

    zoomOut() {
        // Decrease barWidth and barSpacing but not below 1 (or 0 for spacing)
        this.barWidth = Math.max(this.barWidth - 1, 1);
        this.barSpacing = Math.max(this.barSpacing - 0.5, 0);

        // Update all Panes
        for (const pane of this.panes) {
            pane.setBarSize(this.barWidth, this.barSpacing);
        }
        // Also update date-axis
        this.dateAxisPane.setBarSize(this.barWidth, this.barSpacing);
    }

    // -------------------------------------------------------------------
    // Static helpers for date ticks (unchanged from earlier examples)
    // -------------------------------------------------------------------
    static computeDateTicks(stockData, startIndex, endIndex,
        totalWidth, barWidth, barSpacing, offset,
        desiredTimeTicks = 5) {
        // (unchanged logic)
        if (startIndex > endIndex || !stockData.length) return [];

        const startTime = Chart.getTimeValue(stockData[startIndex].time);
        const endTime = Chart.getTimeValue(stockData[endIndex].time);
        if (startTime >= endTime) return [];

        const rangeMs = endTime - startTime;
        const step = Chart.computeTimeStepCustom(rangeMs, desiredTimeTicks);

        const niceStart = Chart.roundDownToInterval(startTime, step);
        const niceEnd = Chart.roundUpToInterval(endTime, step);

        const candleSpace = barWidth + barSpacing;
        const xRightmost = totalWidth - barWidth - offset;

        const results = [];
        for (let t = niceStart; t <= niceEnd + 1e-9; t += step) {
            if (t < startTime || t > endTime) continue;

            const barIdx = Chart.findClosestBarIndex(stockData, t, startIndex, endIndex);
            const distBars = endIndex - barIdx;
            let xPos = xRightmost - distBars * candleSpace;
            xPos += barWidth * 0.5;

            if (xPos >= 0 && xPos <= totalWidth) {
                const label = Chart.formatDateByStep(new Date(t), step);
                results.push({ x: xPos, label, timeValue: t });
            }
        }
        return results;
    }

    static getTimeValue(time) {
        if (time instanceof Date) return time.getTime();
        // If numeric but looks like seconds, multiply by 1000
        if (typeof time === 'number' && time > 1e9 && time < 2e10) {
            return time * 1000;
        }
        return +time;
    }

    static computeTimeStepCustom(rangeMs, desiredTicks) {
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

    static roundDownToInterval(time, step) {
        return Math.floor(time / step) * step;
    }

    static roundUpToInterval(time, step) {
        return Math.ceil(time / step) * step;
    }

    static findClosestBarIndex(stockData, t, startIndex, endIndex) {
        let left = startIndex;
        let right = endIndex;
        while (left < right) {
            const mid = (left + right) >>> 1;
            const midTime = Chart.getTimeValue(stockData[mid].time);
            if (midTime === t) return mid;
            else if (midTime < t) left = mid + 1;
            else right = mid;
        }
        const leftTime = Chart.getTimeValue(stockData[left].time);
        if (left > startIndex) {
            const prevTime = Chart.getTimeValue(stockData[left - 1].time);
            if (Math.abs(prevTime - t) <= Math.abs(leftTime - t)) {
                return left - 1;
            }
        }
        return left;
    }

    static formatDateByStep(dateObj, step) {
        if (step < 86400000) {
            const hh = String(dateObj.getHours()).padStart(2, '0');
            const mm = String(dateObj.getMinutes()).padStart(2, '0');
            return `${hh}:${mm}`;
        } else if (step < 2592000000) {
            const d = String(dateObj.getDate()).padStart(2, '0');
            return d;
        } else if (step < 31536000000) {
            return dateObj.toLocaleString('en-US', { month: 'short' });
        } else {
            return String(dateObj.getFullYear());
        }
    }
}
