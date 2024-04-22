import { createSpan } from '../Utils.js'
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
        const button = document.createElement('button');
        button.style.cssText = "height: 100%; padding: 5px 10px; border: none; background-color: white; text-align: left; float:right";

        // Add hover effects
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#f0f3fa'; // Example hover style
        });

        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = 'white';
        });

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