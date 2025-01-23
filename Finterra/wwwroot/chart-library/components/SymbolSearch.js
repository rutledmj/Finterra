import { ExchangeConversion, createElement, buttonHover } from '../Utils.js'
import { Window } from './common/Window.js'
import { SEARCH_ICON } from '../Utils/Icons.js'

export class SymbolSearch {
    /**
     * Creates a new SymbolSearch instance.
     * @param {Object} options
     * @param {Object} options.toolbar - Toolbar object containing references (including .flex.quotestream).
     */
    constructor(options) {
        this.quotestream = options.toolbar.flex.quotestream;
        this.toolbar = options.toolbar;

        // Keep a reference to the toolbar container for easy appending
        this.toolbarContainer = this.toolbar.container;

        // We store the symbol as a string; you can also store an object if needed
        this.symbol = "GOOG";

        // Filters updated for more accurate marketType values (edit as needed)
        this.filters = [
            { display: "All", value: "", id: 0 },
            { display: "Stocks", value: "equity", id: 11 },
            { display: "Funds", value: "mutualfund", id: 8 },
            { display: "Futures", value: "future", id: 4 },
            { display: "Forex", value: "forex", id: 6 },
            { display: "Crypto", value: "crypto", id: 10 }, // updated from "forex"
            { display: "Indices", value: "index", id: 7 }, // updated from "indice"
            { display: "ETF", value: "etf", id: 16 }, // updated from "etc"
            { display: "Moneymarket", value: "moneymarket", id: 9 }
        ];

        // Keep track of the currently applied filter
        this.filterby = this.filters[0];

        this.initialize();
    }

    /**
     * Initializes the search button and appends it to the toolbar.
     */
    initialize() {
        this.button = this.createButton();
        this.toolbarContainer.appendChild(this.button);
    }

    /**
     * Creates the button element that opens the Symbol Search window.
     * @returns {HTMLElement} The toolbar button.
     */
    createButton() {
        const button = createElement('button', {
            class: 'toolbar-button',
            style: 'width:124px; text-align:left;'
        });

        // Add hover effects
        buttonHover(button);

        // Click event opens the search modal
        button.onclick = () => this.onClickEvent();

        // Icon
        const iconSpan = createElement('span', {
            innerHTML: SEARCH_ICON,
            style: 'margin-right:4px;'
        });

        // Symbol label
        this.buttonLabel = createElement('span', {
            innerHTML: this.symbol,
            style: 'flex:1; margin-left:2px; text-align:left;'
        });

        // Append icon and label
        button.appendChild(iconSpan);
        button.appendChild(this.buttonLabel);

        return button;
    }

    /**
     * Handles click event on the toolbar button: builds the search window.
     */
    onClickEvent() {
        // Build modal body
        this.modalBody = createElement('div', {
            style: 'display:flex; flex-direction:column; overflow:hidden;'
        });

        // Create search container (icon + input)
        this.searchContainer = this.createSearchContainer();
        this.searchIcon = this.createSearchIcon();
        this.searchField = this.createSearchField();

        this.searchContainer.appendChild(this.searchIcon);
        this.searchContainer.appendChild(this.searchField);

        // Create filter container (the chips for All, Stocks, etc.)
        this.filterContainer = this.createFilterContainer();

        // Create results container
        this.resultsContainer = this.createResultsContainer();

        // Append to modal body
        this.modalBody.appendChild(this.searchContainer);
        this.modalBody.appendChild(this.filterContainer);
        this.modalBody.appendChild(this.resultsContainer);

        // Construct window (backdrop, closable, etc.)
        this.searchWindow = new Window({
            title: "Symbol Search",
            isCloseable: true,
            isBackdrop: true,
            body: this.modalBody
        });

        // Focus the input and do initial search
        this.input.focus();
        this.search();
    }

    /**
     * Builds and returns the search container element.
     * @returns {HTMLElement}
     */
    createSearchContainer() {
        const container = createElement('div', {
            style: 'padding:8px 16px; border-bottom:1px solid var(--toolbar-border); display:flex; align-items:center;'
        });
        return container;
    }

