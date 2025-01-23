// window.js
import { buttonHover } from '../../Utils.js';
import { CLOSE_ICON } from '../../utils/Icons.js';
import { createElement } from '../../utils/dom.js';

export class Window {
    constructor(options = {}) {
        // Window configuration
        this.isMoveable = options.isMoveable || false;
        this.isResizable = options.isResizable || false;
        this.isMinimizable = options.isMinimizable || false;
        this.isMaximizable = options.isMaximizable || false;
        this.isRestorable = options.isRestorable || false;
        this.isCloseable = options.isCloseable !== false; // default true
        this.isBackdrop = options.isBackdrop || false;

        // If no backdrop, we can optionally use options.container as the parent for the modal
        this.targetContainer = options.container || null;

        // Window content
        this.title = options.title || '';
        this.body = options.body || null;
        this.width = options.width || 840;
        this.height = options.height || 680;
        this.minWidth = options.minWidth || 200;
        this.minHeight = options.minHeight || 100;

        // Drag / Move
        this.initialX = 0;
        this.initialY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;

        // Resize
        this.isResizing = false;
        this.resizeDirection = null;
        this.originalWidth = 0;
        this.originalHeight = 0;

        // Maximize / Restore
        this.isMaximized = false;
        this.originalPosition = { top: 0, left: 0, width: 0, height: 0 };

        // Bound event handlers
        this.handleDragMouseMove = this.handleDragMouseMove.bind(this);
        this.handleDragMouseUp = this.handleDragMouseUp.bind(this);

        this.handleResizeMouseMove = this.handleResizeMouseMove.bind(this);
        this.handleResizeMouseUp = this.handleResizeMouseUp.bind(this);

        this.handleModalMouseDown = this.handleModalMouseDown.bind(this);
        this.handleModalMouseMove = this.handleModalMouseMove.bind(this);

        // Create elements and insert into DOM
        this.initialize();
    }

    initialize() {
        // If backdrop is true, create a backdrop container
        // The modal will be appended on top of that backdrop
        if (this.isBackdrop) {
            this.backdrop = createElement('div', {
                class: 'window-backdrop',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(17,17,17,0.5)',
                    zIndex: 1000
                }
            });

            // We only close the window if a click occurs on the backdrop *itself*
            this.backdrop.addEventListener('click', (e) => {
                // If user clicked the backdrop area (not the modal), close
                if (e.target === this.backdrop) {
                    this.close();
                }
            });

            // Insert the backdrop into <body>
            document.body.appendChild(this.backdrop);
        }

        // Create the modal
        this.modal = this.createModal();

        // If we have a backdrop, the modal goes inside the backdrop
        // otherwise it goes in the user-supplied container or <body>.
        if (this.isBackdrop && this.backdrop) {
            this.backdrop.appendChild(this.modal);
        } else {
            const parent = this.targetContainer || document.body;
            parent.appendChild(this.modal);
        }

        // Set initial dimension references
        this.originalPosition.width = this.width;
        this.originalPosition.height = this.height;

        // Center the window
        this.centerWindow();

        // Attach event listeners
        this.attachEventListeners();

