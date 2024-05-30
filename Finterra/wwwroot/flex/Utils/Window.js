import { buttonHover } from '../Utils.js';
import { CLOSE_ICON } from './Icons.js';

export class Window {
    constructor(options) {
        this.isMoveable = options.isMoveable || false;
        this.isResizable = options.isResizeable || false;
        this.isMinimizable = options.isMinimizable || false;
        this.isMaximizable = options.isMaximizable || false;
        this.isRestorable = options.isRestorable || false;
        this.isCloseable = options.isCloseable || true;
        this.isBackdrop = options.isBackdrop || false;

        this.title = options.title || "";
        this.body = options.body || null;

        this.initialize();
    }

    initialize() {
        // Create container
        this.container = this.createContainer();

        // Create and append backdrop
        const backdrop = this.createBackdrop();
        this.container.appendChild(backdrop);
        this.backdrop = backdrop;

        // Create and append modal
        const modal = this.createModal();
        this.container.appendChild(modal);
        this.modal = modal;

    }

    createContainer() {
        const container = document.createElement('div');
        container.style.cssText = 'position:absolute; width:100%; height:100%; top:0; left:0';
        return container;
    }

    createBackdrop() {
        const backdrop = document.createElement("div");
        backdrop.style.cssText = 'position:absolute; width:100%; height:100%';

        if (this.isBackdrop) {
            backdrop.style.cssText += 'background-color:#111; opacity:0.5;';
            backdrop.onclick = () => this.close();
        }

        return backdrop;
    }

    createModal() {
        const modal = document.createElement("div");
        modal.style.cssText =
            `width:840px; 
            height: 680px; 
            background-color:  var(--menu-background);
            border-radius: 5px;
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            overflow:hidden;
            color:var(--color);
            fill:var(--color);`;

        const header = this.createModalHeader();
        modal.appendChild(header);

        modal.appendChild(this.body);

        return modal;
    }

    createModalHeader() {
        const header = document.createElement("div");
        header.style.cssText = 'width:100%; padding:18px; font-size:20px; font-weight:600; border-bottom:1px solid var(--toolbar-border)';
        header.textContent = this.title;

        const closeBtn = this.createCloseButton();
        header.appendChild(closeBtn);

        return header;
    }

    createCloseButton() {
        const closeBtn = document.createElement("button");
        closeBtn.style.cssText = 'float:right; border:none; background:none; cursor:pointer; border-radius:5px';
        closeBtn.innerHTML = CLOSE_ICON;

        buttonHover(closeBtn);

        closeBtn.onclick = () => this.close();
        closeBtn.setAttribute('aria-label', 'Close');

        return closeBtn;
    }

    appendTo(element) {

        this.modal.style.opacity = '0'; // Set initial opacity
        this.backdrop.style.opacity = '0'; // Set initial opacity

        element.appendChild(this.container);

        if (this.isBackdrop) {
            let opacity = 0; // Initial numeric opacity value
            const interval = setInterval(() => {
                opacity += 0.05; // Increment opacity
                this.backdrop.style.opacity = opacity.toString();

                if (opacity >= .5) {
                    clearInterval(interval); // Clear interval when opacity reaches 1
                }
            }, 10); // Set interval timing for smooth transition
        }

        
        let opacity = 0; // Initial numeric opacity value
        const interval = setInterval(() => {
            opacity += 0.05; // Increment opacity
            this.modal.style.opacity = opacity.toString();

            if (opacity >= 1) {
                clearInterval(interval); // Clear interval when opacity reaches 1
            }
        }, 5); // Set interval timing for smooth transition
    }

    close() {

        if (this.isBackdrop) {
            let opacity = 0.5; // Initial numeric opacity value
            const interval = setInterval(() => {
                opacity -= 0.05; // Increment opacity
                this.backdrop.style.opacity = opacity.toString();

                if (opacity <= 0) {
                    clearInterval(interval); // Clear interval when opacity reaches 1
                }
            }, 10); // Set interval timing for smooth transition
        }


        let opacity = 1; // Initial numeric opacity value
        const interval = setInterval(() => {
            opacity -= 0.05; // Increment opacity
            this.modal.style.opacity = opacity.toString();

            if (opacity <= 0) {
                clearInterval(interval); // Clear interval when opacity reaches 1
                this.container.remove();
            }
        }, 5); // Set interval timing for smooth transition

    }
}