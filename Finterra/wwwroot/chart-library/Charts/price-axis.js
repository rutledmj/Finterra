// File: chart/price-axis.js

/**
 * A simplistic vertical axis on the right side of the chart.
 * In real usage, you'd want to share the actual min/max from Pane.
 */
export class PriceAxis {
    constructor(options) {
        this.parent = options.parent;
        this.width = options.width || 50;
        this.height = options.height || 400;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        Object.assign(this.canvas.style, {
            position: 'absolute',
            top: '0',
            left: `${this.parent.offsetWidth - this.width}px`
        });

        this.ctx = this.canvas.getContext('2d');
        this.parent.appendChild(this.canvas);
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Just draw a line from top to bottom
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, this.height);
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Example labels
        ctx.fillStyle = '#000';
        ctx.font = '12px sans-serif';
        ctx.fillText('Price Axis', 5, 15);
        ctx.fillText('High', 5, 30);
        ctx.fillText('Low', 5, this.height - 10);
    }
}
