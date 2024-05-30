﻿import { createSpan, createElement, buttonHover } from '../Utils.js'
import { SETTINGS_ICON } from '../Utils/Icons.js'

export class Settings {
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
        button.style.float = 'right';

        // Add hover effects
        buttonHover(button);

        button.onclick = () => {
            this.onClickEvent();
        }

        const iconSpan = createSpan(SETTINGS_ICON);

        button.appendChild(iconSpan);

        return button;
    }

    onClickEvent() {

    }
}