import { createSpan, Menu } from '../Utils.js'
import { MENU_ICON, HOME_ICON, HELP_ICON, NOTIFICATION_ICON, NEW_ICON, SIGNOUT_ICON } from '../Utils/Icons.js';

export class Account {
    constructor(options) {
        this.toolbar = options.toolbar;
        this.initialize();
    }

    initialize() {
        const button = this.createButton();
        this.toolbar.container.appendChild(button);

        this.button = button;
    }

    createButton() {
        const button = document.createElement('button');
        button.style.cssText = "height: 100%; padding: 5px 10px; border: none; background-color: white; text-align: left";

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

        const iconSpan = createSpan(MENU_ICON);

        button.appendChild(iconSpan);

        return button;
    }

    onClickEvent() {
        const left = this.button.clientWidth + this.button.clientLeft;
        const top = this.button.clientTop;

        const menu = new Menu({
            top: top, left: left, items: [
                { name: "Home", icon: HOME_ICON },
                { name: "Help", icon: HELP_ICON },
                { name: "Notifications", icon: NOTIFICATION_ICON },
                { name: "What's New", icon: NEW_ICON },
                { type: "Divider" },
                { name: "Sign Out", icon: SIGNOUT_ICON },
            ]
        });

        menu.appendTo(this.toolbar.flex.container);
    }
}