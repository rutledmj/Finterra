// utils/dom.js
export function createElement(tagName, attributes = {}) {
    const element = document.createElement(tagName);
    for (const attr in attributes) {
        if (!attributes.hasOwnProperty(attr)) continue;
        if (attr === 'style' && typeof attributes[attr] === 'object') {
            for (const styleName in attributes[attr]) {
                if (attributes[attr].hasOwnProperty(styleName)) {
                    element.style[styleName] = attributes[attr][styleName];
                }
            }
        } else if (attr === 'innerHTML') {
            element.innerHTML = attributes[attr];
        } else if (attr === 'textContent') {
            element.textContent = attributes[attr];
        } else if (attr.startsWith('on')) {
            element.addEventListener(attr.substring(2).toLowerCase(), attributes[attr]);
        } else if (attr.startsWith('data-')) {
            element.setAttribute(attr, attributes[attr]);
        } else {
            element.setAttribute(attr, attributes[attr]);
        }
    }
    return element;
}

export function buttonHover(button) {
    button.addEventListener('mouseenter', () => button.style.backgroundColor = 'var(--button-hover)');
    button.addEventListener('mouseleave', () => button.style.backgroundColor = 'transparent');
}