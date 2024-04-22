import { createElement } from './Utils.js';

export class Chart {
    constructor({ symbol, interval, depth, workspace }) {
        Object.assign(this, { symbol, interval, depth, workspace });

        this.workspaceHeight = this.workspace.container.clientHeight;
        this.workspaceWidth = this.workspace.container.clientWidth;
        this.workspaceContainer = this.workspace.container;

        this.dateAxisHeight = 28;
        this.priceAxisWidth = 86;

        this.backgroundColor =
            //"#f5f5f8";
            "#fff";

        this.borderColor = "#c0c0c0";

        this.initialize();
    }

    initialize() {
        this.chartWrapper = createElement('div', 'chart-wrapper', {
            width: `${this.workspaceWidth}px`, height: `${this.workspaceHeight}px`, position: 'relative'
        });

        this.dateAxis = this.createAxis('date-axis', this.workspaceWidth - this.priceAxisWidth, this.dateAxisHeight, { bottom: 0, left: 0, position: 'absolute' });

        this.createPanes();

        this.workspaceContainer.appendChild(this.chartWrapper);
    }

    createPanes() {
        const pricePane = {
            interval: this.interval,
            price: {
                name: 'candlestick',
                bodyup: 'white',
                bodydown: 'red',
                borderup: 'black',
                borderdown: 'black',
                wickup: 'black',
                wickdown: 'black',
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
                        color: 'red'
                    }
                },
                {
                    name: "sma",
                    inputs: {
                        length: 3,
                        offset: 3,
                        source: 'close'
                    },
                    style: {
                        color: 'line'
                    }
                },
                {
                    name: "sma",
                    inputs: {
                        length: 21,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: 'darkblue'
                    }
                },
                {
                    name: "sma",
                    inputs: {
                        length: 34,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: 'dodgerblue'
                    }
                },
                {
                    name: "sma",
                    inputs: {
                        length: 55,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: 'orange'
                    }
                },
                {
                    name: "sma",
                    inputs: {
                        length: 89,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: 'teal'
                    }
                },
                {
                    name: "sma",
                    inputs: {
                        length: 144,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: 'white'
                    }
                },
                {
                    name: "sma",
                    inputs: {
                        length: 233,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: 'black'
                    }
                },
                {
                    name: "sma",
                    inputs: {
                        length: 377,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: 'brown'
                    }
                },
                {
                    name: "sma",
                    inputs: {
                        length: 610,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: 'purple'
                    }
                },
                {
                    name: "sma",
                    inputs: {
                        length: 987,
                        offset: 0,
                        source: 'close'
                    },
                    style: {
                        color: 'pink'
                    }
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
        const paneHeight = (this.workspaceHeight - this.dateAxisHeight) / paneCount - 0;
        const paneWidth = this.workspaceWidth - this.priceAxisWidth - 0;

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
    constructor({ chart, width, height, top }) {
        Object.assign(this, { chart, width, height, top });
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
}


export class PricePane {
    constructor() { }
}