    /**
     * Returns the search icon span element.
     */
    createSearchIcon() {
        return createElement('span', {
            innerHTML: SEARCH_ICON,
            style: 'margin-right:6px;'
        });
    }

    /**
     * Builds the search input field and wraps it in a span for styling.
     * @returns {HTMLSpanElement}
     */
    createSearchField() {
        this.input = createElement('input', {
            placeholder: 'Search',
            style: `
                border:none;
                background:transparent;
                color:var(--color);
                outline:none;
                text-transform:uppercase;
                width:100%;
            `,
            value: this.symbol
        });

        const span = document.createElement('span');
        span.style.flex = '1';  // So it expands with the container
        span.appendChild(this.input);

        // Attach the onkeyup event
        this.input.onkeyup = () => {
            this.search();
        };

        return span;
    }

    /**
     * Creates a container for the filter chips.
     * @returns {HTMLElement}
     */
    createFilterContainer() {
        const filterContainer = createElement('div', {
            style: 'padding:16px; display:flex; flex-wrap:wrap; row-gap:8px;'
        });

        // Create a span for each filter
        this.filters.forEach((filter) => {
            const chip = createElement('span', {
                innerHTML: filter.display,
                style: `
                    background-color: var(--button-background);
                    border-radius: 24px;
                    padding:4px 12px;
                    margin-right:10px;
                    cursor:pointer;
                    font-weight:500;
                `
            });

            // Update the styling of the chip depending on selection
            const updateSpanStyle = () => {
                if (this.filterby === filter) {
                    chip.style.backgroundColor = 'var(--color)';
                    chip.style.color = 'var(--button-hover)';
                } else {
                    chip.style.backgroundColor = 'var(--button-background)';
                    chip.style.color = 'var(--color)';
                }
            };

            chip.onmouseenter = () => {
                if (this.filterby !== filter) {
                    chip.style.backgroundColor = 'var(--button-hover)';
                    chip.style.color = 'var(--color)';
                }
            };

            chip.onmouseleave = updateSpanStyle;

            chip.onclick = () => {
                this.filterby = filter;
                // Reflect the new selection
                filterContainer.childNodes.forEach(child => {
                    if (child !== chip) {
                        child.style.backgroundColor = 'var(--button-background)';
                        child.style.color = 'var(--color)';
                    }
                });
                updateSpanStyle();
                this.search();
            };

            // Set initial style
            updateSpanStyle();
            filterContainer.appendChild(chip);
        });

        return filterContainer;
    }

    /**
     * Creates the container for displaying search results.
     * @returns {HTMLElement}
     */
    createResultsContainer() {
        return createElement('div', {
            style: 'overflow-y:auto; flex:1;'
        });
    }

    /**
     * Performs a search by symbol and name, then displays combined results.
     */
    async search() {
        // Clear any existing results
        this.resultsContainer.innerHTML = "";

        const query = this.input.value.trim();
        if (!query) return;

        try {
            // If your quotestream has a different method signature, update accordingly
            const [symbolResponse, nameResponse] = await Promise.all([
                this.quotestream.lookup({
                    searchType: "symbol",
                    q: query,
                    limit: 25,
                    sort: "m",
                    marketType: this.filterby.value
                }),
                this.quotestream.lookup({
                    searchType: "name",
                    q: query,
                    limit: 25,
                    sort: "m",
                    marketType: this.filterby.value
                })
            ]);

            // Combine
            const combinedResults = [...symbolResponse, ...nameResponse];

            // Sort descending by marketCap (adjust logic as needed)
            combinedResults.sort((a, b) => b.marketCap - a.marketCap);

            // Convert exchange codes to exchange names
            const updatedResults = combinedResults.map(result => {
                return {
                    ...result,
                    exchange: ExchangeConversion(result.exchangeCode)
                };
            });

            // Render results
            this.attachResults(updatedResults, query);

        } catch (error) {
            console.error('Error executing lookups:', error);
        }
    }

