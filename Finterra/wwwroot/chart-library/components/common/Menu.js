import { createElement } from "../../Utils.js";

// A helper function that clamps a value between min/max
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

export class Menu {
    constructor(options) {
        /**
         * @param {HTMLElement} options.triggerElement – the element (button) that triggers the menu
         * @param {Array}       options.items – array of menu items
         * @param {string}      options.preferredPlacement – one of: 'top-left','top-right','bottom-left','bottom-right'
         * @param {string}      options.anchorCorner – which corner of the menu sits on the button: 'top-left','top-right','bottom-left','bottom-right'
         */

        this.triggerElement = options.triggerElement;
        this.items = options.items || [];
        this.preferredPlacement = options.preferredPlacement || 'bottom-left';
        this.anchorCorner = options.anchorCorner || 'top-left';

        // Container for the entire menu
        this.container = null;

        // Bind our click-away function once so we can remove it cleanly
        this.handleClickAway = this.handleClickAway.bind(this);
    }

    show() {
        // Create the DOM structure
        this._createMenuContainer();
        this._populateMenuItems(this.container, this.items);

        // Append to body so the menu is not cut off by parent containers
        document.body.appendChild(this.container);

        // Position the menu near the trigger
        this._positionMenu();

        // Animate open (optional)
        this._animateOpen();

        // Listen for clicks outside to close
        setTimeout(() => {
            document.addEventListener('click', this.handleClickAway, { capture: true });
        }, 0);
    }

    hide() {
        // Animate the closing, then remove
        let currentHeight = this.container.offsetHeight;
        const step = currentHeight / 10;
        const interval = setInterval(() => {
            currentHeight -= step;
            this.container.style.height = Math.max(currentHeight, 0) + "px";
            if (currentHeight <= 0) {
                clearInterval(interval);
                this._remove();
            }
        }, 10);

        // Remove click-away
        document.removeEventListener('click', this.handleClickAway, { capture: true });
    }

    handleClickAway(e) {
        // If click is outside the container, close
        if (!this.container.contains(e.target)) {
            this.hide();
        }
    }

