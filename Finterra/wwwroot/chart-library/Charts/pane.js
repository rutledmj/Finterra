import { createElement, scaleY } from '../Utils.js';
import { Indicators } from '../Studies/Studies.js';
import { drawHorizontalLine, drawVerticalLine } from '../Studies/StudyBase.js';
import { Crosshair } from './crosshair.js';

export class Pane {
    constructor({ chart, options, width, height }) {
        Object.assign(this, { chart, options, width, height });

        this.min = Infinity;
        this.max = -Infinity;

        this.initialize();
    }

    initialize() {
        this.container = createElement('div', {
            class: 'pane-container',
            style: `width:100%; height: ${this.height}px; border-bottom: 4px solid var(--chart-border); background-color:var(--chart-border);position:relative;`
        });
        //    createElement('div', 'pane-container', {
        //    width: '100%',
        //    height: `${this.height}px`,
        //    borderBottom: '4px solid var(--chart-border)',
        //    backgroundColor: 'var(--chart-border)',
        //    position: 'relative'
        //});

        this.chart.container.appendChild(this.container);

        this.canvas = this.createPane();
        this.crosshair = this.createCrosshair();

        this.axis = this.createAxis();
        this.dataWindow = this.createDataWindow();

        this.container.append(this.canvas, this.crosshair.canvas, this.axis, this.dataWindow);
    }

    createPane() {
        return createElement('canvas', {
            class: 'price-pane',
            style: 'background-color:var(--pane-background); position:absolute;left:0',
            height: (this.height - 1) + "px",
            width: (this.width) + "px"
        });
        //createElement('canvas', 'price-pane', {
        //    backgroundColor: 'var(--pane-background)',
        //    position: 'absolute',
        //    left: '0'
        //}, {
        //    height: `${this.height - 1}px`,
        //    width: `${this.width}px`
        //});
    }

    createCrosshair() {
        return new Crosshair(this);
    }

    createAxis() {
        return createElement('canvas', {
            class: 'price-axis',
            style: 'background-color:var(--axis-background); position:absolute; right:0; border-left: 1px solid var(--chart-border)',
            height: `${this.height - 1}px`,
            width: `${this.chart.priceAxisWidth}px`
        });
        //createElement('canvas', 'price-axis', {
        //    backgroundColor: 'var(--axis-background)',
        //    position: 'absolute',
        //    right: '0',
        //    borderLeft: '1px solid var(--chart-border)'
        //}, {
        //    height: `${this.height - 1}px`,
        //    width: `${this.chart.priceAxisWidth}px`
        //});
    }

    createDataWindow() {
        return createElement('div', {
            class: 'data-window',
            style: 'position:absolute; top:4px; left:4px; pointer-events: none'
        })
        //createElement('div', 'data-window', {
        //    position: 'absolute',
        //    top: '4px',
        //    left: '4px',
        //    pointerEvents: 'none'
        //});
    }

    updateDataWindow(crosshairOffset = 0) {
        this.dataWindow.innerHTML = '';

        const appendDataWindowRow = (indicator) => {
            const dataWindowRow = indicator.dataWindow(crosshairOffset);
            dataWindowRow.style.backgroundColor = 'var(--datawindow)';
            dataWindowRow.style.width = 'fit-content';
            dataWindowRow.style.color = 'var(--color)';
            this.dataWindow.appendChild(dataWindowRow);
        };

        if (this.options && this.options.price) {
            appendDataWindowRow(this.options.price);
        }

        const appendRows = (items) => {
            items.forEach(item => {
                if (item.indicator) {
                    appendDataWindowRow(item.indicator);
                }
            });
        };

        if (this.options) {
            if (this.options.overlays) appendRows(this.options.overlays);
            if (this.options.studies) appendRows(this.options.studies);
        }
    }

    appendTo(parent) {
        this.initialize();
        parent.appendChild(this.container);
    }

    calculate(data) {
        const calculateIndicators = (items) => {
            items.forEach(item => {
                const IndicatorClass = Indicators[item.name];
                if (IndicatorClass) {
                    item.indicator = new IndicatorClass(item, data, this);
                }
            });
        };
        if (this.options) {
            if (this.options.overlays) calculateIndicators(this.options.overlays);
            if (this.options.price) {
                const PriceClass = Indicators['Price'];
                if (PriceClass) {
                    this.options.price = new PriceClass(this.options.price, data, this);
                }
            }
            if (this.options.studies) calculateIndicators(this.options.studies);
        }
    }

