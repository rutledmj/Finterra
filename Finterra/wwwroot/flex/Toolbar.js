export class Toolbar {
    constructor(options) {
        this.flex = options.flex;
        this.position = options.position;
        this.parent = options.container;
        this.widgets = options.widgets;

        this.initialize();
    }

    initialize() {
        this.container = this.createToolbar();
        this.parent.appendChild(this.container);

        this.applyWidgets();
    }


    applyWidgets() {
        if (this.widgets)
            this.widgets.forEach(widget => {
                const instance = new widget({ toolbar: this });
            });
    }

    createToolbar() {
        let div = document.createElement('div');
        div.className = `flex-${this.position}-toolbar`;

        const styles = this.getToolbarStyles();
        Object.assign(div.style, styles);

        return div;
    }

    getToolbarStyles() {
        const commonStyles = {
            backgroundColor: 'var(--toolbar-background)',
            padding: '4px',
            width: '100%',
            height: '100%',
            borderRadius: '4px'
        };

        return commonStyles;
    }
}