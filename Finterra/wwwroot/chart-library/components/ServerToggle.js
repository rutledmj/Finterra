import { createElement, buttonHover } from '../Utils.js'
import { SERVER_TOGGLE_ICON } from '../Utils/Icons.js'

export class ServerToggle {
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
        //createElement('button', 'toolbar-button');

        // Add hover effects
        buttonHover(button);

        button.onclick = () => {
            this.onClickEvent();
        }

        const iconSpan = createElement('span', { innerHTML: SERVER_TOGGLE_ICON });
            //createSpan(SERVER_TOGGLE_ICON);

        button.appendChild(iconSpan);

        return button;
    }

    onClickEvent() {

    }
}