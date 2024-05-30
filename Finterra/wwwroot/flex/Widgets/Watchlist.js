import { createDiv, createElement, buttonHover } from '../Utils.js'
import { WATCHLIST_ICON } from '../Utils/Icons.js'

export class Watchlist {
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
        button.style.width = '100%';

        // Add hover effects
        buttonHover(button);

        button.onclick = () => {
            this.onClickEvent();
        }

        const iconDiv = createDiv(WATCHLIST_ICON);

        button.appendChild(iconDiv);

        return button;
    }

    onClickEvent() {

    }
}