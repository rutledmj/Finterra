import { createElement, buttonHover } from "../Utils.js";

export class Menu {
    constructor(options) {
        this.top = options.top || 0;
        this.left = options.left || 0;
        this.items = options.items || null;

        this.trigger = options.trigger;

        this.handleClickAway = this.handleClickAway.bind(this);

        this.initialize();
    }
    initialize() {
        this.createMenu();
        this.addMenuItems();
    }

    createMenu() {
        this.container = document.createElement('div');
        Object.assign(this.container, {
            style: `padding:6px 0; 
                min-width:260px;
                max-width:360px;
                position:absolute;
                border-radius:5px;
                box-shadow:0 2px 4px #0003;
                z-index:100;
                top:${this.top}px; 
                left:${this.left}px;
                background-color: var(--menu-background);
                height:0;
                overflow:hidden;
                color:var(--color);
                fill:var(--color);
                `
        });

        setTimeout(() => { // using setTimeout to avoid immediate trigger on the same click that opens the menu
            document.addEventListener('click', this.handleClickAway.bind(this), true);
        }, 0);

        return this.container;
    }

    handleClickAway(event) {
        // Check if the click is outside the container
        if (!this.container.contains(event.target)) {
            let height = this.menuHeight;
            const interval = setInterval(() => {
                height -= this.menuHeight / 10;
                this.container.style.height = height + "px";

                if (height <= 0) {
                    clearInterval(interval);
                    // Remove the container
                    this.container.remove();
                }
            }, 5);
            

            // Remove the event listener
            document.removeEventListener('click', this.handleClickAway, true);
        }
    }

    addMenuItems() {
        this.items.forEach(item => {
            this.container.appendChild(this.createMenuItem(item));
        });
    }

    menuHeight = 12;

    createMenuItem(item) {
        const div = document.createElement('div');
        if (item.type === "Divider") {
            Object.assign(div.style, {
                borderBottom: '1px solid var(--menu-divider)',
                height: '1px',
                margin: '8px 0'
            });

            this.menuHeight += 17;
        } else {
            Object.assign(div.style, {
                padding: '8px 16px',
                cursor: 'pointer'
            });

            div.onmouseenter = () => div.style.backgroundColor = 'var(--menu-item-hover)';
            div.onmouseleave = () => div.style.backgroundColor = 'var(--menu-item)';

            if (item.icon) {
                const iconSpan = this.createSpan(item.icon, {
                    width: '21px',
                    display: 'inline-block',
                    textAlign: 'center'
                });

                div.appendChild(iconSpan);
            }

            if (item.name) {
                const textSpan = this.createSpan(item.name, {
                    paddingLeft: '16px'
                });

                div.appendChild(textSpan);
            }

            if (item.buttons) {
                div.style.padding = '0px 16px';
                item.buttons.forEach((btn) => {
                    var button = createElement('button', '', {
                        fill: 'var(--color)', color: 'var(--color)', padding: '5px 10px', border: 'none', backgroundColor: 'transparent'
                    });

                    button.innerHTML = btn.icon;

                    div.appendChild(button);

                    button.onclick = () => {
                        this.trigger.clicked(btn);
                    };
                });
            }

            this.menuHeight += 40;
        }
        return div;
    }

    createSpan(content, style) {
        const span = document.createElement('span');
        Object.assign(span.style, style);
        span.innerHTML = content; // For text content, consider using `textContent` for security
        return span;
    }


    appendTo(element) {
        element.appendChild(this.container);

        let height = 0;
        const interval = setInterval(() => {
            height += this.menuHeight / 10;
            height = Math.min(this.menuHeight, height);
            this.container.style.height = height+"px";

            if (height >= this.menuHeight) {
                clearInterval(interval);
            }
        }, 5);
    }
}