import { getContrastingColor, paintAxisLabel, getDataRange, paintCandles } from './StudyBase.js';
import { createElement } from '../Utils.js';
import { Crosshair } from '../Charts/crosshair.js';
export class Price {
    constructor(config, data, pane) {
        this.config = config;
        this.data = data;
        this.pane = pane;

        this.min = Infinity; this.max = -Infinity;
    }

    paint() {
        paintCandles(this.pane, this.data, this.config);
    }

    paintAxis() {
        paintAxisLabel(this.data[this.data.length - 1 + Math.min(this.pane.chart.offset, 0)]["close"], "#000000", this.pane);
    }

    dataWindow(crosshairOffset = 0) {
        if (this.data.length < 2) {
            console.error("Not enough data points to calculate change.");
            return;
        }

        const last = this.data[this.data.length - 1 + Math.min(this.pane.chart.offset - crosshairOffset, 0)];
        const prev = this.data[this.data.length - 2 + Math.min(this.pane.chart.offset - crosshairOffset, 0) ];

        const open = last.open.toFixed(2);
        const high = last.high.toFixed(2);
        const low = last.low.toFixed(2);
        const close = last.close.toFixed(2);

        let sign = parseFloat(last.close - prev.close) > 0 ? '+' : '';

        const change = `${sign}${(last.close - prev.close).toFixed(2)}`;
        const percentChange = `(${(((last.close - prev.close) / prev.close) * 100).toFixed(2)}%)`;

        const wrapper = createElement('div', 'wrapper');

        let color = parseFloat(change) > 0 ? this.config.bodyup : this.config.bodydown;        

        const labels = ['O', 'H', 'L', 'C', '', ''];
        const values = [open, high, low, close, change, percentChange];

        values.forEach((value, index) => {
            const labelCell = createElement('span', '', { fontSize: '13px' });
            labelCell.textContent = labels[index];

            const valueCell = createElement('span', '', { fontSize: '13px', color: color, paddingRight: '4px' });
            valueCell.textContent = value;

            wrapper.append(labelCell, valueCell);
        });

        return wrapper;
    }


    getDataRange() {

        this.min = Infinity;
        this.max = -Infinity;

        const minmax = getDataRange(this.pane, [this.data.map(a => a["low"]), this.data.map(a => a["high"])]);

        this.min = minmax.min;
        this.max = minmax.max;

        return minmax;
    }
}