        // Fade in the modal
        this.fadeInModal(this.modal);
    }

    // ----------------------------------
    // Create the modal element
    // ----------------------------------
    createModal() {
        const modal = createElement('div', {
            class: 'window-modal',
            style: {
                position: 'absolute',
                top: '0',
                left: '0',
                width: `${this.width}px`,
                height: `${this.height}px`,
                backgroundColor: 'var(--menu-background)',
                borderRadius: '5px',
                border: '1px solid #2a4460',
                display: 'flex',
                flexDirection: 'column',
                color: 'var(--color)',
                fill: 'var(--color)',
                overflow: 'visible',
                // Start at 0 for fade in
                opacity: '0',
                transition: 'opacity 0.1s ease-in-out',

                // The modal should appear above the backdrop
                // which has zIndex 1000. So let's use 1001 for the modal
                zIndex: 1001
            }
        });

        // The header
        const header = createElement('div', {
            class: 'window-header',
            style: {
                width: '100%',
                padding: '18px',
                fontSize: '20px',
                fontWeight: '600',
                borderBottom: '1px solid var(--toolbar-border)',
                cursor: this.isMoveable ? 'move' : 'default',
                userSelect: 'none'
            },
            textContent: this.title
        });

        if (this.isCloseable) {
            const closeBtn = this.createCloseButton();
            header.appendChild(closeBtn);
        }
        modal.appendChild(header);

        // The "body" content if provided
        if (this.body) {
            modal.appendChild(this.body);
        }

        return modal;
    }

    createCloseButton() {
        const closeBtn = createElement('button', {
            class: 'window-close-button',
            style: {
                float: 'right',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                borderRadius: '5px'
            },
            innerHTML: CLOSE_ICON,
            onclick: () => this.close(),
            'aria-label': 'Close'
        });
        buttonHover(closeBtn);
        return closeBtn;
    }

    // ----------------------------------
    // Center the window
    // ----------------------------------
    centerWindow() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const left = (viewportWidth - this.width) / 2;
        const top = (viewportHeight - this.height) / 2;

        this.modal.style.left = `${Math.max(0, left)}px`;
        this.modal.style.top = `${Math.max(0, top)}px`;
    }

    // ----------------------------------
    // Fade In
    // ----------------------------------
    fadeInModal(modal) {
        let opacity = 0;
        modal.style.opacity = '0';
        const fadeInterval = setInterval(() => {
            opacity += 0.05;
            modal.style.opacity = opacity.toFixed(2);
            if (opacity >= 1) {
                clearInterval(fadeInterval);
            }
        }, 10);
    }

    // ----------------------------------
    // Attach event listeners
    // ----------------------------------
    attachEventListeners() {
        if (this.isMoveable) {
            const header = this.modal.querySelector('.window-header');
            header.addEventListener('mousedown', (e) => this.startDrag(e));
        }

        if (this.isResizable) {
            this.modal.addEventListener('mousedown', this.handleModalMouseDown);
            this.modal.addEventListener('mousemove', this.handleModalMouseMove);
        }
    }

    // ----------------------------------
    // Drag / Move Logic
    // ----------------------------------
    startDrag(e) {
        this.isDragging = true;
        this.initialX = e.clientX;
        this.initialY = e.clientY;
        this.offsetX = this.modal.offsetLeft;
        this.offsetY = this.modal.offsetTop;

        document.addEventListener('mousemove', this.handleDragMouseMove);
        document.addEventListener('mouseup', this.handleDragMouseUp);
    }

    handleDragMouseMove(e) {
        if (!this.isDragging) return;
        const dx = e.clientX - this.initialX;
        const dy = e.clientY - this.initialY;

        this.modal.style.left = `${Math.max(this.offsetX + dx,0)}px`;
        this.modal.style.top = `${Math.max(this.offsetY + dy,0)}px`;
    }

    handleDragMouseUp() {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.handleDragMouseMove);
        document.removeEventListener('mouseup', this.handleDragMouseUp);
    }

    // ----------------------------------
    // Resize Logic (edge-based)
    // ----------------------------------
    handleModalMouseDown(e) {
        if (this.isDragging) return;
        const direction = this.getEdgeDirection(e);
        if (!direction) return;

        e.preventDefault();
        e.stopPropagation();

        this.isResizing = true;
        this.resizeDirection = direction;
        this.initialX = e.clientX;
        this.initialY = e.clientY;
        this.originalWidth = this.modal.offsetWidth;
        this.originalHeight = this.modal.offsetHeight;
        this.offsetX = this.modal.offsetLeft;
        this.offsetY = this.modal.offsetTop;

        document.addEventListener('mousemove', this.handleResizeMouseMove);
        document.addEventListener('mouseup', this.handleResizeMouseUp);
    }

    handleResizeMouseMove(e) {
        if (!this.isResizing) return;

        const dx = e.clientX - this.initialX;
        const dy = e.clientY - this.initialY;

        let newWidth = this.originalWidth;
        let newHeight = this.originalHeight;
        let newLeft = this.offsetX;
        let newTop = this.offsetY;

        switch (this.resizeDirection) {
            case 'nw':
                newWidth = Math.max(this.minWidth, this.originalWidth - dx);
                newHeight = Math.max(this.minHeight, this.originalHeight - dy);
                newLeft = this.offsetX + (this.originalWidth - newWidth);
                newTop = this.offsetY + (this.originalHeight - newHeight);
                break;
            case 'ne':
                newWidth = Math.max(this.minWidth, this.originalWidth + dx);
                newHeight = Math.max(this.minHeight, this.originalHeight - dy);
                newTop = this.offsetY + (this.originalHeight - newHeight);
                break;
            case 'se':
                newWidth = Math.max(this.minWidth, this.originalWidth + dx);
                newHeight = Math.max(this.minHeight, this.originalHeight + dy);
                break;
            case 'sw':
                newWidth = Math.max(this.minWidth, this.originalWidth - dx);
                newHeight = Math.max(this.minHeight, this.originalHeight + dy);
                newLeft = this.offsetX + (this.originalWidth - newWidth);
                break;
            case 'n':
                newHeight = Math.max(this.minHeight, this.originalHeight - dy);
                newTop = this.offsetY + (this.originalHeight - newHeight);
                break;
            case 'e':
                newWidth = Math.max(this.minWidth, this.originalWidth + dx);
                break;
            case 's':
                newHeight = Math.max(this.minHeight, this.originalHeight + dy);
                break;
            case 'w':
                newWidth = Math.max(this.minWidth, this.originalWidth - dx);
                newLeft = this.offsetX + (this.originalWidth - newWidth);
                break;
        }

        // Apply new size and position
        this.modal.style.width = `${newWidth}px`;
        this.modal.style.height = `${newHeight}px`;
        this.modal.style.left = `${newLeft}px`;
        this.modal.style.top = `${newTop}px`;

        // If subclass wants to do something on each resize (like Chart)
        if (typeof this.resize === 'function') {
            this.resize(newWidth, newHeight);
        }
    }

    handleResizeMouseUp() {
        this.isResizing = false;
        document.removeEventListener('mousemove', this.handleResizeMouseMove);
        document.removeEventListener('mouseup', this.handleResizeMouseUp);
    }

    handleModalMouseMove(e) {
        if (this.isResizing || this.isDragging) return;
        const direction = this.getEdgeDirection(e);
        this.modal.style.cursor = direction ? `${direction}-resize` : 'default';
    }

    getEdgeDirection(e) {
        const rect = this.modal.getBoundingClientRect();
        const threshold = 10; // ~10px from each edge
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const nearLeft = x <= threshold;
        const nearRight = x >= (rect.width - threshold);
        const nearTop = y <= threshold;
        const nearBottom = y >= (rect.height - threshold);

        // Corners
        if (nearLeft && nearTop) return 'nw';
        if (nearRight && nearTop) return 'ne';
        if (nearRight && nearBottom) return 'se';
        if (nearLeft && nearBottom) return 'sw';

        // Edges
        if (nearTop) return 'n';
        if (nearRight) return 'e';
        if (nearBottom) return 's';
        if (nearLeft) return 'w';

        return null;
    }

    // ----------------------------------
    // Maximize / Restore
    // ----------------------------------
    maximize() {
        if (this.isMaximized) {
            this.restore();
            return;
        }
        this.isMaximized = true;
        this.originalPosition.top = this.modal.offsetTop;
        this.originalPosition.left = this.modal.offsetLeft;
        this.originalPosition.width = this.modal.offsetWidth;
        this.originalPosition.height = this.modal.offsetHeight;

        Object.assign(this.modal.style, {
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%',
            borderRadius: '0',
            cursor: 'default'
        });
    }

    restore() {
        this.isMaximized = false;
        Object.assign(this.modal.style, {
            top: `${this.originalPosition.top}px`,
            left: `${this.originalPosition.left}px`,
            width: `${this.originalPosition.width}px`,
            height: `${this.originalPosition.height}px`,
            borderRadius: '5px',
            cursor: 'default'
        });
    }

    // ----------------------------------
    // Close
    // ----------------------------------
    close() {
        // If there's a backdrop, fade it out + remove
        if (this.isBackdrop && this.backdrop) {
            // We'll fade out the backdrop (which also contains the modal)
            let bo = 0.5;
            const fadeBackdrop = setInterval(() => {
                bo -= 0.05;
                this.backdrop.style.opacity = bo.toString();
                if (bo <= 0) {
                    clearInterval(fadeBackdrop);
                    this.backdrop.remove();
                }
            }, 10);
            return;
        }

        // If no backdrop, fade out only the modal
        let opacity = 1;
        const fadeModal = setInterval(() => {
            opacity -= 0.05;
            this.modal.style.opacity = opacity.toString();
            if (opacity <= 0) {
                clearInterval(fadeModal);
                this.modal.remove();
            }
        }, 10);
    }
}
