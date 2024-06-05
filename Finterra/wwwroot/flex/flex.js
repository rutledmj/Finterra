import { Toolbar } from './Toolbar.js';
import { SymbolSearch, Account, NewChart, AlertManager, Layout, Settings, Clock, ServerToggle, CursorSelect, DrawingTool, TextTool, Watchlist, OptionChain, Hotlist, News, Calendar, Scanner, GoToDate } from './Widgets.js';
import { Divider, Interval, createElement } from './Utils.js'
import { QuotemediaService } from './Data/QuotemediaService.js';
import { Workspace } from './Workspace.js';
import { AlchemChartsService } from './Data/AlchemChartsService.js';
import { Indicators } from './Studies/Studies.js';
export class Flex {
    constructor(options) {
        this.container = document.getElementById(options.container || 'body')

        this.wmid = options.wmid;
        this.username = options.username;
        this.password = options.password;

        this.initialize();
    }

    async initialize() {
        console.log(this);

        Object.assign(this.container, {
            style: 'height:100vh; position:relative; border-radius:2px; border:1px solid var(--workspace-border); background-color:var(--toolbar-border)'
        });

        await this.initializeStreamer();
        await this.initializeAlchemCharts();
        await this.initializeLayout();
        await this.initializeChart();
        
    }

    async initializeAlchemCharts() {
        this.alchemcharts = new AlchemChartsService({
            email: 'rutledmj@gmail.com',
            password: 'AppleTest1'
        });
        //await this.alchemcharts.initialize();
    }

    async initializeStreamer() {
        this.quotestream = new QuotemediaService({
            wmid: this.wmid,
            username: this.username,
            password: this.password,
            flex: this
        });

        return this.quotestream;
    }

    async initializeChart() {

        console.log(this.workspace.charts);
        for (let chart of this.workspace.charts) {
            
            var endDate = new Date();
            const startDate = new Date(endDate);
            startDate.setFullYear(startDate.getFullYear() - 10);

            chart.data = await this.alchemcharts.indexTS(chart.symbol, startDate, endDate, chart.interval)
                .then(response => {
                    return response;
                });

            chart.paint();
        }
    }

    async initializeLayout() {

        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';

        const header = createElement('div', 'header', {
            width: '100%',
            paddingBottom: '4px'
        });

        const mainContent = createElement('div', 'main-content', {
            width: '100%',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'row'
        });

        const sidebarLeft = createElement('div', 'sidebar-left', {
            width: 'min-content',
            height: '100%',
            paddingRight: '4px',
        });

        const contentArea = createElement('div', 'content-area', {
            height: '100%',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
        });

        const sidebarRight = createElement('div', 'sidebar-right', {
            width: 'min-content',
            height: '100%',
            paddingLeft: '4px'
        });

        const workspace = createElement('div', 'workspace', {
            width: '100%',
            flex: 1
        });

        const footer = createElement('div', 'footer', {
            width: '100%',
            paddingTop: '4px'
            
        });

        contentArea.append(workspace, footer);

        mainContent.append(sidebarLeft, contentArea, sidebarRight);

        this.container.append(header, mainContent);

        
        // Creating the top, middle, and bottom toolbars
        this.topToolbar = new Toolbar({
            flex: this,
            container: header,
            widgets: [
                Account,
                Divider,
                SymbolSearch,
                Divider,
                AlertManager,
                Divider,
                Layout,
                Divider,
                GoToDate,
                Settings,
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
                TextTool,
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

        this.workspace = new Workspace({
            flex: this,
            container: workspace
        });
    }
}