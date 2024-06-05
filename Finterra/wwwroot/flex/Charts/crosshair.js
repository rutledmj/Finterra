import { createElement } from '../Utils.js';
import { paintAxisLabel, getContrastingColor } from '../Studies/StudyBase.js';
export class Crosshair {
    constructor(pane) {
        this.pane = pane;

        this.initialize();
    }

    initialize() {
        this.canvas = this.createCrosshairCanvas();

        this.onMouseMove();
    }

    createCrosshairCanvas() {
        return createElement('canvas', 'crosshair-pane', { backgroundColor: "transparent", position: 'absolute', left: '0' }, { height: `${this.pane.height - 1}px`, width: `${this.pane.width}px` });
    }

    onMouseMove() {
        this.canvas.onmousemove = (e) => {

            if (this.pane.chart.data) {
                this.drawVerticalLine(e);
                this.drawHorizontalLine(e);
                this.drawAxisLabel(e);
                this.drawDateLabel(e);
                this.updateDataWindow(e);
            }
        };

        this.canvas.onmouseout = (e) => {
            this.pane.chart.panes.forEach((pane) => {
                var ctx = pane.crosshair.canvas.getContext('2d');
                ctx.clearRect(0, 0, pane.crosshair.canvas.width, pane.crosshair.canvas.height);
            });
        }
    }

    updateDataWindow(e) {
        const x = Math.floor(e.offsetX) + .5;

        this.pane.chart.panes.forEach((pane, index) => {
            const barOffset = this.getBarOffset(x, pane);
            pane.updateDataWindow(barOffset);
        });
    }

    drawDateLabel(e) {
        //convert x to bar;
        const timeAxis = this.pane.chart.timeAxis;
        const bar = this.getBar(e.offsetX, timeAxis);

        const width = timeAxis.crosshairCanvas.width;
        const height = timeAxis.crosshairCanvas.height;
        const w = 124;
        const color = "#000";

        const ctx = timeAxis.crosshairCanvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = color;
        ctx.fillRect(e.offsetX - w / 2, 0, w, height);

        const time = bar.dateTime;

        const month = time.toLocaleString('default', { month: 'short' });
        const day = time.getDate().toString().padStart(2, '0');
        const year = time.getFullYear().toString().substr(-2);
        const hour = time.getHours();
        const min = time.getMinutes();

        const text = `${month} ${day} '${year} ${hour}:${min}`;

        // Draw the value text
        ctx.font = "12px Arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = getContrastingColor(color);
        ctx.fillText(text, e.offsetX, height / 2);
    }

    getBarOffset(x, pane) {
        const barSpacing = pane.chart.barSpacing;
        const barWidth = pane.chart.barWidth;
        const paneWidth = pane.canvas.width;
        const barsCount = Math.floor(paneWidth / (barSpacing + barWidth));

        const barOffset = Math.floor(barsCount - x / paneWidth * barsCount);

        return barOffset;
    }

    getBar(x, pane) {
        const barOffset = this.getBarOffset(x, pane);
        const bar = pane.chart.data[Math.min(pane.chart.data.length - 1 - barOffset + pane.chart.offset, pane.chart.data.length - 1)];

        return bar;
    }

    drawVerticalLine(e) {
        const x = Math.floor(e.offsetX) + .5;

        this.pane.chart.panes.forEach((pane, index) => {

            const ctx = pane.crosshair.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            ctx.beginPath();
            ctx.strokeStyle = "#999";
            ctx.setLineDash([5, 5]);

            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);

            ctx.stroke();
        });
        
    }

    drawHorizontalLine(e) {
        const ctx = this.canvas.getContext('2d');

        const y = Math.floor(e.offsetY) + .5;

        ctx.beginPath();
        ctx.strokeStyle = "#999";
        ctx.setLineDash([5, 5]);

        ctx.moveTo(0, y);
        ctx.lineTo(this.canvas.width, y);

        ctx.stroke();
    }

    drawAxisLabel(y) {
        this.pane.clearAxis();
        this.pane.paintAxis();

        const value = this.getAxisValue(y.offsetY);
        paintAxisLabel(value, "#000", this.pane);
    }

    getAxisValue(y) {
        const range = this.pane.max - this.pane.min;
        const scale = (this.pane.height - y) / this.pane.height;
        const value = this.pane.min + scale * range;
        return value;
    }
}