    getDataRange() {
        this.min = Infinity;
        this.max = -Infinity;

        const updateRange = (indicator) => {
            if (indicator && typeof indicator.getDataRange !== 'undefined') {
                indicator.getDataRange();
                this.min = Math.min(indicator.min, this.min);
                this.max = Math.max(indicator.max, this.max);
            }
        };

        if (this.options) {
            if (this.options.overlays) {
                this.options.overlays.forEach((overlay) => {
                    if (overlay.yscale) updateRange(overlay.indicator)
                });
            }
            if (this.options.studies) {
                this.options.studies.forEach(study => updateRange(study.indicator));
            }
            if (this.options.price) {
                updateRange(this.options.price);
            }
        }

        const buffer = (this.max - this.min) * 0.05;
        this.max += buffer;
        this.min -= buffer;
    }

    clear() {
        this.clearCanvas();
        this.clearAxis();
    }

    clearCanvas() {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    clearAxis() {
        const ctx = this.axis.getContext('2d');
        ctx.clearRect(0, 0, this.axis.width, this.axis.height);
    }

    paint() {
        this.paintHorizontalGrid();
        this.paintVerticalGrid();

        const paintIndicators = (items) => {
            items.forEach(item => {
                if (item.indicator && typeof item.indicator.paint !== 'undefined') {
                    item.indicator.paint();
                }
            });
        };

        if (this.options) {
            if (this.options.overlays) paintIndicators(this.options.overlays);
            if (this.options.price) this.options.price.paint();
            if (this.options.studies) paintIndicators(this.options.studies);
        }
    }

    paintAxis() {
        this.paintAxisTicks();

        const paintIndicatorAxes = (items) => {
            items.forEach(item => {
                if (item.indicator && typeof item.indicator.paintAxis !== 'undefined') {
                    item.indicator.paintAxis();
                }
            });
        };

        if (this.options) {
            if (this.options.overlays) paintIndicatorAxes(this.options.overlays);
            if (this.options.price && typeof this.options.price.paintAxis !== 'undefined') {
                this.options.price.paintAxis();
            }
            if (this.options.studies) paintIndicatorAxes(this.options.studies);
        }
    }

    paintAxisTicks() {
        const range = this.max - this.min;
        const stepCount = 4;
        const width = this.axis.width;
        const height = this.axis.height;

        const steps = [
            0.01, 0.015, 0.02, 0.025, 0.05,
            0.1, 0.15, 0.2, 0.25, 0.5,
            1, 1.5, 2, 2.5, 5,
            10, 15, 20, 25, 50,
            100, 150, 200, 250, 500,
        ];

        const g = range / stepCount;
        const interval = steps.reduce((prev, curr) =>
            Math.abs(curr - g) < Math.abs(prev - g) ? curr : prev
        );

        const minTick = Math.floor(this.min / interval) * interval;
        const maxTick = Math.ceil(this.max / interval) * interval;

        const ctx = this.axis.getContext('2d');
        ctx.beginPath();
        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = 1;
        ctx.font = "12px Arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "#aaa";

        for (let value = minTick; value <= maxTick; value += interval) {
            const y = scaleY(value, this);
            ctx.fillText(value.toFixed(2), width / 2, y);
            ctx.moveTo(0, y);
            ctx.lineTo(5, y);
            ctx.stroke();
        }

        ctx.closePath();
    }

    paintHorizontalGrid() {
        const range = this.max - this.min;
        const stepCount = 4;

        const steps = [
            0.01, 0.015, 0.02, 0.025, 0.05,
            0.1, 0.15, 0.2, 0.25, 0.5,
            1, 1.5, 2, 2.5, 5,
            10, 15, 20, 25, 50,
            100, 150, 200, 250, 500,
        ];

        const g = range / stepCount;
        const interval = steps.reduce((prev, curr) =>
            Math.abs(curr - g) < Math.abs(prev - g) ? curr : prev
        );

        const minTick = Math.ceil(this.min / interval) * interval;
        const maxTick = Math.floor(this.max / interval) * interval;

        for (let value = minTick; value <= maxTick; value += interval) {
            drawHorizontalLine(this, value, "#01313b");
        }
    }

    paintVerticalGrid() {
        const data = this.chart.data;
        const ticks = this.chart.timeAxis.ticks;

        ticks.forEach(tick => {
            drawVerticalLine(this, tick.index, data, "#01313b");
        });

        this.ticks = ticks;
    }
}
