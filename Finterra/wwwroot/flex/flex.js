import { Toolbar } from './Toolbar.js';
import { SymbolSearch, Account, NewChart, AlertManager, Layout, Settings, Clock, ServerToggle, CursorSelect, DrawingTool, TextTool, Watchlist, OptionChain, Hotlist, News, Calendar, Scanner, GoToDate } from './Widgets.js';
import { Divider, Interval } from './Utils.js'
import { QuotemediaService } from './Data/QuotemediaService.js';
import { Workspace } from './Workspace.js';
import { AlchemChartsService } from './Data/AlchemChartsService.js';

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
            style: 'height:100vh; position:relative; border-radius:2px; border:1px solid #e0e3eb; background-color:#e0e3eb'
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
        await this.alchemcharts.initialize();
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

    initializeChart() {
        console.log(this.workspace.charts);
        for (let chart of this.workspace.charts) {
            
            var endDate = new Date();
            const startDate = new Date(endDate);
            startDate.setFullYear(startDate.getFullYear() - 10);

            chart.data = this.alchemcharts.indexTS(chart.symbol, startDate, endDate, chart.interval)
                .then(response => {
                    return response;
                });

            console.log(chart.data);

            for (let pane of chart.panes) {
                for (let study of pane.studies) {
                    console.log(study);
                }
            }
            //calcaulate
            //draw
        }
    }

    async initializeLayout() {
        // Creating the top, middle, and bottom toolbars
        this.topToolbar = new Toolbar({
            flex: this,
            parent: this.container,
            position: 'top',
            widgets: [
                Account,
                Divider,
                SymbolSearch,
                Divider,
                NewChart,
                Divider,
                AlertManager,
                Divider,
                Layout,
                Divider,
                GoToDate,
                Settings,
            ]
        });

        this.workspace = new Workspace({
            flex: this, parent: this.container
        });

        this.bottomToolbar = new Toolbar({
            flex: this, parent: this.container,
            position: 'bottom',
            widgets: [
                Clock,
                ServerToggle
            ]
        });

        this.leftToolbar = new Toolbar({
            flex: this, parent: this.container,
            position: 'left', 
            widgets: [
                CursorSelect,
                DrawingTool,
                TextTool,
            ]
        });

        this.rightToolbar = new Toolbar({
            flex: this, parent: this.container,
            position: 'right', 
            widgets: [
                Watchlist,
                OptionChain,
                Hotlist,
                News,
                Calendar,
                Scanner
            ]
        });

    }
}