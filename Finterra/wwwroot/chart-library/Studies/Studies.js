import { SimpleMovingAverage } from './SMA.js';
import { Price } from './Price.js';
import { BollingerBands } from './bollingerbands.js';
import { MACD } from './MACD.js';
import { StochasticRSI } from './StochasticRsi.js';
import { ADX } from './AverageDirectionalIndex.js';

export const Indicators = {
    SimpleMovingAverage,
    Price,
    BollingerBands,
    MACD,
    StochasticRSI,
    ADX
};

export const Studies = [{
    name: "Moving Average",
    metainfo: {
        defaults: {
            styles: {
                plot_0: {
                    linestyle: 0,
                    linewidth: 1,
                    plottype: 0,
                    transparency: 0,
                    visible: !0,
                    color: "#2196F3"
                }
            },
            inputs: {
                length: 9,
                source: "close",
                offset: 0
            }
        },
        plots: [{
            id: "plot_0",
            type: "line"
        }],
        styles: {
            plot_0: {
                title: "Plot"
            }
        },
        description: "Moving Average",
        shortDescription: "MA",
        is_price_study: !0,
        inputs: [
            {
                id: "length",
                name: "Length",
                defval: 9,
                type: "integer",
                min: 1,
                max: 1e4
            },
            {
                id: "source",
                name: "Source",
                defval: "close",
                type: "source",
                options: ["open", "high", "low", "close"]
            },
            {
                id: "offset",
                name: "Offset",
                defval: 0,
                type: "integer",
                min: -1e4,
                max: 1e4
            }
        ],
        name: "Moving Average"
    },
    constructor: function () {
        this.init = function (context, input) {
            this._context = context;
            this._input = input;
        },
            this.main = function (context, input) {
                this._context = context,
                    this._input = input;

                var length = this._inputs(0),
                    source = this._inputs(1),
                    offset = this._inputs(3);

                var p = Math.sma(length, offset, source);
                return p;
            }
    }
}];