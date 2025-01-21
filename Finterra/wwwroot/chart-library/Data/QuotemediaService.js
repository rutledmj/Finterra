export class QuotemediaService {
    constructor(options){
        this.wmid = options.wmid || 0;
        this.username = options.username || "";
        this.password = options.password || "";

        this.flex = options.flex;

        this.Streamer = qmci.Streamer;

        this.initialize();
    }

    async initialize() {
        await this.login();
        console.log(this.sid);
    }

    async login() {
        try {
            const sid = await this.streamerLogin();
            this.sid = sid;
        } catch (err) {
            console.error(err); // Or handle the error as needed
        }
    }

    // Assuming Streamer.login returns a Promise
    streamerLogin() {
        return new Promise((resolve, reject) => {
            this.Streamer.login({
                host: 'https://app.quotemedia.com/auth',
                credentials: {
                    wmid: this.wmid,
                    username: this.username,
                    password: this.password
                }
            }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    data = `https://app.quotemedia.com/data/`; 

    async lookup(options) {
        try {
            const parameters = this.objectToUrlParams(options);
            const response = await fetch(`${this.data}lookup.json?${parameters}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    objectToUrlParams(obj) {
        const paramsObj = { webmasterId: this.wmid, sid: this.sid, ...obj};
        const params = new URLSearchParams(paramsObj);
        return params.toString();
    }
}