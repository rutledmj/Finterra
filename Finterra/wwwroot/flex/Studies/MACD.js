import { getContrastingColor, paintAxisLabel, drawLine, drawHistogram, getDataRange, drawHorizontalLine } from './StudyBase.js';
import { createElement } from '../Utils.js';
export class MACD {
    constructor(config, data, pane) {
        this.config = config;
        this.data = data;
        this.pane = pane;
        this.macdLine = [];
        this.signalLine = [];
        this.histogram = [];
        this.emaShortPeriod = config.inputs.emaShortPeriod || 12;
        this.emaLongPeriod = config.inputs.emaLongPeriod || 26;
        this.signalPeriod = config.inputs.signalPeriod || 9;
        this.emaShortValues = [];
        this.emaLongValues = [];
        this.signalValues = [];

        this.calculateAll();
    }

    calculateAll() {
        this.calculateEMA(this.emaShortPeriod, this.emaShortValues);
        this.calculateEMA(this.emaLongPeriod, this.emaLongValues);
        this.calculateMACDLine();
        this.calculateSignalLine();
        this.calculateHistogram();
    }

    calculateEMA(period, values) {
        let multiplier = 2 / (period + 1);
        for (let i = 0; i < this.data.length; i++) {
            const close = this.data[i].close;
            if (i === 0) {
                values.push(close);
            } else {
                const ema = (close - values[i - 1]) * multiplier + values[i - 1];
                values.push(ema);
            }
        }
    }

    calculateMACDLine() {
        for (let i = 0; i < this.data.length; i++) {
            const macdValue = this.emaShortValues[i] - this.emaLongValues[i];
            this.macdLine.push(macdValue);
        }
    }

    calculateSignalLine() {
        let multiplier = 2 / (this.signalPeriod + 1);
        for (let i = 0; i < this.macdLine.length; i++) {
            const macdValue = this.macdLine[i];
            if (i === 0) {
                this.signalValues.push(macdValue);
            } else {
                const signal = (macdValue - this.signalValues[i - 1]) * multiplier + this.signalValues[i - 1];
                this.signalValues.push(signal);
            }
        }
        this.signalLine = this.signalValues;
    }

    calculateHistogram() {
        for (let i = 0; i < this.macdLine.length; i++) {
            const histogramValue = this.macdLine[i] - this.signalLine[i];
            this.histogram.push(histogramValue);
        }
    }

    paint() {
        const macdColor = this.config.style.macd;
        const signalColor = this.config.style.signal;
        const histogramColor = this.config.style.histogram;

        drawHorizontalLine(this.pane, 0, histogramColor);
        drawHistogram(this.pane, this.histogram, histogramColor);

        drawLine(this.pane, this.macdLine, macdColor);
        drawLine(this.pane, this.signalLine, signalColor);
    }
    
    paintAxis() {
        paintAxisLabel(this.macdLine[this.macdLine.length - 1 + Math.min(this.pane.chart.offset, 0)], this.config.style.macd, this.pane);
        paintAxisLabel(this.signalLine[this.signalLine.length - 1 + Math.min(this.pane.chart.offset, 0)], this.config.style.signal, this.pane);
    }

    dataWindow() {
        if (this.data.length < 1) {
            console.error("Not enough data points to calculate change.");
            return;
        }

        const macd = this.macdLine[this.macdLine.length - 1 + Math.min(this.pane.chart.offset, 0)];
        const signal = this.signalLine[this.signalLine.length - 1 + Math.min(this.pane.chart.offset, 0)];

        const wrapper = createElement('div', 'wrapper');

        const label = createElement('span', '', { fontSize: '13px' });
        label.textContent = `${this.config.displayName} ${this.config.inputs.fast} ${this.config.inputs.signal} ${this.config.inputs.slow}`;

        wrapper.append(label);

        const values = [macd, signal];
        const colors = [this.config.style.macd, this.config.style.signal];

        values.forEach((value, index) => {
            const valueCell = createElement('span', '', { fontSize: '13px', color: colors[index] });
            valueCell.textContent = ` ${value.toFixed(2)}`;

            wrapper.append(valueCell);
        });

        return wrapper;
    }

    getDataRange() {

        const minmax = getDataRange(this.pane, [this.macdLine, this.signalLine])

        this.min = minmax.min;
        this.max = minmax.max;

        return minmax;
    }
}
