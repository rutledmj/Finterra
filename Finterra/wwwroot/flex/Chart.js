import { createElement } from './Utils.js';
import { Indicators } from './Studies/Studies.js';
export class Chart {
    constructor({ symbol, interval, depth, workspace }) {
        Object.assign(this, { symbol, interval, depth, workspace });

        this.workspaceHeight = this.workspace.container.clientHeight;
        this.workspaceWidth = this.workspace.container.clientWidth;
        this.workspaceContainer = this.workspace.container;

        this.dateAxisHeight = 28;
        this.priceAxisWidth = 60;

        this.barSpacing = 8;
        this.barWidth = 12;

        this.backgroundColor ="#fff";

        this.borderColor = "#c0c0c0";

        this.initialize();
    }

    initialize() {
        this.chartWrapper = createElement('div', 'chart-wrapper', {
            width: `${this.workspaceWidth}px`, height: `${this.workspaceHeight}px`, position: 'relative'
        });

        this.onWheelScroll();

        this.dateAxis = this.createAxis('date-axis', this.workspaceWidth - this.priceAxisWidth, this.dateAxisHeight, { bottom: 0, left: 0, position: 'absolute' });

        this.createPanes();

        this.workspaceContainer.appendChild(this.chartWrapper);
    }

    onWheelScroll() {
        this.chartWrapper.onwheel = (e) => {
            e.preventDefault();

            this.barSpacing = Math.max(Math.sign(e.deltaY) + this.barSpacing, 1);
            this.barWidth = Math.max(Math.sign(e.deltaY) + this.barWidth, 1);

            for (let pane of this.panes) {
                pane.getDataRange();
                pane.clear();
                pane.paint();
                pane.paintAxis();
            }
        }
    }

    createPanes() {
        const pricePane = {
            interval: this.interval,
            price: {
                name: 'candlestick',
                bodyup: '#089981',
                bodydown: '#f23645',
                borderup: '#089981',
                borderdown: '#f23645',
                wickup: '#089981',
                wickdown: '#f23645',
            },
            overlays: [
                {
                    name: "sma",
                    inputs: {
                        length: 2,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: '#ff0000'
                    },
                    yscale: false
                },
                {
                    name: "sma",
                    inputs: {
                        length: 3,
                        offset: 3,
                        source: 'close'
                    },
                    style: {
                        color: '#00ff00',
                    },
                    yscale: false
                },
                {
                    name: "sma",
                    inputs: {
                        length: 21,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: '#00008b'
                    },
                    yscale: false
                },
                {
                    name: "sma",
                    inputs: {
                        length: 34,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: '#1e90ff'
                    },
                    yscale: false
                },
                {
                    name: "sma",
                    inputs: {
                        length: 55,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: '#ff8c00'
                    },
                    yscale: false
                },
                {
                    name: "sma",
                    inputs: {
                        length: 89,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: '#008080'
                    },
                    yscale: false
                },
                {
                    name: "sma",
                    inputs: {
                        length: 144,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: '#ffffff'
                    },
                    yscale: false
                },
                {
                    name: "sma",
                    inputs: {
                        length: 233,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: '#000000'
                    },
                    yscale: false
                },
                {
                    name: "sma",
                    inputs: {
                        length: 377,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: '#a52a2a '
                    },
                    yscale: false
                },
                {
                    name: "sma",
                    inputs: {
                        length: 610,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: '#800080'
                    },
                    yscale: false
                },
                {
                    name: "sma",
                    inputs: {
                        length: 987,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: '#ffc0cb'
                    },
                    yscale: false
                },
                {
                    name: "bollingerband",
                    inputs: {
                        length: 21,
                        stddev: 2,
                        source: 'close'
                    },
                    style: {
                        upper: 'blue',
                        lower: 'blue'
                    }
                },
                {
                    name: "autowave",
                    inputs: {
                        length: 21,
                    },
                    style: {
                        color: 'yellow'
                    }
                },
            ]
        };
        const panesJSON =
            [
                {
                    studies: [{
                        name: 'stochrsi',
                        display: 'Stoch RSI',
                        inputs: {
                            k: 3,
                            d: 5,
                            rsi: 13,
                            stochastic: 12, 
                            source: 'close'
                        },
                        style: {
                            k: 'red',
                            d: 'lime',
                            upperband: 'teal',
                            lowerband: 'teal'
                        }
                    }]
                },
                {
                    studies: [{
                        name: 'macd',
                        display: 'MACD',
                        inputs: {
                            fast: 12,
                            signal: 26,
                            slow: 9,
                            source: 'close'
                        },
                        style: {
                            macd: 'red',
                            signal: 'lime',
                            histogram: 'black',
                            zeroline: 'black'
                        }
                    }]
                },
                {
                    studies: [{
                        name: 'dmi',
                        display:'DMI',
                        inputs: {
                            length:5,
                            source: 'close'
                        },
                        style: {
                            plusdi: 'red',
                            minusdi: 'lime',
                        }
                    }]
                }
            ];

        const paneCount = panesJSON.length + 1;
        const paneHeight = (this.workspaceHeight - this.dateAxisHeight) / paneCount;
        const paneWidth = this.workspaceWidth - this.priceAxisWidth;

        this.panes = [];

        // Create and add the price pane first
        this.addPane(pricePane, paneWidth, paneHeight, 0);

        // Create and add additional panes based on panesJSON
        panesJSON.forEach((paneConfig, idx) => {
            this.addPane(paneConfig, paneWidth, paneHeight, paneHeight * (idx + 1));
        });

        this.panes.forEach(pane => pane.appendTo(this.chartWrapper));
    }

