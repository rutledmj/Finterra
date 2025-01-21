import { createElement, buttonHover } from '../Utils.js'
import { CURSOR_ICON } from '../Utils/Icons.js'
export class CursorSelect {
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
//            createElement('button', 'toolbar-button', { width: '100%' });

        // Add hover effects
        buttonHover(button);

        button.onclick = () => {
            this.onClickEvent();
        }

        const iconDiv = createElement('div', { innerHTML: CURSOR_ICON });
//            createDiv(CURSOR_ICON);

        button.appendChild(iconDiv);

        return button;
    }

    onClickEvent() {

    }
}