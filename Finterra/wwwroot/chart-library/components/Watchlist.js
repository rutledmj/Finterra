import { createElement, buttonHover } from '../Utils.js'
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
        const button = createElement('button', { class: 'toolbar-button', style: 'width:100%' });
            //createElement('button', 'toolbar-button');
        //button.style.width = '100%';

        // Add hover effects
        buttonHover(button);

        button.onclick = () => {
            this.onClickEvent();
        }

        const iconDiv = createElement('div', { innerHTML: WATCHLIST_ICON });
            //createDiv(WATCHLIST_ICON);

        button.appendChild(iconDiv);

        return button;
    }

    onClickEvent() {

    }
}