    _remove() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
    }

    _createMenuContainer() {
        this.container = createElement('div', {
            style: `position:absolute;
            min-width:220px; 
            max-width:360px; 
            background-color:var(--menu-background,#fff);
            color:var(--color,#000);
            fill:var(--color, #000);
            box-shadow:0 2px 4px rgba(0,0,0,0.2);
            border-radius:4px;
            overflow:hidden;
            z-index:9999;
            height:0px`
        });
    }

    _populateMenuItems(parent, items = []) {
        items.forEach(item => {
            if (item.type === 'Divider') {
                const divider = createElement('div', {
                    style: 'height:100%;border-bottom:1px solid var(--menu-divider, #ccc); padding:5px 0px; margin:auto 4px'
                });

                parent.appendChild(divider);
            }
            else {
                // A normal menu item (possibly with a submenu)
                const menuItem = createElement('div', {
                    style: `padding: 8px 16px; cursor:pointer; display:flex; align-items:center; justify-content:space-between; background-color:var(--menu-item, transparent)`
                });

                // Hover effect
                menuItem.onmouseenter = () => {
                    menuItem.style.backgroundColor = 'var(--menu-item-hover, #eee)';
                    // If there's a submenu, show it
                    if (item.subItems && menuItem._subMenu) {
                        menuItem._subMenu.showSubMenu(menuItem);
                    }
                };
                menuItem.onmouseleave = () => {
                    menuItem.style.backgroundColor = 'var(--menu-item, transparent)';
                    // If there's a submenu, hide it (only if we truly left this item)
                    if (item.subItems && menuItem._subMenu) {
                        // We could add logic to check if we’re leaving to the submenu
                        // but your requirement says “hovering off doesn’t close the entire menu,”
                        // so we only close the submenu if user does not enter the submenu.
                        setTimeout(() => {
                            if (!menuItem.contains(document.activeElement) &&
                                !menuItem._subMenu.container.matches(':hover')) {
                                menuItem._subMenu.hideSubMenu();
                            }
                        }, 150);
                    }
                };

                // Icon
                if (item.icon) {
                    const iconSpan = createElement('span', {
                        style: 'display:inline-block; text-align:center; margin-right:8px; width:21px',
                        innerHTML: item.icon
                    });
                    
                    menuItem.appendChild(iconSpan);
                }

                // Text
                if (item.name) {
                    const textSpan = createElement('span', {
                        style: 'text-align:left; width:100%; padding-left:16px',
                        innerHTML: item.name
                    });

                    menuItem.appendChild(textSpan);
                }

                // Right side (submenu caret or blank)
                const rightSide = createElement('span');
                if (item.subItems) {
                    // Indicate a submenu
                    rightSide.textContent = '›'; // or '►'
                    rightSide.style.marginLeft = 'auto';
                    // Create the submenu instance but do not show yet
                    menuItem._subMenu = new SubMenu({
                        items: item.subItems,
                        parentMenu: this,
                    });
                }
                menuItem.appendChild(rightSide);

                // Click handling
                if (item.onClick) {
                    menuItem.onclick = (e) => {
                        e.stopPropagation();
                        // If no submenu, close the menu on click
                        if (!item.subItems) {
                            item.onClick();
                            this.hide();
                        }
                        // If there is a submenu, do nothing here—submenus open on hover
                    };
                }

                parent.appendChild(menuItem);
            }
        });
    }

    _positionMenu() {
        // We want to place the container based on the triggerElement's bounding box
        const rect = this.triggerElement.getBoundingClientRect();
        const menuRect = this.container.getBoundingClientRect(); // Might be zero if still height=0
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // We measure the menu AFTER it’s been appended, so let's forcibly measure it
        const measuredWidth = this.container.offsetWidth;
        const measuredHeight = this._estimateMenuHeight(); // or offsetHeight after we populate it

        let top = 0;
        let left = 0;

        // Decide how to position based on user’s preferredPlacement
        // This determines the general side (top/bottom/left/right).
        // Then anchorCorner decides which corner of the menu touches that side.
        switch (this.preferredPlacement) {
            case 'top-left':
                top = rect.top + scrollTop - measuredHeight;
                left = rect.left + scrollLeft;
                break;
            case 'top-right':
                top = rect.top + scrollTop - measuredHeight;
                left = rect.right + scrollLeft - measuredWidth;
                break;
            case 'bottom-left':
                top = rect.bottom + scrollTop;
                left = rect.left + scrollLeft;
                break;
            case 'bottom-right':
                top = rect.bottom + scrollTop;
                left = rect.right + scrollLeft - measuredWidth;
                break;
            default:
                top = rect.bottom + scrollTop;
                left = rect.right + scrollLeft - measuredWidth;
                break;
        }

        // If this would go offscreen, we can attempt to fix it:
        // 1. clamp left & top in the current viewport
        // 2. Or fallback to some other placement if desired
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Attempt naive clamp
        if (top < 0) {
            top = clamp(top, 0, viewportHeight - measuredHeight);
        } else if (top + measuredHeight > viewportHeight) {
            top = clamp(top, 0, viewportHeight - measuredHeight);
        }
        if (left < 0) {
            left = clamp(left, 0, viewportWidth - measuredWidth);
        } else if (left + measuredWidth > viewportWidth) {
            left = clamp(left, 0, viewportWidth - measuredWidth);
        }

        this.container.style.top = `${top}px`;
        this.container.style.left = `${left}px`;
    }

    _estimateMenuHeight() {
        // A rough estimate: measure each item’s approximate height. 
        // Or we can temporarily set a height:auto to measure, then re-collapse.
        // For simplicity, do something like:
        const children = Array.from(this.container.children);
        let sum = 0;
        children.forEach(child => {
            // dividers are 1px + margin
            // items are ~40px plus margins
            // You could do getBoundingClientRect, but that’s 0 until it’s rendered.
            // Let's guess 40 for each item (less for divider).
            if (child.style.borderBottom) {
                sum += 10;
            } else {
                sum += 40;
            }
        });
        return sum;
    }

    _animateOpen() {
        let currentHeight = 0;
        const targetHeight = this._estimateMenuHeight();
        const step = targetHeight / 10;

        const interval = setInterval(() => {
            currentHeight += step;
            this.container.style.height = Math.min(currentHeight, targetHeight) + "px";
            if (currentHeight >= targetHeight) {
                clearInterval(interval);
                // Ensure final height is "auto" so submenu expansions don't get clipped
                this.container.style.height = "auto";
            }
        }, 10);
    }
}


