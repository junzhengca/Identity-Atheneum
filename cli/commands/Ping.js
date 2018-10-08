const Command = require('./Command');
const axios = require('axios');

class Ping extends Command {
    run() {
        return new Promise((resolve, reject) => {
            // Request the endpoint
            axios.get(this.env.link + "/api/ping")
                .then(data => {
                    console.log(data.data);
                    resolve();
                })
                .catch(e => {
                    console.error(e);
                    reject(e);
                });
        });
    }
}

module.exports = Ping;

