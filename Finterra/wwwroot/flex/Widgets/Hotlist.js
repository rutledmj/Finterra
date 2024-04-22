import { createDiv } from '../Utils.js'
import { HOTLIST_ICON } from '../Utils/Icons.js';

export class Hotlist {
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
        button.style.cssText = "width: 100%; padding: 5px 10px; border: none; background-color: white;";

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

        const iconDiv = createDiv(HOTLIST_ICON);

        button.appendChild(iconDiv);

        return button;
    }

    onClickEvent() {

    }
}