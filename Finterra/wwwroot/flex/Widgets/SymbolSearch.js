import { createSpan, Window, ExchangeConversion, createElement, buttonHover } from '../Utils.js'
import { SEARCH_ICON } from '../Utils/Icons.js'

export class SymbolSearch {
    constructor(options) {
        this.quotestream = options.toolbar.flex.quotestream;
        this.toolbar = options.toolbar;
        this.symbol = "GOOG";
        this.initialize();
    }

    initialize() {
        const button = this.createButton();
        this.toolbar.container.appendChild(button);
    }

    createButton() {
        const button = createElement('button', 'toolbar-button');
        button.style.width = "124px";
        button.style.textAlign = "left";
        // Add hover effects
        buttonHover(button);

        button.onclick = () => {
            this.onClickEvent();
        }

        const iconSpan = createSpan(SEARCH_ICON);
        const textSpan = createSpan(this.symbol, "margin-left:2px;");

        button.appendChild(iconSpan);
        button.appendChild(textSpan);

        return button;
    }

    onClickEvent() {
        this.modalBody = document.createElement('div');
        this.modalBody.style.cssText = "display:flex; flex-direction:column; overflow:hidden;";
        //create container
        this.searchContainer = this.createSearchContainer();

        //createSearchIcon
        this.searchIcon = this.createSearchIcon();

        //create searchField
        this.searchField = this.createSearchField();
        this.resultsContainer = this.createResultsContainer();

        this.searchContainer.appendChild(this.searchIcon);
        this.searchContainer.appendChild(this.searchField);

        //filter
        this.filterContainer = this.createFilterContainer();

        this.modalBody.appendChild(this.searchContainer);
        this.modalBody.appendChild(this.filterContainer);
        this.modalBody.appendChild(this.resultsContainer);

        const window = new Window({
            title: "Symbol Search",
            isCloseable: true,
            isBackdrop: true,
            body: this.modalBody
        });

        window.appendTo(this.toolbar.flex.container);

        // Focus the input element
        this.input.focus();
        this.search();
    }

    filters = [
        { display: "All", value: "", id: 0 },
        { display: "Stocks", value: "equity", id: 11 },
        { display: "Funds", value: "mutualfund", id: 8 },
        { display: "Futures", value: "future", id: 4 },
        { display: "Forex", value: "forex", id: 6 },
        { display: "Crypto", value: "forex", id: 0 },
        { display: "Indices", value: "indice", id: 7 },
        { display: "ETF", value: "etc", id: 16 },
        { display: "Moneymarket", value: "moneymarket", id: 9 }
    ];

    createResultsContainer() {
        const container = document.createElement('div');
        container.style.cssText = "overflow-y:auto; ;";
        return container;
    }

    filterby = this.filters[0];

    createFilterContainer() {
        const filterContainer = document.createElement("div");
        filterContainer.style.cssText = "padding:16px 16px;";

        this.filters.forEach((filter) => {
            const span = createSpan(filter.display, "background-color:var(--button-background); border-radius: 24px; padding:4px 12px; margin-right:10px; cursor:pointer; font-weight:500");

            const updateSpanStyle = () => {
                if (this.filterby === filter) {
                    span.style.backgroundColor = "var(--color)";
                    span.style.color = "var(--button-hover)";
                } else {
                    span.style.backgroundColor = "var(--button-background)";
                    span.style.color = "var(--color)"; // Reset to default color
                }
            };

            span.onmouseenter = () => {
                if (this.filterby !== filter) {
                    span.style.backgroundColor = "var(--button-hover)";
                    span.style.color = "var(--color)";
                }
            };

            span.onmouseleave = updateSpanStyle;

            span.onclick = () => {
                this.filterby = filter;
                updateSpanStyle();
                // Update all spans to reflect the new selection
                filterContainer.childNodes.forEach(child => {
                    if (child !== span) {
                        child.style.backgroundColor = "var(--button-background)";
                        child.style.color = "var(--color)";
                    }
                });

                this.search();
            };

            filterContainer.appendChild(span);
            updateSpanStyle(); // Initial style update based on the default filter
        });

        return filterContainer;
    }


