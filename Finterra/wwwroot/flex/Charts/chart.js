﻿import { createElement } from '../Utils.js';
import { Pane } from './pane.js';
import { TimeAxis } from './time-axis.js';

export class Chart {
    constructor({ symbol, interval, depth, workspace }) {
        Object.assign(this, { symbol, interval, depth, workspace });

        this.dateAxisHeight = 28;
        this.priceAxisWidth = 60;

        this.barSpacing = 4;
        this.barWidth = 6;

        this.backgroundColor = "var(--chart-background)";
        this.borderColor = "var(--chart-border)";

        this.offset = 0;

        this.initialize();
    }

    initialize() {
        this.container = createElement('div', 'chart-wrapper', {
            width: `100%`,
            height: `100%`,
            backgroundColor: 'var(--chart-background)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
        });

        this.workspace.container.appendChild(this.container);

        this.onWheelScroll();
        this.onKeyPress();
        this.onResize();

        this.createPanes();

        this.timeAxis = new TimeAxis(this);
    }

    onResize() {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                // Handle the resize event
                console.log(this.panes);

                console.log('Element resized:', entry.target);
                console.log('New width:', entry.contentRect.width);
                console.log('New height:', entry.contentRect.height);
            }
        });

        //resizeObserver.observe(this.chartWrapper);
    }

    onWheelScroll() {
        this.container.onwheel = (e) => {
            e.preventDefault();

            this.barSpacing = Math.max(Math.sign(-e.deltaY) + this.barSpacing, 1);
            this.barWidth = Math.max(Math.sign(-e.deltaY) + this.barWidth, 1);

            for (let pane of this.panes) {
                pane.getDataRange();
                pane.clear();
                pane.paint();
                pane.paintAxis();
            }

            this.timeAxis.clear();
            this.timeAxis.paint();
        }
    }

    onKeyPress() {
        document.onkeydown = (e) => {
            e.preventDefault();

            switch (e.key) {
                case "ArrowLeft":
                    this.updateOffset(1);
                    break;
                case "ArrowRight":
                    this.updateOffset(-1);
                    break;
                case "Home":
                    this.resetOffset();
                    break;
            }
        }
    }

    updateOffset(v) {
        this.offset += v;

        for (let pane of this.panes) {
            pane.getDataRange();
            pane.clear();
            pane.paint();
            pane.paintAxis();
            pane.updateDataWindow();
        }

        this.timeAxis.clear();
        this.timeAxis.paint();
    }

    resetOffset() {
        this.offset = 0;

        for (let pane of this.panes) {
            pane.getDataRange();
            pane.clear();
            pane.paint();
            pane.paintAxis();
            pane.updateDataWindow();
        }

        this.timeAxis.clear();
        this.timeAxis.paint();
    }

    createPanes() {

        const paneCount = this.panesJSON.length + 1;
        const paneHeight = (this.workspace.container.clientHeight - this.dateAxisHeight) / paneCount;
        const paneWidth = this.workspace.container.clientWidth - this.priceAxisWidth;

        this.panes = [];

        // Create and add the price pane first
        this.addPane(this.pricePane, paneWidth, paneHeight);

        // Create and add additional panes based on panesJSON
        this.panesJSON.forEach((paneConfig, idx) => {
            this.addPane(paneConfig, paneWidth, paneHeight);
        });

        //this.panes.forEach(pane => pane.appendTo(this.container));
    }

    addPane(options, width, height, top, paneCount) {
        const paneOptions = {
            chart: this,
            options, // Assuming Pane constructor is adapted to accept these options
            height,
            width,
        };
        this.panes.push(new Pane(paneOptions));
    }

    paint() {
        this.timeAxis.paint(this.data);
        for (let pane of this.panes) {
            pane.calculate(this.data);
            pane.getDataRange();
            pane.paint();
            pane.paintAxis();
            pane.updateDataWindow();
        }
    }

    pricePane = {
        interval: this.interval,
        price: {
            name: 'candlestick',
            bodyup: '#fff',//'#94b694',//'#089981',
            bodydown: '#ff0000',//#b69494',//'#f23645',
            borderup: '#fff', //'#94b694',//'#089981',
            borderdown: '#ff0000',//'#b69494',//'#f23645',
            wickup: '#fff', //'#94b694',//'#089981',
            wickdown: '#ff0000',//'#b69494',//'#f23645',
        },
        overlays: [
            {
                name: "SimpleMovingAverage",
                displayName: 'SMA',
                inputs: {
                    length: 2,
                    offset: 0,
                    source: 'close'
                },
                style: {
                    color: '#ff0000',
                    thickness: 2
                },
                yscale: false
            },
            {
                name: "SimpleMovingAverage",
                displayName: 'SMA',
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
                name: "SimpleMovingAverage",
                displayName: 'SMA',
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
                name: "SimpleMovingAverage",
                displayName: 'SMA',
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
                name: "SimpleMovingAverage",
                displayName: 'SMA',
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
                name: "SimpleMovingAverage",
                displayName: 'SMA',
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
                name: "SimpleMovingAverage",
                displayName: 'SMA',
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
                name: "SimpleMovingAverage",
                displayName: 'SMA',
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
                name: "SimpleMovingAverage",
                displayName: 'SMA',
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
                name: "SimpleMovingAverage",
                displayName: 'SMA',
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
                name: "BollingerBands",
                displayName: 'BB',
                inputs: {
                    length: 21,
                    stddev: 2,
                    source: 'close'
                },
                style: {
                    upper: '#00008b',
                    lower: '#00008b',
                    middle: '#00008b',
                },
                yscale: false
            },
            {
                name: "autowave",
                name: "AW",
                inputs: {
                    length: 21,
                },
                style: {
                    color: 'yellow'
                }
            },
        ]
    };
    panesJSON =
        [
            {
                studies: [{
                    name: 'StochasticRSI',
                    displayName: 'Stoch RSI',
                    inputs: {
                        k: 3,
                        d: 5,
                        rsi: 13,
                        stochastic: 21,
                        source: 'close'
                    },
                    style: {
                        k: 'red',
                        d: 'lime',
                        upperband: 'teal',
                        lowerband: 'teal',
                        middleband: 'teal',
                    },
                    yscale: true
                }]
            },
            {
                studies: [{
                    name: 'MACD',
                    displayName: 'MACD',
                    inputs: {
                        fast: 12,
                        signal: 26,
                        slow: 9,
                        source: 'close'
                    },
                    style: {
                        macd: 'red',
                        signal: 'lime',
                        histogram: 'teal',
                        zeroline: 'teal'
                    },
                    yscale: true
                }]
            },
            {
                studies: [{
                    name: 'ADX',
                    displayName: 'ADX',
                    inputs: {
                        length: 5,
                        source: 'close'
                    },
                    style: {
                        plusdi: 'red',
                        minusdi: 'lime',
                    },
                    yscale: true
                }]
            }
        ];
}
