export class AlchemChartsService {
    constructor(options) {
        this.email = options.email;
        this.password = options.password;

        this.AlchemChartsUrl = `https://www.alchemcharts.com`;
        this.loginurl = `/app/gamelog.php`;
        this.UserIDUrl = `/app/getuserid.php`;
        this.ExtPingUrl = `/app/extping.php`;
        this.ExitPingCode = "login521423";
        this.PingCode = "ping565241";
        this.Version = "AM_0.0.23";
        this.AlchemChartsRoot =
            "http://66.219.105.92:443";
            //"http://server1.infodys.com:443";
        this.IndexCSV = "/indexCSV.aspx";
        this.IndexTS = "/indexTS.aspx";
    }

    async initialize() {
        if (await this.login(this.email, this.password)) {
            this.userid = await this.getUserID(this.email);
            this.appid = Math.floor(Math.random() * (99999 - 10000 + 1) + 10000);
        }
    }

    async login(email, password) {
        const url = `${this.AlchemChartsUrl}${this.loginurl}?email=${this.email}&pwd=${this.password}`;
        let content = '';

        try {
            const response = await fetch(url);
            if (response.ok) {
                content = await response.text();
            }
        } catch (error) {
            console.error('ERROR', error.message);
        }

        return content === 'OK';
    }

    async getUserID(email) {
        if (!email || email.trim() === '') {
            throw new Error('Email cannot be null or whitespace.');
        }

        const url = `${this.AlchemChartsUrl}${this.UserIDUrl}?email=${encodeURIComponent(email)}`;

        try {
            const response = await fetch(url);

            if (response.ok) {
                const responseContent = await response.text();
                const userId = parseInt(responseContent, 10);

                if (!isNaN(userId)) {
                    return userId.toString();
                } else {
                    console.error('ERROR: Unable to parse user ID.');
                    return null; // Or consider throwing an exception or handling the parse failure differently.
                }
            } else {
                console.error(`ERROR: Received non-success status code ${response.status}.`);
                return null; // Or consider throwing an exception based on the status code.
            }
        } catch (error) {
            console.error(`ERROR ${error.message}`);
            return null; // Or re-throw, or handle the exception as appropriate for your application.
        }
    }

    async ping() {
        const url = `${this.AlchemChartsUrl}${this.ExtPingUrl}?code=${this.ExitPingCode}&userID=${this.userid}&appversion=${this.Version}&appID=${this.appid}`;
        const response = await fetch(url);
        const responseContent = await response.text();
        return responseContent;
    }

    async rePing() {
        const url = `${this.AlchemChartsUrl}${this.ExtPingUrl}?code=${this.PingCode}&userID=${this.userid}&appversion=${this.Version}&appID=${this.appid}`;
        const response = await fetch(url);
        const responseContent = await response.text();
        return responseContent;
    }

