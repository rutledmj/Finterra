

export function ExchangeConversion(excode) {
    for (const exchange of Exchanges) {
        if (exchange.codes.includes(excode)) {
            return exchange.exchange;
        }
    }
    return excode;
}

const Exchanges = [
    {
        exchange: "Nasdaq",
        codes: [ "NDD", "NSC", "NSD", "NGS", "GIDS", "MEMX", "NMF", "EXPM", "OTO" ]
    },
    {
        exchange: "NYSE",
        codes: [ "NYGIF", "AMX", "NYE", "ARCA" ]
    },
    {
        exchange: "Dow Jones Indices",
        codes: [ "DJI", "DJUS", "DJWIL", "DJX", "DJEOD", "DOW" ]
    },
    {
        exchange: "CBOE Indices",
        codes: [ "MDX", "CBO" ]
    },
    {
        exchange: "Russell Indices",
        codes: [ "RUS" ]
    },
    {
        exchange: "Bats Exchange",
        codes: [ "BATS", "EDGX" ]
    },
    {
        exchange: "NYSE",
        codes: ["NYGIF", "AMX", "NYE", "ARCA"]
    }
]