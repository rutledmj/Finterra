import { createDiv, createElement, buttonHover } from '../Utils.js'
import { DRAWING_ICON } from '../Utils/Icons.js';

export class DrawingTool {
    constructor(options) {
        this.toolbar = options.toolbar;
        this.initialize();
    }

    initialize() {
        const button = this.createButton();
        this.toolbar.container.appendChild(button);
    }

    createButton() {
        const button = createElement('button', 'toolbar-button', { width: '100%' });

        // Add hover effects
        buttonHover(button);

        button.onclick = () => {
            this.onClickEvent();
        }

        const iconDiv = createDiv(DRAWING_ICON);

        button.appendChild(iconDiv);

        return button;
    }

    onClickEvent() {

    }
}