const Command = require('./Command');
const axios = require('axios');

class GetUser extends Command {
    run() {
        // Depends on the arguments
        if(this.args.length === 3) {
            return new Promise((resolve, reject) => {
                // Request the endpoint
                axios.get(this.env.link + "/api/users/" + this.args[1] + "/" + this.args[2], {headers: {authorization: this.env.key}})
                    .then(data => {
                        console.log(data.data);
                        resolve();
                    })
                    .catch(e => {
                        reject(e);
                    });
            });
        } else {
            return new Promise((resolve, reject) => {
                // Request the endpoint
                axios.get(this.env.link + "/api/users/" + this.args[1], {headers: {authorization: this.env.key}})
                    .then(data => {
                        console.log(data.data);
                        resolve();
                    })
                    .catch(e => {
                        reject(e);
                    });
            });
        }

    }
}

module.exports = GetUser;

