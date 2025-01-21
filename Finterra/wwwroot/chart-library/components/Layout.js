import { createElement, buttonHover } from '../Utils.js'
import { Menu } from '../components.js';
import {
    LAYOUT_ICON, ONE_CHART_ICON, TWO_CHART_2h_ICON, TWO_CHART_2v_ICON,
    THREE_CHART_3h_ICON,
    THREE_CHART_3v_ICON,
    THREE_CHART_1v_2v_ICON,
    THREE_CHART_2v_1v_ICON,
    THREE_CHART_1h_2h_ICON,
    THREE_CHART_2h_1h_ICON
} from '../Utils/Icons.js';

export class Layout {
    constructor(options) {
        this.toolbar = options.toolbar;
        this.initialize();
    }

    initialize() {
        this.button = this.createButton();
        this.toolbar.container.appendChild(this.button);
    }

    createButton() {
        const button = createElement('button', { class: 'toolbar-button' });

        // Add hover effects
        buttonHover(button);

        button.onclick = () => {
            this.onClickEvent();
        }

        const iconSpan = createElement('span', { innerHTML: LAYOUT_ICON });

        button.appendChild(iconSpan);

        return button;
    }

    onClickEvent() {
        const left = this.button.offsetLeft;
        const top = this.button.clientHeight;

        const menu = new Menu({
            top: top,
            left: left,
            trigger: this,
            items: [
                {
                    name: "1",
                    buttons: [
                        { icon: ONE_CHART_ICON, layout: '1' }
                    ]
                },
                {
                    type:"Divider"
                },
                {
                    name: "2",
                    buttons: [
                        { icon: TWO_CHART_2h_ICON, layout: '2h' },
                        { icon: TWO_CHART_2v_ICON, layout: '2v' },
                    ]
                },
                {
                    type: "Divider"
                },
                {
                    name: "3",
                    buttons: [
                        { icon: THREE_CHART_3h_ICON, layout: '3h' },
                        { icon: THREE_CHART_3v_ICON, layout: '3v' },
                        { icon: THREE_CHART_1v_2v_ICON, layout: '1v 2v' },
                        { icon: THREE_CHART_2v_1v_ICON, layout: '2v 1v' },
                        { icon: THREE_CHART_1h_2h_ICON, layout: '1h 2h' },
                        { icon: THREE_CHART_2h_1h_ICON, layout: '2h 1h' },
                    ]
                },
            ]
        });

        menu.appendTo(this.toolbar.flex.container);
    }

    clicked(btn) {
        console.log(btn);
    }
}