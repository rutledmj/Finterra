import { buttonHover, createElement } from '../Utils.js'
import { Menu } from '../components.js';
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
        const button = createElement('button', { class: 'toolbar-button' });

        buttonHover(button);

        const items = [
            { name: "Home", icon: HOME_ICON },
            { name: "Help", icon: HELP_ICON },
            { name: "Notifications", icon: NOTIFICATION_ICON },
            { name: "What's New", icon: NEW_ICON },
            { type: "Divider" },
            { name: "Sign Out", icon: SIGNOUT_ICON },
        ];

        items[3].subItems = items;

        button.addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const menu = new Menu({
                triggerElement: e.currentTarget,
                items,
                preferredPlacement: 'bottom-right',
                anchorCorner: 'top-left',
            });
            menu.show();
        });


        //button.onclick = () => {
        //    this.onClickEvent();
        //}

        const iconSpan = createElement('span', { innerHTML: MENU_ICON });

        button.appendChild(iconSpan);

        return button;
    }

    onClickEvent() {
        const left = this.button.clientWidth + this.button.offsetLeft;
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