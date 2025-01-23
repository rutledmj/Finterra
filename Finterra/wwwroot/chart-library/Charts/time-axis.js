//import { createElement } from '../Utils.js';

//export class TimeAxis {
//    constructor(chart) {
//        this.chart = chart;

//        this.height = 28;

//        this.format = {
//            Year: "yyyy",
//            Month: "MMM",
//            Week: "dd",
//            Day: "dd",
//            Hour: "HH"
//        };
//        this.increment = {
//            Year: 'Year',
//            Month: 'Month',
//            Week: 'Week',
//            Day: 'Day',
//            Hour: 'Hour',
//        };
//        this.spans = this.initializeSpans();

//        this.container = createElement('div', {
//            class: 'time-axis',
//            style: `position:relative;width:100%;height:${this.height}px`
//        });
//        //    createElement('div', 'time-axis', {
//        //    position: 'relative',
//        //    width: '100%',
//        //    height: `${this.height}px`
//        //});

//        this.chart.container.appendChild(this.container);

//        this.canvas = this.createAxis('date-axis',
//            this.container.clientWidth - chart.priceAxisWidth,
//            this.height,
//            { bottom: 0, left: 0, position: 'absolute' });

//        this.crosshairCanvas = this.createCrosshairAxis('date-axis',
//            this.container.clientWidth - chart.priceAxisWidth, this.height, { bottom: 0, left: 0, position: 'absolute' });

//        this.container.append(this.canvas, this.crosshairCanvas);

//    }

//    initializeSpans() {
//        return [
//            { amount: 10, increment: this.increment.Year },
//            { amount: 5, increment: this.increment.Year },
//            { amount: 1, increment: this.increment.Month },
//            { amount: 2, increment: this.increment.Week },
//            { amount: 1, increment: this.increment.Week },
//            { amount: 2, increment: this.increment.Day },
//            { amount: 1, increment: this.increment.Day },
//            { amount: 2, increment: this.increment.Hour },
//            { amount: 1, increment: this.increment.Hour }
//        ].map(span => new DateSpan(span, this.format[span.increment]));
//    }

//    createAxis(className, width, height, style = {}) {
//        const axis = createElement('canvas', {
//            class: className,
//            style: `background-color:var(--axis-background); bottom:0; left:0;position:absolute`,
//            height: `${height}px`,
//            width: `${width}px`
//        });
//            //createElement('canvas', className, { backgroundColor: 'var(--axis-background)', ...style }, { height: `${height}px`, width: `${width}px` });
//        return axis;
//    }

//    createCrosshairAxis(className, width, height, style = {}) {
//        const axis = createElement('canvas', {
//            class: className,
//            style: `background-color:transparent;bottom:0; left:0; position:absolute`,
//            height: `${height}px`, width: `${width}px`
//        });
////            createElement('canvas', className, { backgroundColor: 'transparent', ...style }, { height: `${height}px`, width: `${width}px` });
//        return axis;
//    }

//    clear() {
//        const ctx = this.canvas.getContext('2d');
//        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
//    }

//    paint() {
//        const data = this.chart.data;
//        const ctx = this.canvas.getContext('2d');
//        ctx.lineWidth = 1;
//        const { barSpacing, barWidth } = this.chart;
//        const paneWidth = this.canvas.width;
//        const barsCount = Math.floor(paneWidth / (barSpacing + barWidth));
//        const startIndex = Math.max(0, data.length - barsCount + this.chart.offset);
//        const endIndex = data.length - 1;
//        const ticks = this.getTicks(data);

//        ticks.forEach(tick => {
//            const x = (tick.index - startIndex) * (barSpacing + barWidth);
//            ctx.font = "12px Arial";
//            ctx.textBaseline = "middle";
//            ctx.textAlign = "center";
//            ctx.fillStyle = "#aaa";
//            ctx.fillText(tick.display, x, this.canvas.height / 2);
//        });

//        this.ticks = ticks;
//    }

