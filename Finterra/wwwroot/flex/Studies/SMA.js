import { getContrastingColor, drawLine, paintAxisLabel, getDataRange } from './StudyBase.js';
import { createElement } from '../Utils.js';
export class SimpleMovingAverage {
    constructor(config, data, pane) {
        this.config = config;
        this.length = config.inputs.length;
        this.offset = config.inputs.offset;
        this.data = data;
        this.pane = pane;
        this.sma = []; this.values = [];
        this.arr = [];
        this.sum = 0;
        this.min = Infinity;
        this.max = -Infinity;

        this.dataRange = null;

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
            this.sum -= this.values.shift();
        }

        const adjustedOffset = Math.max(1, this.offset + 1);
        if (this.arr.length > adjustedOffset) {
            const value = this.arr[this.arr.length - adjustedOffset];
            this.sum += value;
            this.values.push(value);
        }

        if (this.values.length >= this.length) {
            const sma = this.calculate();
            this.sma.push(sma);
        } else {
            this.sma.push(null);
        }
    }

    calculate() {
        return this.sum / this.length;
    }

    paint() {
        const color = this.config.style.color;
        drawLine(this.pane, this.sma, color);
    }


    paintAxis() {
        const value = this.sma[this.sma.length - 1 + Math.min(this.pane.chart.offset, 0)];
        const color = this.config.style.color;
        paintAxisLabel(value, color, this.pane);
    }

    dataWindow(crosshairOffset = 0) {
        if (this.data.length < 1) {
            console.error("Not enough data points to calculate change.");
            return;
        }

        const last = this.sma[this.sma.length - 1 + Math.min(this.pane.chart.offset - crosshairOffset, 0)];
        const wrapper = createElement('div', 'wrapper');

        const label = createElement('span', '', { fontSize: '13px' });
        label.textContent = `${this.config.displayName} ${this.config.inputs.length}`;
        if (this.config.inputs.offset > 0)
            label.textContent += ` ${this.config.inputs.offset}`;

        const value = createElement('span', '', { fontSize: '13px', color: this.config.style.color });
        value.textContent = ` ${last.toFixed(2)}`;

        wrapper.append(label, value);
        return wrapper;
    }

    getDataRange() {
        
        const minmax = getDataRange(this.pane, [this.sma])

        this.min = minmax.min;
        this.max = minmax.max;

        return minmax;
    }
}