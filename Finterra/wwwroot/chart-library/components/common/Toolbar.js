/**
 * The Toolbar class manages a row or column of widgets (buttons, etc.).
 */
export class Toolbar {
    /**
     * @param {Object} options
     * @param {Object} options.flex - Reference to the main Finterra or controlling instance
     * @param {HTMLElement} options.container - Parent element in which the toolbar is placed
     * @param {Array} options.widgets - Array of widget classes to instantiate
     * @param {string} [options.position] - Position hint for the toolbar (e.g., "top", "bottom")
     */
    constructor(options) {
        if (!options.container) {
            throw new Error("Toolbar: 'container' option is required.");
        }

        this.flex = options.flex;
        this.position = options.position || 'unknown';
        this.parent = options.container;
        this.widgets = options.widgets || [];

        this.container = null;
        this._init();
    }

    /**
     * Internal init method to create the toolbar DOM and append widgets.
     */
    _init() {
        this.container = this._createToolbar();
        this.parent.appendChild(this.container);

        // Instantiate each widget
        this.applyWidgets();
    }

    /**
     * Instantiates each widget class in the `this.widgets` array.
     */
    applyWidgets() {
        this.widgets.forEach(WidgetClass => {
            // Each widget is assumed to be a constructor that takes { toolbar: this, ... }
            new WidgetClass({ toolbar: this });
        });
    }

    /**
     * Creates the toolbar container element with base styling.
     * @returns {HTMLDivElement}
     */
    _createToolbar() {
        const div = document.createElement('div');
        div.className = `flex-${this.position}-toolbar`;

        const styles = this._getToolbarStyles();
        Object.assign(div.style, styles);

        return div;
    }

    /**
     * Returns a set of default inline styles for the toolbar.
     * You could instead rely on CSS class if preferred.
     */
    _getToolbarStyles() {
        return {
            backgroundColor: 'var(--toolbar-background)',
            padding: '4px',
            width: '100%',
            height: '100%',
            borderRadius: '4px'
        };
    }

    /**
     * Optional cleanup method, if needed.
     */
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.parent = null;
        // If widgets need cleanup, track references in applyWidgets() and destroy them here.
    }
}