//    getTicks(data) {
//        const { barSpacing, barWidth } = this.chart;
//        const paneWidth = this.canvas.width;
//        const barsCount = Math.floor(paneWidth / (barSpacing + barWidth));
//        const startIndex = Math.max(0, data.length - barsCount);
//        const endIndex = data.length - 1;

//        let responseTicks = [];

//        this.spans.forEach(datespan => {
//            let ticks = [];
//            for (let i = startIndex; i <= endIndex; i++) {
//                if (data[i]) {
//                    const currentDate = new Date(data[i].dateTime);
//                    const previousDate = new Date(data[i - 1]?.dateTime || currentDate);
//                    if (this.shouldAddTick(currentDate, previousDate, datespan)) {
//                        ticks.push(new Tick(currentDate, this.displayDate(currentDate, datespan.increment), i));
//                    }
//                }
//            }

//            if (ticks.length + responseTicks.length < 20)
//                responseTicks = [...new Set([...responseTicks,...ticks])];
//        });

//        return responseTicks.filter((value, index, self) =>
//            index === self.findIndex((t) => (
//                t.index === value.index
//            ))
//        )
//    }

//    shouldAddTick(currentDate, previousDate, datespan) {
//        return this.formatDate(currentDate, datespan.increment) !== this.formatDate(previousDate, datespan.increment) &&
//            (parseInt(this.formatDate(currentDate, datespan.increment), 10) % datespan.amount) === 0;
//    }

//    displayDate(date, format) {
//        switch (format) {
//            case this.increment.Year:
//                return date.getFullYear().toString();
//            case this.increment.Month:
//                return date.toLocaleString('default', { month: 'short' });
//            case this.increment.Week:
//                return date.getDate().toString().padStart(2, '0');
//            case this.increment.Day:
//                return date.getDate().toString().padStart(2, '0');
//            case this.increment.Hour:
//                return `${date.getHours()}:${date.getMinutes()}`;
//            default:
//                return date.toISOString();
//        }
//    }

//    formatDate(date, format) {
//        switch (format) {
//            case this.increment.Year:
//                return date.getFullYear().toString();
//            case this.increment.Month:
//                return (date.getMonth() + 1).toString().padStart(2, '0');
//            case this.increment.Week:
//                return this.getIso8601WeekOfYear(date).toString();
//            case this.increment.Day:
//                return date.getDate().toString().padStart(2, '0');
//            case this.increment.Hour:
//                return date.getHours().toString().padStart(2, '0');
//            default:
//                return date.toISOString();
//        }
//    }

//    getIso8601WeekOfYear(date) {
//        const target = new Date(date.valueOf());
//        const dayNr = (date.getDay() + 6) % 7;
//        target.setDate(target.getDate() - dayNr + 3);
//        const jan4 = new Date(target.getFullYear(), 0, 4);
//        const dayDiff = (target - jan4) / 86400000;
//        return 1 + Math.ceil(dayDiff / 7);
//    }
//}

//class Tick {
//    constructor(dateTime, display, index) {
//        this.dateTime = dateTime;
//        this.display = display;
//        this.index = index;
//    }
//}

//class DateSpan {
//    constructor({ amount, increment }, format) {
//        this.amount = amount;
//        this.increment = increment;
//        this.format = format;
//    }
//}

// File: chart/time-axis.js

/**
 * A simplistic horizontal time axis at the bottom of the chart.
 */
export class TimeAxis {
    constructor(options) {
        this.parent = options.parent;
        this.width = options.width || 800;
        this.height = options.height || 50;
        this.offsetTop = options.offsetTop || 400;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        Object.assign(this.canvas.style, {
            position: 'absolute',
            top: `${this.offsetTop}px`,
            left: '0'
        });

        this.ctx = this.canvas.getContext('2d');
        this.parent.appendChild(this.canvas);
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Draw a line representing the axis
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width, 0);
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Simple label
        ctx.fillStyle = '#000';
        ctx.font = '12px sans-serif';
        ctx.fillText('Time Axis', 5, 15);
    }
}
