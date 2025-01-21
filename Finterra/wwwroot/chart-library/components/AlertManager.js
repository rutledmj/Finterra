import { buttonHover, createElement } from '../Utils.js'
import { Menu } from '../components.js';
import { ALERT_MANAGER_ICON } from '../Utils/Icons.js';

export class AlertManager {
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
//            createElement('button', 'toolbar-button');

        // Add hover effects
        buttonHover(button);

        button.onclick = () => {
            this.onClickEvent();
        }

        const iconSpan = createElement('span', { innerHTML: ALERT_MANAGER_ICON })
//            createSpan(ALERT_MANAGER_ICON);

        button.appendChild(iconSpan);

        return button;
    }

    onClickEvent() {

    }
}