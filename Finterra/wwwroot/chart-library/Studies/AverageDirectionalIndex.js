import { drawLine, drawHorizontalLine, getDataRange, paintAxisLabel } from './StudyBase.js';
import { createElement, getContrastingColor } from '../Utils.js';

export class ADX {
    constructor(config, data, pane) {
        this.config = config;
        this.data = data;
        this.pane = pane;
        this.length = config.inputs.length || 14;

        this.trueRange = [];
        this.plusDM = [];
        this.minusDM = [];

        this.smoothedTR = [];
        this.smoothedPlusDM = [];
        this.smoothedMinusDM = [];

        this.plusDI = [];
        this.minusDI = [];

        this.adx = [];

        this.calculate();
    }

    calculate() {
        for (let i = 1; i < this.data.length; i++) {
            this.calculateStep(i);
        }
    }

    calculateStep(i) {
        this.calculateTR(i);
        this.calculatePlusDM(i);
        this.calculateMinusDM(i);

        this.calculateSmoothedPlusDM(i);
        this.calculateSmoothedMinusDM(i);
        this.calculateSmoothedTR(i);

        this.calculatePlusDI(i);
        this.calculateMinusDI(i);
    }

    calculateTR(i) {
        const high = this.data[i].high;
        const low = this.data[i].low;
        const closePrev = this.data[i - 1].close;

        const tr = Math.max(high - low, Math.abs(high - closePrev), Math.abs(low - closePrev));
        this.trueRange.push(tr);
    }

    calculatePlusDM(i) {
        const high = this.data[i].high;
        const low = this.data[i].low;
        const closePrev = this.data[i - 1].close;

        const upMove = high - this.data[i - 1].high;
        const downMove = this.data[i - 1].low - low;

        const plusDM = upMove > downMove ? Math.max(high - this.data[i - 1].high, 0) : 0;
        this.plusDM.push(plusDM);
    }

    calculateMinusDM(i) {
        const high = this.data[i].high;
        const low = this.data[i].low;
        const closePrev = this.data[i - 1].close;

        const upMove = high - this.data[i - 1].high;
        const downMove = this.data[i - 1].low - low;

        const minusDM = downMove > upMove ? Math.max(this.data[i - 1].low - low, 0) : 0;
        this.minusDM.push(minusDM);
    }

    calculateSmoothedTR(i) {
        if (this.trueRange.length == this.length) {
            const smoothedTR = this.trueRange.reduce((a, b) => a + b, 0) / this.length;
            this.smoothedTR.push(smoothedTR);
        } else if (this.trueRange.length > this.length) {
            const smoothedTR = this.smoothedTR[this.smoothedTR.length - 1] - this.smoothedTR[this.smoothedTR.length - 1] / this.length + this.trueRange[this.trueRange.length - 1];
            this.smoothedTR.push(smoothedTR);
        }
    }

    calculateSmoothedPlusDM(i) {
        if (this.plusDM.length == this.length) {
            const smoothedPlusDM = this.plusDM.reduce((a, b) => a + b, 0) / this.length;
            this.smoothedPlusDM.push(smoothedPlusDM);
        } else if (this.trueRange.length > this.length) {
            const smoothedPlusDM = this.smoothedPlusDM[this.smoothedPlusDM.length - 1] - this.smoothedPlusDM[this.smoothedPlusDM.length - 1] / this.length + this.plusDM[this.plusDM.length - 1];
            this.smoothedPlusDM.push(smoothedPlusDM);
        }
    }

    calculateSmoothedMinusDM(i) {
        if (this.minusDM.length == this.length) {
            const smoothedMinusDM = this.minusDM.reduce((a, b) => a + b, 0) / this.length;
            this.smoothedMinusDM.push(smoothedMinusDM);
        } else if (this.trueRange.length > this.length) {
            const smoothedMinusDM = this.smoothedMinusDM[this.smoothedMinusDM.length - 1] - this.smoothedMinusDM[this.smoothedMinusDM.length - 1] / this.length + this.minusDM[this.minusDM.length - 1];
            this.smoothedMinusDM.push(smoothedMinusDM);
        }
    }

    calculatePlusDI(i) {
        if (this.smoothedPlusDM.length >= this.length) {
            this.plusDI.push(100.0 * (this.smoothedPlusDM[this.smoothedPlusDM.length - 1] / this.smoothedTR[this.smoothedTR.length - 1]));
        }        
    }

    calculateMinusDI(i) {
        if (this.smoothedMinusDM.length >= this.length) {
            this.minusDI.push(100.0 * (this.smoothedMinusDM[this.smoothedMinusDM.length - 1] / this.smoothedTR[this.smoothedTR.length - 1]));
        }
    }

    calculateADX(i) {
        let dxs = [];
        for (let j = i - this.period + 1; j <= i; j++) {
            const pdi = this.plusDI[j];
            const mdi = this.minusDI[j];
            const dx = (Math.abs(pdi - mdi) / (pdi + mdi)) * 100;
            dxs.push(dx);
        }
        return dxs.reduce((a, b) => a + b, 0) / dxs.length;
    }

    update(newOHLC) {
        this.data[this.data.length - 1] = newOHLC;
        this.calculateStep(this.data.length - 1);
    }

    add(newOHLC) {
        this.data.push(newOHLC);
        this.calculateStep(this.data.length - 1);
    }

    paint() {
        drawLine(this.pane, this.plusDI, this.config.style.plusdi);
        drawLine(this.pane, this.minusDI, this.config.style.minusdi);
    }

    paintAxis() {
        const plusDi = this.plusDI[this.plusDI.length - 1 + Math.min(this.pane.chart.offset, 0)];
        const minusDi = this.minusDI[this.minusDI.length - 1 + Math.min(this.pane.chart.offset, 0)];

        paintAxisLabel(plusDi, this.config.style.plusdi, this.pane);
        paintAxisLabel(minusDi, this.config.style.minusdi, this.pane);
    }

    dataWindow(crosshairOffset = 0) {
        if (this.data.length < 1) {
            console.error("Not enough data points to calculate change.");
            return;
        }

        const plusDi = this.plusDI[this.plusDI.length - 1 + Math.min(this.pane.chart.offset - crosshairOffset, 0)];
        const minusDi = this.minusDI[this.minusDI.length - 1 + Math.min(this.pane.chart.offset - crosshairOffset, 0)];

        const wrapper = createElement('div', 'wrapper');

        const label = createElement('span', '', { fontSize: '13px' });
        label.textContent = `${this.config.displayName} ${this.config.inputs.length}`;

        wrapper.append(label);

        const values = [plusDi, minusDi];
        const colors = [this.config.style.plusdi, this.config.style.minusdi];

        values.forEach((value, index) => {
            const valueCell = createElement('span', '', { fontSize: '13px', color: colors[index] });
            valueCell.textContent = ` ${value.toFixed(2)}`;

            wrapper.append(valueCell);
        });

        return wrapper;
    }

    getDataRange() {

        const minmax = getDataRange(this.pane, [this.plusDI, this.minusDI]);
        this.min = minmax.min;
        this.max = minmax.max;

        return minmax;
    }
}
