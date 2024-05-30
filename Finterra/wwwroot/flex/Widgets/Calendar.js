import { createDiv, createElement, buttonHover } from '../Utils.js'
import { CALENDAR_ICON } from '../Utils/Icons.js';

export class Calendar {
    constructor(options) {
        this.toolbar = options.toolbar;
        this.initialize();
    }

    initialize() {
        const button = this.createButton();
        this.toolbar.container.appendChild(button);
    }

    createButton() {
        const button = createElement('button', 'toolbar-button');

        // Add hover effects
        buttonHover(button);

        button.onclick = () => {
            this.onClickEvent();
        }

        const iconDiv = createDiv(CALENDAR_ICON);

        button.appendChild(iconDiv);

        return button;
    }

    onClickEvent() {

    }
}