    addPane(options, width, height, top) {
        const paneOptions = {
            chart: this,
            options, // Assuming Pane constructor is adapted to accept these options
            height,
            width,
            top
        };
        this.panes.push(new Pane(paneOptions));
    }

    createAxis(className, width, height, style = {}) {
        const axis = createElement('canvas', className, { backgroundColor: this.backgroundColor, ...style }, { height: `${height}px`, width: `${width}px` });
        this.chartWrapper.appendChild(axis);
        return axis;
    }
}

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

        this.container.append(this.pane, this.axis);
    }

    createPane() {
        return createElement('canvas', 'price-pane', { backgroundColor: this.chart.backgroundColor, position: 'absolute', left: '0' }, { height: `${this.height - 1}px`, width: `${this.width}px` });
    }

    createAxis() {
        return createElement('canvas', 'price-axis', { backgroundColor: this.chart.backgroundColor, position: 'absolute', right: '0', borderLeft: '1px solid #e0e3eb' }, { height: `${this.height - 1}px`, width: `${this.chart.priceAxisWidth}px` });
    }

    appendTo(parent) {
        this.initialize();
        parent.appendChild(this.container);
    }

    calculate(data) {
        if (this.options.overlays)
            for (let overlay of this.options.overlays) {
                const indicatorClass = Indicators[overlay.name.toUpperCase()];
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

        if (this.options.price) {
            this.options.price.getDataRange();
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
        if (this.options.overlays)
            for (let overlay of this.options.overlays) {
                if (overlay.indicator && typeof overlay.indicator.paint !== 'undefined') {
                    overlay.indicator.paint();
                }
            }

        if (this.options.price) {
            this.options.price.paint();
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
    }



    paintAxisTicks() {
        const range = this.max - this.min;
        const stepCount = 5;
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

        const minTick = Math.ceil(this.min / interval) * interval;
        const maxTick = Math.floor(this.max / interval) * interval;

        const ctx = this.axis.getContext('2d');
        ctx.beginPath();
        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = 1;
        ctx.font = "12px Arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "#aaa";

        for (let value = minTick; value <= maxTick; value += interval) {
            const y = Math.floor(height - ((value - this.min) / range) * height) + 0.5;

            ctx.fillText(value.toFixed(2), width / 2, y);
            ctx.moveTo(0, y);
            ctx.lineTo(5, y);
            ctx.stroke();
        }

        ctx.closePath();
    }

    paintDataWindow() { }

    paintCrosshairs() { }

    paintGrid() { }
}

export class PricePane {
    constructor() { }
}