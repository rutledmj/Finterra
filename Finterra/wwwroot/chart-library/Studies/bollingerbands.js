import { drawLine, paintAxisLabel, getDataRange } from './StudyBase.js';
import { createElement, getContrastingColor } from '../Utils.js';
export class BollingerBands {
    constructor(config, data, pane) {
        this.config = config;
        this.length = config.inputs.length;
        this.offset = config.inputs.offset || 0;
        this.stddev = config.inputs.stddev || 2;
        this.data = data;
        this.pane = pane;
        this.middleBand = [];
        this.upperBand = [];
        this.lowerBand = [];
        this.values = [];
        this.arr = [];
        this.sum = 0;
        this.sumSquares = 0;

        this.addRange();
    }

    addRange() {
        const { length, offset, source } = this.config.inputs;
        const len = this.data.length;
        for (let i = 0; i < len; i++) {
            const close = this.data[i][source];
            this.add(close);
        }
    }

    add(close) {
        this.arr.push(close);

        if (this.values.length >= this.length) {
            const removed = this.values.shift();
            this.sum -= removed;
            this.sumSquares -= removed * removed;
        }

        const adjustedOffset = Math.max(1, this.offset + 1);
        if (this.arr.length > adjustedOffset) {
            const value = this.arr[this.arr.length - adjustedOffset];
            this.sum += value;
            this.sumSquares += value * value;
            this.values.push(value);
        }

        if (this.values.length >= this.length) {
            const middle = this.calculateSMA();
            const stdDev = this.calculateStdDev();
            this.middleBand.push(middle);
            this.upperBand.push(middle + this.stddev * stdDev);
            this.lowerBand.push(middle - this.stddev * stdDev);
        } else {
            this.middleBand.push(null);
            this.upperBand.push(null);
            this.lowerBand.push(null);
        }
    }

    calculateSMA() {
        return this.sum / this.length;
    }

    calculateStdDev() {
        const mean = this.sum / this.length;
        const variance = this.sumSquares / this.length - mean * mean;
        return Math.sqrt(variance);
    }

    paint() {
        const uppercolor = this.config.style.upper;
        const lowercolor = this.config.style.lower;
        const middlecolor = this.config.style.middle;

        drawLine(this.pane, this.upperBand, uppercolor);
        drawLine(this.pane, this.lowerBand, lowercolor);
        drawLine(this.pane, this.middleBand, middlecolor);
    }

    paintAxis() {
        const upper = this.upperBand[this.upperBand.length - 1 + Math.min(this.pane.chart.offset, 0)];
        const lower = this.lowerBand[this.lowerBand.length - 1 + Math.min(this.pane.chart.offset, 0)];
        const middle = this.middleBand[this.middleBand.length - 1 + Math.min(this.pane.chart.offset, 0)];

        paintAxisLabel(upper, this.config.style.upper, this.pane);
        paintAxisLabel(lower, this.config.style.lower, this.pane);
        paintAxisLabel(middle, this.config.style.middle, this.pane);
    }

    dataWindow(crosshairOffset = 0) {
        if (this.data.length < 1) {
            console.error("Not enough data points to calculate change.");
            return;
        }

        const upper = this.upperBand[this.upperBand.length - 1 + Math.min(this.pane.chart.offset - crosshairOffset, 0)];
        const lower = this.lowerBand[this.lowerBand.length - 1 + Math.min(this.pane.chart.offset - crosshairOffset, 0)];
        const middle = this.middleBand[this.middleBand.length - 1 + Math.min(this.pane.chart.offset - crosshairOffset, 0)];

        const wrapper = createElement('div', 'wrapper');

        const label = createElement('span', '', { fontSize: '13px' });
        label.textContent = `${this.config.displayName} ${this.config.inputs.length} ${this.config.inputs.stddev}`;

        wrapper.append(label);

        const values = [upper, middle, lower];
        const colors = [this.config.style.upper, this.config.style.middle, this.config.style.lower];

        values.forEach((value, index) => {
            const valueCell = createElement('span', '', { fontSize: '13px', color: colors[index] });
            valueCell.textContent = ` ${value.toFixed(2)}`;

            wrapper.append(valueCell);
        });

        return wrapper;
    }

    getDataRange() {
        const minmax = getDataRange(this.pane, [this.upperBand, this.lowerBand])

        this.min = minmax.min;
        this.max = minmax.max;

        return minmax;
    }
}