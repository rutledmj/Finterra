import { createSpan } from '../Utils.js'
import { GOTODATE_ICON } from '../Utils/Icons.js'

export class GoToDate {
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
        button.style.cssText = "height: 100%; padding: 5px 10px; border: none; background-color: white; text-align: left;";

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

        const iconSpan = createSpan(GOTODATE_ICON);

        button.appendChild(iconSpan);

        return button;
    }

    onClickEvent() {

    }
}