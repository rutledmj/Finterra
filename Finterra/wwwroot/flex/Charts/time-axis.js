﻿import { createElement } from '../Utils.js';

export class TimeAxis {
    constructor(chart) {
        this.chart = chart;
        this.format = {
            Year: "yyyy",
            Month: "MMM",
            Week: "dd",
            Day: "dd",
            Hour: "HH"
        };
        this.increment = {
            Year: 'Year',
            Month: 'Month',
            Week: 'Week',
            Day: 'Day',
            Hour: 'Hour',
        };
        this.spans = this.initializeSpans();
        this.createAxis('date-axis', chart.workspaceWidth - chart.priceAxisWidth, chart.dateAxisHeight, { bottom: 0, left: 0, position: 'absolute' });
    }

    initializeSpans() {
        return [
            { amount: 10, increment: this.increment.Year },
            { amount: 5, increment: this.increment.Year },
            { amount: 1, increment: this.increment.Month },
            { amount: 2, increment: this.increment.Week },
            { amount: 1, increment: this.increment.Week },
            { amount: 2, increment: this.increment.Day },
            { amount: 1, increment: this.increment.Day },
            { amount: 2, increment: this.increment.Hour },
            { amount: 1, increment: this.increment.Hour }
        ].map(span => new DateSpan(span, this.format[span.increment]));
    }

    createAxis(className, width, height, style = {}) {
        const axis = createElement('canvas', className, { backgroundColor: 'transparent', ...style }, { height: `${height}px`, width: `${width}px` });
        this.chart.chartWrapper.appendChild(axis);
        this.canvas = axis;
    }

    clear() {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    paint() {
        const data = this.chart.data;
        const ctx = this.canvas.getContext('2d');
        ctx.lineWidth = 1;
        const { barSpacing, barWidth } = this.chart;
        const paneWidth = this.canvas.width;
        const barsCount = Math.floor(paneWidth / (barSpacing + barWidth));
        const startIndex = Math.max(0, data.length - barsCount);
        const endIndex = data.length - 1;
        const ticks = this.getTicks(data);

        ticks.forEach(tick => {
            const x = (tick.index - startIndex) * (barSpacing + barWidth);
            ctx.font = "12px Arial";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            ctx.fillText(tick.display, x, this.canvas.height / 2);
        });

        this.ticks = ticks;
    }

    getTicks(data) {
        const { barSpacing, barWidth } = this.chart;
        const paneWidth = this.canvas.width;
        const barsCount = Math.floor(paneWidth / (barSpacing + barWidth));
        const startIndex = Math.max(0, data.length - barsCount);
        const endIndex = data.length - 1;

        let responseTicks = [];

        this.spans.forEach(datespan => {
            let ticks = [];
            for (let i = startIndex; i <= endIndex; i++) {
                if (data[i]) {
                    const currentDate = new Date(data[i].dateTime);
                    const previousDate = new Date(data[i - 1]?.dateTime || currentDate);
                    if (this.shouldAddTick(currentDate, previousDate, datespan)) {
                        ticks.push(new Tick(currentDate, this.displayDate(currentDate, datespan.increment), i));
                    }
                }
            }

            if (ticks.length + responseTicks.length < 20)
                responseTicks = [...new Set([...responseTicks,...ticks])];
        });

        return responseTicks.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.index === value.index
            ))
        )
    }

    shouldAddTick(currentDate, previousDate, datespan) {
        return this.formatDate(currentDate, datespan.increment) !== this.formatDate(previousDate, datespan.increment) &&
            (parseInt(this.formatDate(currentDate, datespan.increment), 10) % datespan.amount) === 0;
    }

    displayDate(date, format) {
        switch (format) {
            case this.increment.Year:
                return date.getFullYear().toString();
            case this.increment.Month:
                return date.toLocaleString('default', { month: 'short' });
            case this.increment.Week:
                return date.getDate().toString().padStart(2, '0');
            case this.increment.Day:
                return date.getDate().toString().padStart(2, '0');
            case this.increment.Hour:
                return `${date.getHours()}:${date.getMinutes()}`;
            default:
                return date.toISOString();
        }
    }

    formatDate(date, format) {
        switch (format) {
            case this.increment.Year:
                return date.getFullYear().toString();
            case this.increment.Month:
                return (date.getMonth() + 1).toString().padStart(2, '0');
            case this.increment.Week:
                return this.getIso8601WeekOfYear(date).toString();
            case this.increment.Day:
                return date.getDate().toString().padStart(2, '0');
            case this.increment.Hour:
                return date.getHours().toString().padStart(2, '0');
            default:
                return date.toISOString();
        }
    }

    getIso8601WeekOfYear(date) {
        const target = new Date(date.valueOf());
        const dayNr = (date.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        const jan4 = new Date(target.getFullYear(), 0, 4);
        const dayDiff = (target - jan4) / 86400000;
        return 1 + Math.ceil(dayDiff / 7);
    }
}

class Tick {
    constructor(dateTime, display, index) {
        this.dateTime = dateTime;
        this.display = display;
        this.index = index;
    }
}

class DateSpan {
    constructor({ amount, increment }, format) {
        this.amount = amount;
        this.increment = increment;
        this.format = format;
    }
}