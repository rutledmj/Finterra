import { createElement, buttonHover  } from '../Utils.js'
import { NEW_CHART_ICON } from '../Utils/Icons.js';

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

        const iconSpan = createElement('span', { innerHTML: NEW_CHART_ICON });
        //createSpan(NEW_CHART_ICON);

        button.appendChild(iconSpan);

        return button;
    }

    onClickEvent() {

    }
}