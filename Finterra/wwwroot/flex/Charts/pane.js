import { createElement } from '../Utils.js';
import { Indicators } from '../Studies/Studies.js';
import { drawHorizontalLine, drawVerticalLine, scaleY } from '../Studies/StudyBase.js';
export class Pane {
    constructor({ chart, options, width, height, top }) {
        Object.assign(this, { chart, options, width, height, top });

        this.min = Infinity;
        this.max = -Infinity;
    }

    initialize() {
        this.container = createElement('div', "pane-container", {
            width: `${this.chart.workspaceWidth}px`, height: `${this.height}px`,
            position: 'absolute',
            top: `${this.top}px`,
            borderBottom: '1px solid #e0e3eb'
        });

        this.pane = this.createPane();
        this.axis = this.createAxis();
        this.dataWindow = this.createDataWindow();

        this.container.append(this.pane, this.axis, this.dataWindow);
    }

    createPane() {
        return createElement('canvas', 'price-pane', { backgroundColor: this.chart.backgroundColor, position: 'absolute', left: '0' }, { height: `${this.height - 1}px`, width: `${this.width}px` });
    }

    createAxis() {
        return createElement('canvas', 'price-axis', { backgroundColor: this.chart.backgroundColor, position: 'absolute', right: '0', borderLeft: '1px solid #e0e3eb' }, { height: `${this.height - 1}px`, width: `${this.chart.priceAxisWidth}px` });
    }

    createDataWindow() {
        const dataWindow = createElement('div', 'data-window', {
            position: 'absolute', top: '4px', left: '4px'
        });

        return dataWindow;
    }

    updateDataWindow() {
        this.dataWindow.innerHTML = '';
        if (this.options.price) {
            const priceClass = Indicators["Price"];
            if (priceClass) {
                const dataWindowRow = this.options.price.dataWindow();
                this.dataWindow.appendChild(dataWindowRow);
            }
        }

        if (this.options.overlays)
            for (let overlay of this.options.overlays) {
                const indicatorClass = Indicators[overlay.name];
                if (indicatorClass) {

                    const dataWindowRow = overlay.indicator.dataWindow();
                    dataWindowRow.style.setProperty('background-color', 'rgba(255, 255, 255, 0.55)');
                    dataWindowRow.style.setProperty('width', 'fit-content');
                    this.dataWindow.appendChild(dataWindowRow);
                }
            }

        if (this.options.studies)
            for (let study of this.options.studies) {
                const indicatorClass = Indicators[study.name];
                if (indicatorClass) {
                    const dataWindowRow = study.indicator.dataWindow();
                    dataWindowRow.style.setProperty('background-color', 'rgba(255, 255, 255, 0.55)');
                    dataWindowRow.style.setProperty('width', 'fit-content');
                    this.dataWindow.appendChild(dataWindowRow);
                }
            }
    }

    appendTo(parent) {
        this.initialize();
        parent.appendChild(this.container);
    }

    calculate(data) {
        if (this.options.overlays)
            for (let overlay of this.options.overlays) {
                const indicatorClass = Indicators[overlay.name];
                if (indicatorClass) {
                    overlay.indicator = new indicatorClass(overlay, data, this);
                }
            }

        if (this.options.price) {
            const priceClass = Indicators["Price"];
            if (priceClass) {
                this.options.price = new priceClass(this.options.price, data, this);
            }
        }

        if (this.options.studies)
            for (let study of this.options.studies) {
                const indicatorClass = Indicators[study.name];
                if (indicatorClass) {
                    study.indicator = new indicatorClass(study, data, this);
                }
            }
    }

    getDataRange() {
        this.min = Infinity;
        this.max = -Infinity;

        if (this.options.overlays) {
            for (let overlay of this.options.overlays) {
                if (overlay.indicator && typeof overlay.indicator.getDataRange !== 'undefined') {
                    overlay.indicator.getDataRange();
                    if (overlay.yscale) {
                        this.min = Math.min(overlay.indicator.min, this.min);
                        this.max = Math.max(overlay.indicator.max, this.max);
                    }
                }
            }
        }

        if (this.options.studies) {
            for (let study of this.options.studies) {
                if (study.indicator && typeof study.indicator.getDataRange !== 'undefined') {
                    study.indicator.getDataRange();
                    if (study.yscale) {
                        this.min = Math.min(study.indicator.min, this.min);
                        this.max = Math.max(study.indicator.max, this.max);
                    }
                }
            }
        }

        if (this.options.price) {
            console.log(this.max, this.options.price.max);
            this.options.price.getDataRange();
            console.log(this.max, this.options.price.max);
            this.min = Math.min(this.options.price.min, this.min);
            this.max = Math.max(this.options.price.max, this.max);

        }

        let buffer = (this.max - this.min) * .05;
        this.max += buffer;
        this.min -= buffer;
    }

    clear() {
        let ctx = this.pane.getContext('2d');
        ctx.clearRect(0, 0, this.pane.width, this.pane.height);

        ctx = this.axis.getContext('2d');
        ctx.clearRect(0, 0, this.axis.width, this.axis.height);
    }

    paint() {
        this.paintHorizontalGrid();
        this.paintVerticalGrid();

        if (this.options.overlays)
            for (let overlay of this.options.overlays) {
                if (overlay.indicator && typeof overlay.indicator.paint !== 'undefined') {
                    overlay.indicator.paint();
                }
            }

        if (this.options.price) {
            this.options.price.paint();
        }

        if (this.options.studies)
            for (let study of this.options.studies) {
                if (study.indicator && typeof study.indicator.paint !== 'undefined') {
                    study.indicator.paint();
                }
            }
    }

    paintAxis() {

        this.paintAxisTicks();

        if (this.options.overlays)
            for (let overlay of this.options.overlays) {
                if (overlay.indicator && typeof overlay.indicator.paintAxis !== 'undefined') {
                    overlay.indicator.paintAxis();
                }
            }

        if (this.options.price && typeof this.options.price.paintAxis !== 'undefined') {
            this.options.price.paintAxis();
        }


        if (this.options.studies)
            for (let study of this.options.studies) {
                if (study.indicator && typeof study.indicator.paint !== 'undefined') {
                    study.indicator.paintAxis();
                }
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

    paintCrosshairs() { }

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
            drawHorizontalLine(this, value, "#eee");
        }
    }

    paintVerticalGrid() {
        
        const data = this.chart.data;
        const ticks = this.chart.timeAxis.ticks;

        const ctx = this.pane.getContext('2d');
        ctx.beginPath();
        ctx.strokeStyle = "#eee";
        ctx.lineWidth = 1;

        ticks.forEach(tick => {
            drawVerticalLine(this, tick.index, data, "#eee");
        });

        this.ticks = ticks;
        
    }
}