    /**
     * Renders the given list of results into the results container.
     * @param {Array} response
     * @param {String} input
     */
    attachResults(response, input) {
        const fragment = document.createDocumentFragment();

        response.forEach(symbol => {
            const row = this.createRow(symbol, input);

            row.onmouseenter = () => row.style.backgroundColor = 'var(--button-hover)';
            row.onmouseleave = () => row.style.backgroundColor = 'transparent';

            row.onclick = () => {
                this.selectSymbol(symbol);
            };

            fragment.appendChild(row);
        });

        this.resultsContainer.appendChild(fragment);
    }

    /**
     * Handles the selection of a symbol from the search results.
     * @param {Object} symbol - The selected symbol object.
     */
    selectSymbol(symbol) {
        // Save just the symbol string, or the entire object if you prefer
        this.symbol = symbol.symbol;
        console.log("Selected symbol: ", this.symbol);

        // Update the toolbar button label
        this.buttonLabel.innerHTML = this.symbol;

        // Optionally close the search window immediately after selection:
        if (this.searchWindow && this.searchWindow.close) {
            this.searchWindow.close();
        }

        // If you need to do more (like load quotes or broadcast selection):
        // this.quotestream.loadSymbol(this.symbol);
        // or an event emitter, etc.
    }

    /**
     * Creates a single row in the results listing.
     * @param {Object} symbol - The symbol object to display.
     * @param {String} input  - The search string.
     * @returns {HTMLDivElement}
     */
    createRow(symbol, input) {
        const row = document.createElement('div');
        row.style.cssText = `
            padding:8px 16px;
            border-bottom:1px solid var(--toolbar-border);
            display:flex;
            cursor:pointer;
            align-items:center;
        `;

        row.appendChild(this.addSymbolColumn(symbol.symbol, input));
        row.appendChild(this.addNameColumn(symbol.name, input));
        row.appendChild(this.addExchangeColumn(symbol.exchange, symbol.symbolType));

        return row;
    }

    /**
     * Creates the symbol column.
     * @param {String} symbol - The symbol text.
     * @param {String} input - The current search input.
     */
    addSymbolColumn(symbol, input) {
        return this.createColumn('div', symbol, input, {
            flex: '1',
            fontWeight: '500'
        });
    }

    /**
     * Creates the name column.
     * @param {String} name - The full name.
     * @param {String} input - The current search input.
     */
    addNameColumn(name, input) {
        return this.createColumn('div', name, input, {
            flex: '2',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: '500'
        });
    }

    /**
     * Creates the exchange column.
     * @param {String} exchange - The exchange name.
     * @param {String} symbolType
     */
    addExchangeColumn(exchange, symbolType) {
        const div = document.createElement('div');
        div.style.cssText = 'flex:1; text-align:right;';

        div.appendChild(
            createElement('span', {
                innerHTML: symbolType,
                style: `
                    font-size:12px;
                    color:#666;
                    text-transform: lowercase;
                    padding-right:8px;
                    font-weight:500;
                `
            })
        );
        div.appendChild(
            createElement('span', {
                innerHTML: exchange,
                style: 'font-weight:500;'
            })
        );

        return div;
    }

    /**
     * Creates a generic column with optional highlighting for matched text.
     * @param {String} tag    - The HTML tag, e.g. 'div'.
     * @param {String} content - The text content.
     * @param {String} input   - The current search input for highlighting.
     * @param {Object} styles  - An object of CSS properties.
     */
    createColumn(tag, content, input, styles) {
        const column = document.createElement(tag);
        Object.assign(column.style, styles);
        column.innerHTML = this.highlightMatches(content, input);
        return column;
    }

    /**
     * Highlights matches of 'match' within 'text'.
     * @param {String} text  - The text to highlight.
     * @param {String} match - The substring to highlight in text.
     */
    highlightMatches(text, match) {
        if (!text || !match) return text;

        const escapedMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape special chars
        const regex = new RegExp(escapedMatch, 'gi');
        return text.replace(regex, (matchedText) => {
            return `<span style='font-weight:bold; color:#94b694'>${matchedText}</span>`;
        });
    }
}