    async indexTS(symbol, startDate, endDate, interval) {

        const url = `http://66.219.105.92:443/indexCSV.aspx?symbol=${symbol}&sdate=${this.formatDate(startDate)}&edate=${this.formatDate(endDate)}&timeframe=-13980`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseContent = await response.text();
            const ohlcs = this.convertToOHLC(responseContent);
            console.log(ohlcs);
            return ohlcs;
        } catch (error) {
            console.error(`ERROR ${error.message}`);
        }
    }

    convertToOHLC(data) {
        const lines = data.split('\n');
        const ohlcArray = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line !== '') {
                const [dateTime, open, high, low, close, volume] = line.split(';');
                const ohlcObject = {
                    dateTime: new Date(dateTime),
                    open: parseFloat(open),
                    high: parseFloat(high),
                    low: parseFloat(low),
                    close: parseFloat(close),
                    volume: parseInt(volume)
                };
                ohlcArray.push(ohlcObject);
            }
        }

        return ohlcArray;

    }

    parseIntradayData(bytes) {
        const ohlcs = [];

        if (bytes && bytes.length > 0) {
            const dataView = new DataView(bytes.buffer);
            let offset = 0;

            const ct = dataView.getInt32(offset);
            offset += 4;

            for (let j = 0; j < ct; j++) {
                let lastday = 0;
                let lasthour = 0;
                let lastclose = 0;

                const count = dataView.getInt32(offset);
                offset += 4;

                const year = dataView.getUint32(offset);
                offset += 4;

                const month = dataView.getUint8(offset);
                offset += 1;

                for (let i = 0; i < count; i++) {
                    const bitArray = new Uint8Array(bytes.buffer, offset, 1);
                    offset += 1;

                    // Byte 1: - Same day as previous
                    if ((bitArray[0] & 0x01) === 0) {
                        lastday = dataView.getUint8(offset);
                        offset += 1;
                    }

                    // Byte 2: - Same hour as previous
                    if ((bitArray[0] & 0x02) === 0) {
                        lasthour = dataView.getUint8(offset);
                        offset += 1;
                    }

                    const min = dataView.getUint8(offset);
                    offset += 1;

                    const startdatetime = new Date(year, month - 1, lastday, lasthour, min, 0, 0);

                    // Byte 3: - Same values
                    const sameValues = (bitArray[0] & 0x04) !== 0;

                    // Byte 4: - Same values as previous
                    const sameValuesAsPrevious = (bitArray[0] & 0x08) !== 0;

                    // Byte 5: - Is Ushort
                    const isUshort = (bitArray[0] & 0x10) !== 0;

                    let open, high, low, close;

                    // Byte 3: - Same Values
                    if (sameValues) {
                        let decim = 0;

                        // Same values
                        if (sameValuesAsPrevious) {
                            // Same values as previous
                            close = lastclose;

                            // Set close decimal
                            decim = dataView.getUint8(offset);
                            offset += 1;

                            close = Math.floor(close) + decim * 0.01;
                            close = Math.round(close * 100) / 100;
                        } else {
                            if (isUshort) {
                                close = Math.round(dataView.getUint16(offset) / 100);
                                offset += 2;
                            } else {
                                close = Math.round(dataView.getUint32(offset) / 100);
                                offset += 4;
                            }

                            decim = Math.round(close * 100) % 100;
                        }

                        // Differences
                        const dopen = dataView.getUint8(offset);
                        offset += 1;

                        const dhigh = dataView.getUint8(offset);
                        offset += 1;

                        const dlow = dataView.getUint8(offset);
                        offset += 1;

                        const dopend = dopen > 100 ? decim - dopen + 100 : dopen + decim;
                        const dhighd = dhigh > 100 ? decim - dhigh + 100 : dhigh + decim;
                        const dlowd = dlow > 100 ? decim - dlow + 100 : dlow + decim;

                        const closeInt = Math.floor(close);

                        open = (closeInt * 100 + dopend) / 100;
                        high = (closeInt * 100 + dhighd) / 100;
                        low = (closeInt * 100 + dlowd) / 100;
                        lastclose = Math.round(close * 100) / 100;
                    } else {
                        if (isUshort) {
                            open = dataView.getUint16(offset) / 100;
                            offset += 2;
                            high = dataView.getUint16(offset) / 100;
                            offset += 2;
                            low = dataView.getUint16(offset) / 100;
                            offset += 2;
                            close = dataView.getUint16(offset) / 100;
                            offset += 2;
                        } else {
                            open = dataView.getUint32(offset) / 100;
                            offset += 4;
                            high = dataView.getUint32(offset) / 100;
                            offset += 4;
                            low = dataView.getUint32(offset) / 100;
                            offset += 4;
                            close = dataView.getUint32(offset) / 100;
                            offset += 4;
                        }
                    }

                    const ohlc = {
                        open,
                        high,
                        low,
                        close,
                        startdatetime,
                    };

                    ohlcs.push(ohlc);
                }
            }

            return ohlcs;
        }

        return null;
    }

    async indexEodTS(symbol, startDate, endDate, interval) {
        const type = "eod";
        const url = `${this.AlchemChartsRoot}${this.IndexTS}` +
            `?username=${this.email}` +
            `&password=${this.password}` +
            `&symbol=${this.toQuotemediaSymbol(symbol)}` +
            `&sdate=${this.formatDate(startDate)}` +
            `&edate=${this.formatDate(endDate)}` +
            `&type=${type}` +
            `&id=${this.userid}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseContentStream = await response.arrayBuffer();
            const uint8array = new Uint8Array(responseContentStream);
            const parsedData = this.parseEodData(uint8array);
            return parsedData;
        } catch (error) {
            //return await this.indexEodTS(symbol, startDate, endDate, interval);
        }
    }

    parseEodData(responseContentStream) {
        const ohlcs = [];

        const dataView = new DataView(responseContentStream);
        let offset = 0;

        let lastYear = 0;
        let lastMonth = 0;
        let lastclose = 0;

        const count = dataView.getInt32(offset);
        offset += 4;

        for (let i = 0; i < count; i++) {
            let open, high, low, close;
            const bitArray = new Uint8Array(responseContentStream, offset, 1);
            offset += 1;

            // Byte 1: - Same year as previous
            if ((bitArray[0] & 0x01) === 0) {
                lastYear = dataView.getUint32(offset);
                offset += 4;
            }

            // Byte 2: - Same month as previous
            if ((bitArray[0] & 0x02) === 0) {
                lastMonth = dataView.getUint8(offset);
                offset += 1;
            }

            const day = dataView.getUint8(offset);
            offset += 1;

            const startdatetime = new Date(lastYear, lastMonth - 1, day, 0, 0, 0);

            // Byte 3: - Same values
            const sameValues = (bitArray[0] & 0x04) !== 0;

            // Byte 4: - Same values as previous
            const sameValuesAsPrevious = (bitArray[0] & 0x08) !== 0;

            // Byte 5: - Is Ushort
            const isUshort = (bitArray[0] & 0x10) !== 0;

            // Byte 3: - Same Values
            if (sameValues) {
                let decim = 0;

                // Same values
                if (sameValuesAsPrevious) {
                    // Same values as previous
                    close = lastclose;
                    // Set close decimal
                    decim = dataView.getUint8(offset);
                    offset += 1;
                    close = Math.floor(close) + decim * 0.01;
                    close = Math.round(close * 100) / 100;
                } else {
                    if (isUshort) {
                        close = Math.round(dataView.getUint16(offset) / 100);
                        offset += 2;
                    } else {
                        close = Math.round(dataView.getUint32(offset) / 100);
                        offset += 4;
                    }
                    decim = Math.round(close * 100) % 100;
                }

                // Differences
                const dopen = dataView.getUint8(offset);
                offset += 1;
                const dhigh = dataView.getUint8(offset);
                offset += 1;
                const dlow = dataView.getUint8(offset);
                offset += 1;

                const dopend = dopen > 100 ? decim - dopen + 100 : dopen + decim;
                const dhighd = dhigh > 100 ? decim - dhigh + 100 : dhigh + decim;
                const dlowd = dlow > 100 ? decim - dlow + 100 : dlow + decim;

                const closeInt = Math.floor(close);

                open = (closeInt * 100 + dopend) / 100;
                high = (closeInt * 100 + dhighd) / 100;
                low = (closeInt * 100 + dlowd) / 100;
                lastclose = Math.round(close * 100) / 100;
            } else {
                if (isUshort) {
                    open = dataView.getUint16(offset) / 100;
                    offset += 2;
                    high = dataView.getUint16(offset) / 100;
                    offset += 2;
                    low = dataView.getUint16(offset) / 100;
                    offset += 2;
                    close = dataView.getUint16(offset) / 100;
                    offset += 2;
                } else {
                    open = dataView.getUint32(offset) / 100;
                    offset += 4;
                    high = dataView.getUint32(offset) / 100;
                    offset += 4;
                    low = dataView.getUint32(offset) / 100;
                    offset += 4;
                    close = dataView.getUint32(offset) / 100;
                    offset += 4;
                }
            }

            const ohlc = {
                open,
                high,
                low,
                close,
                startdatetime,
            };

            ohlcs.push(ohlc);
        }

        return ohlcs;
    }


    toQuotemediaSymbol(symbol) {
        return symbol;
    }

    formatDate(date) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }
}