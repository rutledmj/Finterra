export { Window } from './Utils/Window.js';
export { Menu } from './Utils/Menu.js';
export { ExchangeConversion } from './Utils/ExchangeConversion.js';
export { Interval } from './Utils/Interval.js';

export function createSpan(innerContent, style = '') {
    const span = document.createElement('span');
    span.innerHTML = innerContent;
    span.style.cssText = style;
    return span;
}

export function createDiv(innerContent, style = '') {
    const div = document.createElement('div');
    div.innerHTML = innerContent;
    div.style.cssText = style;
    return div;
}

export class Divider {
    constructor(options) {
        this.toolbar = options.toolbar;
        this.initialize();
    }

    initialize() {
        const divider = document.createElement("span");

        Object.assign(divider, {
            style: `height:100%;border-right:1px solid #e0e3eb; padding:5px 0px; margin:auto 4px`
        });

        this.toolbar.container.appendChild(divider);
    }
}

export function createElement(tag, classes = '', styles = {}, attributes = {}) {
    const element = document.createElement(tag);
    if (classes) element.className = classes;
    Object.assign(element.style, styles);
    for (const attribute in attributes) {
        if (attributes.hasOwnProperty(attribute)) {
            element.setAttribute(attribute, attributes[attribute]);
        }
    }
    return element;
}