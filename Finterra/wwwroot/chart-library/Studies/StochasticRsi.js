import { paintAxisLabel, drawLine, drawHistogram, getDataRange, drawHorizontalLine } from './StudyBase.js';
import { createElement, getContrastingColor } from '../Utils.js';

export class StochasticRSI {
    constructor(config, data, pane) {
        this.config = config;
        this.data = data;
        this.pane = pane;
        this.rsiLength = config.inputs.rsi || 14;
        this.stochasticLength = config.inputs.stochastic || 14;
        this.kPeriod = config.inputs.k || 3;
        this.dPeriod = config.inputs.d || 3;

        this.gains = [];
        this.losses = [];
        this.avgGain = [];
        this.avgLoss = [];
        this.rsiValues = [];
        this.stochasticValues = [];
        this.kValues = [];
        this.dValues = [];

        this.calculate();
    }

    calculate() {
        for (let i = 1; i < this.data.length; i++) {
            this.calculateStep(i);
        }
    }

    calculateStep(i) {
        this.calculateGainLoss(i);
        this.updateMovingAverages(i);
        this.calculateRSI(i);
        this.calculateStochasticRSI(i);
        this.calculateK(i);
        this.calculateD(i);
    }

    calculateGainLoss(i) {
        const change = this.data[i].close - this.data[i - 1].close;
        this.gains.push(Math.max(change, 0));
        this.losses.push(Math.max(-change, 0));
    }

    updateMovingAverages(i) {
        if (this.gains.length == this.rsiLength) {
            const initialAvgGain = this.gains.reduce((a, b) => a + b, 0) / this.rsiLength;
            const initialAvgLoss = this.losses.reduce((a, b) => a + b, 0) / this.rsiLength;
            this.avgGain.push(initialAvgGain);
            this.avgLoss.push(initialAvgLoss);
        } else if (this.avgGain.length > 0) {
            const lastAvgGain = this.avgGain[this.avgGain.length - 1];
            const lastAvgLoss = this.avgLoss[this.avgLoss.length - 1];
            const newAvgGain = (this.gains[this.gains.length - 1] + lastAvgGain * (this.rsiLength - 1)) / this.rsiLength;
            const newAvgLoss = (this.losses[this.losses.length - 1] + lastAvgLoss * (this.rsiLength - 1)) / this.rsiLength;
            this.avgGain.push(newAvgGain);
            this.avgLoss.push(newAvgLoss);
        }
    }

    calculateRSI(i) {
        if (this.avgGain.length > 0 && this.avgLoss.length > 0) {
            const currentAvgGain = this.avgGain[this.avgGain.length - 1];
            const currentAvgLoss = this.avgLoss[this.avgLoss.length - 1];
            const rsi = currentAvgLoss === 0 ? 100 : 100 - (100 / (1 + (currentAvgGain / currentAvgLoss)));
            this.rsiValues.push(rsi);
        }
    }

    calculateStochasticRSI(i) {
        if (this.rsiValues.length >= this.stochasticLength) {
            const rsis = this.rsiValues.slice(-this.stochasticLength);
            const max = Math.max(...rsis);
            const min = Math.min(...rsis);
            const stochasticRsi = ((this.rsiValues[this.rsiValues.length - 1] - min) / (max - min)) * 100;
            this.stochasticValues.push(stochasticRsi);
        }
    }

    calculateK(i) {
        if (this.stochasticValues.length >= this.kPeriod) {
            const k = this.stochasticValues.slice(-this.kPeriod).reduce((a, b) => a + b, 0) / this.kPeriod;
            this.kValues.push(k);
        }
    }

    calculateD(i) {
        if (this.kValues.length >= this.dPeriod) {
            const d = this.kValues.slice(-this.dPeriod).reduce((a, b) => a + b, 0) / this.dPeriod;
            this.dValues.push(d);
        }
    }


    update(newOHLC) {
        // Replace the last data point
        this.data[this.data.length - 1] = newOHLC;

        // Recalculate gains, losses, averages, and indicators for the last data point
        let lastIndex = this.data.length - 1;
        if (lastIndex > 0) {
            this.calculateStep(lastIndex);
        }
    }

    add(newOHLC) {
        // Add a new data point and calculate its metrics
        this.data.push(newOHLC);
        this.calculateStep(this.data.length - 1);
    }


    paint() {

        drawHorizontalLine(this.pane, 80, this.config.style.upperband);
        drawHorizontalLine(this.pane, 50, this.config.style.middleband);
        drawHorizontalLine(this.pane, 20, this.config.style.lowerband);


        const kColor = this.config.style.k;
        const dColor = this.config.style.d;

        drawLine(this.pane, this.dValues, dColor);
        drawLine(this.pane, this.kValues, kColor);
    }

    paintAxis() {

        paintAxisLabel(this.kValues[this.kValues.length - 1 + Math.min(this.pane.chart.offset, 0)], this.config.style.k, this.pane);
        paintAxisLabel(this.dValues[this.dValues.length - 1 + Math.min(this.pane.chart.offset, 0)], this.config.style.d, this.pane);
    }

    dataWindow(crosshairOffset = 0) {
        if (this.data.length < 1) {
            console.error("Not enough data points to calculate change.");
            return;
        }

        const k = this.kValues[this.kValues.length - 1 + Math.min(this.pane.chart.offset - crosshairOffset, 0)];
        const d = this.dValues[this.dValues.length - 1 + Math.min(this.pane.chart.offset - crosshairOffset, 0)];

        const wrapper = createElement('div', 'wrapper');

        const label = createElement('span', '', { fontSize: '13px' });
        label.textContent = `${this.config.displayName} ${this.config.inputs.k} ${this.config.inputs.d} ${this.config.inputs.rsi} ${this.config.inputs.stochastic}`;

        wrapper.append(label);

        const values = [k, d];
        const colors = [this.config.style.k, this.config.style.d];

        values.forEach((value, index) => {
            const valueCell = createElement('span', '', { fontSize: '13px', color: colors[index] });
            valueCell.textContent = ` ${value.toFixed(2)}`;

            wrapper.append(valueCell);
        });

        return wrapper;
    }

    getDataRange() {
        const minmax = { min: 0, max: 100 };
        this.min = minmax.min;
        this.max = minmax.max;

        return minmax;
    }
}

