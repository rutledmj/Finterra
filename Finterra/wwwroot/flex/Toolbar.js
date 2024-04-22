export class Toolbar {
    constructor(options) {
        this.flex = options.flex;
        this.position = options.position;
        this.style = options.style;
        this.parent = options.parent;
        this.widgets = options.widgets;

        this.charts = options.charts;

        this.initialize();
    }

    height = 38;
    width = 38;
    padding = 4;

    initialize() {
        this.container = this.createToolbar();
        this.parent.appendChild(this.container);

        this.applyWidgets();
        this.appendCharts();
    }

    appendCharts() {
        if (this.charts)
            for (let chart of this.charts) {

            }
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
            backgroundColor: 'white',
            position: 'absolute',
            padding:'2px'
        };

        const width = this.flex.container.clientWidth;
        const height = this.flex.container.clientHeight;

        switch (this.position) {
            case "top":
                return { ...commonStyles, top: 0, width: `${width}px`, height: '38px' };
            case "bottom":
                return {
                    ...commonStyles,
                    bottom: 0,
                    left: `${this.width + this.padding}px`,
                    width: `${width - (this.width * 2) - (this.padding * 2)}px`,
                    height: `${this.height}px`
                };
            case "left":
                return {
                    ...commonStyles,
                    top: `${ this.height + this.padding }px`,
                    left: 0,
                    width:`${ this.width }px`,
                    height:`${ this.flex.container.clientHeight - this.width - this.padding }px` 
                };
            case "right":
                return {
                    ...commonStyles,
                    top: `${ this.height + this.padding }px`,
                    right: 0,
                    width:`${ this.width }px`,
                    height:`${ this.flex.container.clientHeight - this.width - this.padding }px` 
                };
            case "middle":
                return {
                    ...commonStyles,
                    top:`${ this.height + this.padding }px`,
                    left:`${ this.width + this.padding }px`,
                    width:`${ this.flex.container.clientWidth - (this.width * 2) - (this.padding * 2) }px`,
                    height:`${ this.flex.container.clientHeight - (this.height * 2) - (this.padding * 2) }px`, 
                    borderRadius: '3px'
                };
            default:
                return {};
        }
    }
}