    createSearchField() {
        this.input = document.createElement('input');
        Object.assign(this.input, {
            placeholder: 'Search',
            style: "border:none; background:transparent; color:var(--color); outline:none; text-transform:uppercase",
            value: this.symbol
        });
        const span = document.createElement('span');
        span.appendChild(this.input);

        this.onchange();

        return span;
    }

    onchange() {
        this.input.onkeyup = async (event) => {
            this.search();
        };
    }

    async search() {
        if (this.input.value) {
            try {
                const [symbolResponse, nameResponse] = await Promise.all([
                    this.quotestream.lookup({
                        searchType: "symbol",
                        q: this.input.value,
                        limit: 25,
                        sort: "m",
                        marketType: this.filterby.value
                    }),
                    this.quotestream.lookup({
                        searchType: "name",
                        q: this.input.value,
                        limit: 25,
                        sort: "m",
                        marketType: this.filterby.value
                    })
                ]);

                // Combine or process the results
                const combinedResults = [...symbolResponse, ...nameResponse];

                combinedResults.sort((a, b) => {
                    return b.marketCap - a.marketCap; // For descending order
                });

                const updatedResults = combinedResults.map(result => {
                    return {
                        ...result,
                        exchange: ExchangeConversion(result.exchangeCode) // Replace exchangeCode with its corresponding exchange name
                    };
                });

                this.resultsContainer.innerHTML = "";
                this.attachResults(updatedResults, this.input.value);

            } catch (error) {
                console.error('Error in executing lookups:', error);
            }
        } else {
            this.resultsContainer.innerHTML = "";
        }
    }

    attachResults(response, input) {
        const fragment = document.createDocumentFragment();

        response.forEach(symbol => {
            const row = this.createRow(symbol, input);

            row.onmouseenter = () => row.style.backgroundColor = 'var(--button-hover)';
            row.onmouseleave = () => row.style.backgroundColor = 'var(--button-background)';
            row.onclick = () => this.selectSymbol(symbol);

            fragment.appendChild(row);
        });

        this.resultsContainer.appendChild(fragment);
    }

    selectSymbol(symbol) {
        this.symbol = symbol;
        console.log(this.symbol);
    }

    createRow(symbol, input) {
        const row = document.createElement('div');
        row.style.cssText = 'padding:8px 16px; border-bottom:1px solid var(--toolbar-border); display:flex; cursor:pointer';

        row.appendChild(this.addSymbolColumn(symbol.symbol, input));
        row.appendChild(this.addNameColumn(symbol.name, input));
        row.appendChild(this.addExchangeColumn(symbol.exchange, symbol.symbolType));

        return row;
    }

    addSymbolColumn(symbol, input) {
        return this.createColumn('div', symbol, input, { flex: '1', fontWeight: '500' });
    }

    addNameColumn(name, input) {
        return this.createColumn('div', name, input, { flex: '2', textWrap: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' });
    }

    addExchangeColumn(exchange, symbolType) {
        const div = document.createElement('div');
        div.style.cssText = 'flex:1; text-align:right';

        div.appendChild(this.createSpan(symbolType, { fontSize: '12px', color: '#666', textTransform: 'lowercase', paddingRight: '8px', fontWeight: '500' }));
        div.appendChild(this.createSpan(exchange, { fontWeight: '500' }));

        return div;
    }

    createColumn(tag, content, input, styles) {
        const column = document.createElement(tag);
        Object.assign(column.style, styles);
        column.innerHTML = this.highlightMatches(content, input);
        return column;
    }

    createSpan(content, styles) {
        const span = document.createElement('span');
        Object.assign(span.style, styles);
        span.textContent = content;
        return span;
    }


    highlightMatches(text, match) {
        // Escape special characters in the match string for use in a regular expression
        const escapedMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Create a regular expression to find the matches
        const regex = new RegExp(escapedMatch, 'gi');

        // Replace matches with <span> tags
        return text.replace(regex, (matchedText) => `<span style='font-weight:bold; color:#94b694'>${matchedText}</span>`);
    }


    createSearchIcon() {
        return createSpan(SEARCH_ICON, "margin-right:6px");
    }

    createSearchContainer() {
        const searchContainer = document.createElement("div");
        searchContainer.style.cssText = `padding:8px 16px; border-bottom:1px solid var(--toolbar-border);`;

        return searchContainer;
    }
}