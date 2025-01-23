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

    render() {
        const ctx = this.context;
        if (!ctx) return;
        ctx.clearRect(0, 0, this.width, this.height);

        const totalBars = this.stockData.length;
        if (totalBars === 0) return;

        const candleSpace = this.barWidth + this.barSpacing;
        const maxVisible = Math.floor(this.width / candleSpace);
        const visibleBars = Math.min(totalBars, maxVisible);
        if (visibleBars <= 0) return;

        const startIndex = totalBars - visibleBars;
        const endIndex = totalBars - 1;

        // Use Chart.computeDateTicks() to find date ticks
        const ticks = Chart.computeDateTicks(
            this.stockData,
            startIndex,
            endIndex,
            this.width,
            this.barWidth,
            this.barSpacing,
            this.offset,
            this.desiredTimeTicks
        );

        // Draw small ticks & labels
        ctx.strokeStyle = '#666';
        ctx.fillStyle = '#ccc';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const tick of ticks) {
            const xPos = tick.x;
            // short vertical line
            ctx.beginPath();
            ctx.moveTo(xPos, 0);
            ctx.lineTo(xPos, 4);
            ctx.stroke();

            // label in middle of axis
            ctx.fillText(tick.label, xPos, this.height / 2);
        }
    }
}