/**
 * Simple SubMenu class that handles a nested menu.
 * Typically you’d factor out the common behaviors (click-away, etc.),
 * but for brevity here we just show a small version for nested items.
 */
class SubMenu {
    constructor({ items, parentMenu }) {
        this.items = items;
        this.parentMenu = parentMenu;
        this.container = null;
        this.visible = false;

        this._createContainer();
        this._populateItems();
        // Not appended until we show it
    }

    _createContainer() {
        this.container = createElement('div', {
                style: `position:absolute;
                min-width:220px; 
                max-width:360px; 
                background-color:var(--menu-background,#fff);
                color:var(--color,#000);
                fill:var(--color, #000);
                box-shadow:0 2px 4px rgba(0,0,0,0.2);
                border-radius:4px;
                overflow:hidden;
                z-index:9999;
                display:none`
            });
    }

    _populateItems() {
        this.items.forEach(item => {
            if (item.type === 'Divider') {
                const divider = createElement('div', {
                    style: 'height:100%;border-bottom:1px solid var(--menu-divider, #ccc); padding:5px 0px; margin:auto 4px'
                });
                this.container.appendChild(divider);
            } else {

                const menuItem = createElement('div', {
                    style: `padding: 8px 16px; cursor:pointer; display:flex; align-items:center; justify-content:space-between; background-color:var(--menu-item, transparent)`
                });

                menuItem.onmouseenter = () => {
                    menuItem.style.backgroundColor = 'var(--menu-item-hover, #eee)';
                };
                menuItem.onmouseleave = () => {
                    menuItem.style.backgroundColor = 'var(--menu-item, transparent)';
                };

                // icon
                if (item.icon) {
                    const iconSpan = createElement('span', {
                        style: 'display:inline-block; text-align:center; margin-right:8px; width:21px',
                        innerHTML: item.icon
                    });
                    menuItem.appendChild(iconSpan);
                }

                // name
                const textSpan = createElement('span', {
                    style: 'text-align:left; width:100%; padding-left:16px',
                    innerHTML: item.name || ''
                });
                menuItem.appendChild(textSpan);

                if (item.onClick) {
                    menuItem.onclick = (e) => {
                        e.stopPropagation();
                        item.onClick();
                        // close entire menu if sub item is clicked
                        this.parentMenu.hide();
                    };
                }

                this.container.appendChild(menuItem);
            }
        });
    }

    showSubMenu(parentItemDiv) {
        if (!this.container.parentNode) {
            document.body.appendChild(this.container);
        }
        this.visible = true;
        this.container.style.display = 'block';

        // position to the right of the parent item
        const rect = parentItemDiv.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // naive: place it so top aligns with the parent item, and left is at rect.right
        const menuWidth = this.container.offsetWidth || 180; // guess if 0
        const menuHeight = this.container.offsetHeight || this._estimateHeight();

        let top = rect.top + scrollTop;
        let left = rect.right + scrollLeft;

        // Adjust if it goes off the screen to the right
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left + menuWidth > viewportWidth) {
            left = rect.left + scrollLeft - menuWidth; // place to the left
        }
        // If vertically off the screen, clamp
        if (top + menuHeight > viewportHeight) {
            top = Math.max(rect.bottom + scrollTop - menuHeight, 0);
        }

        this.container.style.top = top + "px";
        this.container.style.left = left + "px";
    }

    hideSubMenu() {
        if (this.visible) {
            this.container.style.display = 'none';
            this.visible = false;
        }
    }

    _estimateHeight() {
        const children = Array.from(this.container.children);
        let sum = 0;
        children.forEach(child => {
            if (child.style.borderBottom) {
                sum += 10;
            } else {
                sum += 40;
            }
        });
        return sum;
    }
}
