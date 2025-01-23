import { createElement, buttonHover  } from '../Utils.js'
import { NEW_CHART_ICON } from '../Utils/Icons.js';
import { Chart, Interval } from '../Chart.js';
export class NewChart {
    constructor(options) {
        this.toolbar = options.toolbar;
        this.initialize();
    }

    initialize() {
        const button = this.createButton();
        this.toolbar.container.appendChild(button);
    }

    createButton() {
        const button = createElement('button', { class: 'toolbar-button' });

        // Add hover effects
        buttonHover(button);

        button.onclick = () => {
            this.onClickEvent();
        }

        const iconSpan = createElement('span', {
            innerHTML: NEW_CHART_ICON
        });

        button.appendChild(iconSpan);

        return button;
    }

    onClickEvent() {
        const workspace = document.getElementById("workspace");

        const myChartWindow = new Chart({
            title: 'My Stock Chart',
            stock: 'AAPL',
            interval: new Interval(1, 'day', '1 Day'),
            barWidth: 5,
            barSpacing: 5,
            offset: 10,
            panes: 2,               // create 2 stacked panes
            isMoveable: true,
            isResizable: true,
            isMaximizable: true,
            isCloseable: true,
            isBackdrop: false,
            width: 840,
            height: 680,
            container: workspace
        });
    }
}