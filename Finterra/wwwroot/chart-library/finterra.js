import {
    Divider,
    Toolbar,
    SymbolSearch,
    Account,
    NewChart,
    AlertManager,
    Layout,
    Settings,
    Clock,
    ServerToggle,
    CursorSelect,
    DrawingTool,
    TextTool,
    Watchlist,
    OptionChain,
    Hotlist,
    News,
    Calendar,
    Scanner,
    GoToDate
} from './components.js';

import { Interval, createElement } from './Utils.js';
import { QuotemediaService } from './Data/QuotemediaService.js';
import { Workspace } from './Workspace.js';
import { AlchemChartsService } from './Data/AlchemChartsService.js';
import { Indicators } from './Studies/Studies.js';

/**
 * Main application class for the Finterra UI.
 * Manages data connections, chart services, layout, and toolbars.
 */
export class Finterra {
    /**
     * @param {Object} options
     * @param {string} options.container - The ID of the container element in the DOM
     * @param {string} options.wmid - WMID for Quotemedia
     * @param {string} options.username - Username for Quotemedia
     * @param {string} options.password - Password for Quotemedia
     */
    constructor(options) {
        if (!options) {
            throw new Error("Finterra: Options object is required.");
        }

        this.container = document.getElementById(options.container || 'body');
        if (!this.container) {
            throw new Error(`Finterra: Could not find container with ID "${options.container}"`);
        }

        this.wmid = options.wmid;
        this.username = options.username;
        this.password = options.password;

        // Will store references to your data services, toolbars, and workspace
        this.quotestream = null;
        this.alchemcharts = null;
        this.workspace = null;

        // Could add a “destroyed” flag if we want to handle teardown
        this._destroyed = false;

        this.initialize();
    }

    /**
     * Main initialization method that sets up all subcomponents.
     * Called automatically from constructor.
     */
    async initialize() {
        console.log("Finterra: Initialize started...");

        // Basic styling on the container
        Object.assign(this.container.style, {
            height: '100vh',
            position: 'relative',
            borderRadius: '2px',
            border: '1px solid var(--workspace-border)',
            backgroundColor: 'var(--toolbar-border)'
        });

        // Initialize data connections and chart services
        await this.initializeStreamer();
        await this.initializeAlchemCharts();

        // Build out the UI layout with toolbars and workspace
        await this.initializeLayout();
        // If you need to load an initial chart after everything:
        // await this.initializeChart();

        console.log("Finterra: Initialize complete.");
    }

    /**
     * Initialize Quotemedia streamer service.
     */
    async initializeStreamer() {
        this.quotestream = new QuotemediaService({
            wmid: this.wmid,
            username: this.username,
            password: this.password,
            flex: this
        });

        // Return the service (if needed by caller)
        return this.quotestream;
    }

    /**
     * Initialize AlchemCharts service.
     */
    async initializeAlchemCharts() {
        this.alchemcharts = new AlchemChartsService({
            email: 'rutledmj@gmail.com',
            password: 'AppleTest1'
        });

        // Example: If AlchemCharts requires async init, you might do:
        // await this.alchemcharts.initialize();
    }

    /**
     * Example of how you'd initialize your charts. Currently commented out
     * but you can adapt this to fetch and load data, then paint the chart.
     */
    async initializeChart() {
        if (!this.workspace?.charts) return;

        for (const chart of this.workspace.charts) {
            const endDate = new Date();
            const startDate = new Date(endDate);
            startDate.setFullYear(startDate.getFullYear() - 10);

            // chart.data = await this.alchemcharts.indexTS(chart.symbol, startDate, endDate, chart.interval);
            // chart.paint();
        }
    }

    /**
     * Sets up the main layout: header (top toolbar),
     * main content area (left sidebar, workspace, right sidebar),
     * and footer (bottom toolbar).
     */
    async initializeLayout() {
        // Container flex layout
        Object.assign(this.container.style, {
            display: 'flex',
            flexDirection: 'column'
        });

        const header = createElement('div', {
            class: 'header',
            style: 'width:100%; padding-bottom:4px'
        });

        const mainContent = createElement('div', {
            class: 'main-content',
            style: 'width:100%; flex-grow:1; display:flex; flex-direction:row'
        });

        const sidebarLeft = createElement('div', {
            class: 'sidebar-left',
            style: 'width:min-content; height:100%; padding-right:4px'
        });

        const contentArea = createElement('div', {
            class: 'content-area',
            style: 'height:100%; flex:1; display:flex; flex-direction:column'
        });

        const sidebarRight = createElement('div', {
            class: 'sidebar-right',
            style: 'width:min-content;height:100%;padding-left:4px'
        });

        const workspaceEl = createElement('div', {
            class: 'workspace',
            style: 'width:100%; flex:1'
        });

        const footer = createElement('div', {
            class: 'footer',
            style: 'width:100%; padding-top:4px'
        });

        contentArea.append(workspaceEl, footer);
        mainContent.append(sidebarLeft, contentArea, sidebarRight);
        this.container.append(header, mainContent);

        // Create toolbars
        this.topToolbar = new Toolbar({
            flex: this,
            container: header,
            widgets: [
                Account,
                Divider,
                SymbolSearch,
                Divider,
                NewChart,
                Divider,
                AlertManager,
                Divider,
                // Layout,
                // Divider,
                GoToDate,
                Settings
            ]
        });

        this.bottomToolbar = new Toolbar({
            flex: this,
            container: footer,
            widgets: [
                Clock,
                ServerToggle
            ]
        });

        this.leftToolbar = new Toolbar({
            flex: this,
            container: sidebarLeft,
            widgets: [
                CursorSelect,
                DrawingTool,
                TextTool
            ]
        });

        this.rightToolbar = new Toolbar({
            flex: this,
            container: sidebarRight,
            widgets: [
                Watchlist,
                OptionChain,
                Hotlist,
                News,
                Calendar,
                Scanner
            ]
        });

        // Finally, initialize the workspace
        this.workspace = new Workspace({
            flex: this,
            container: workspaceEl
        });
    }

    /**
     * Optional teardown method if you need to remove DOM or listeners.
     */
    destroy() {
        if (this._destroyed) return;

        // Example: remove DOM elements from container, tear down services
        // this.container.innerHTML = "";
        // this.quotestream?.destroy();
        // this.alchemcharts?.destroy();
        // this.workspace?.destroy();
        // ... etc.

        this._destroyed = true;
        console.log("Finterra: Destroyed.");
    }
}
