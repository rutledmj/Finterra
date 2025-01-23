// date-axis-pane.js

import { createElement } from '../Utils.js';
import { Chart } from './chart.js';

export class DateAxisPane {
    constructor(options = {}) {
        this.width = options.width || 300;
        this.height = options.height || 32;
        this.barWidth = options.barWidth || 5;
        this.barSpacing = options.barSpacing || 2;
        this.offset = options.offset || 0;
        this.stockData = options.stockData || [];
        this.desiredTimeTicks = options.desiredTimeTicks || 5;

        this.scrollIndex = 0;

        this.canvas = null;
        this.context = null;
        this.initialize();
    }

    initialize() {
        this.canvas = createElement('canvas', {
            class: 'date-axis-pane',
            width: this.width,
            height: this.height,
            style: `width:${this.width}px; height:${this.height}px`
        });
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext('2d');
    }

    resize(newWidth, newHeight) {
        this.width = newWidth;
        this.height = newHeight;
        this.canvas.style.width = newWidth+"px";
        this.canvas.style.height = newHeight+"px";
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.render();
    }

    updateData(newStockData) {
        this.stockData = newStockData;
        this.render();
    }

    // Called by Chart when zoom changes
    setBarSize(newBarWidth, newBarSpacing) {
        this.barWidth = newBarWidth;
        this.barSpacing = newBarSpacing;
        // re-render
        this.render();
    }

    setScrollIndex(newScrollIndex) {
        this.scrollIndex = newScrollIndex;
        this.render();
    }

    render() {
        const ctx = this.context;
        if (!ctx) return;
        ctx.clearRect(0, 0, this.width, this.height);

        const totalBars = this.stockData.length;
        if (!totalBars) return;

        const candleSpace = this.barWidth + this.barSpacing;
        const maxVisible = Math.floor(this.width / candleSpace);
        const visibleBars = Math.min(totalBars, maxVisible);
        if (visibleBars <= 0) return;

        let rightMostIndex = totalBars - 1 - this.scrollIndex;
        if (rightMostIndex < 0) rightMostIndex = 0;

        let startIndex = rightMostIndex - (visibleBars - 1);
        if (startIndex < 0) startIndex = 0;

        // Now get date ticks from the Chart
        const ticks = Chart.computeDateTicks(
            this.stockData,
            startIndex,
            rightMostIndex,
            this.width,
            this.barWidth,
            this.barSpacing,
            this.offset,
            this.desiredTimeTicks
        );

        ctx.strokeStyle = '#666';
        ctx.fillStyle = '#ccc';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const tick of ticks) {
            ctx.beginPath();
            ctx.moveTo(tick.x, 0);
            ctx.lineTo(tick.x, 4);
            ctx.stroke();

            ctx.fillText(tick.label, tick.x, this.height / 2);
        }
    }

}
