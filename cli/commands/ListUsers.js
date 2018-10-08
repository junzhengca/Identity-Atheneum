const Command = require('./Command');
const axios = require('axios');

class ListUsers extends Command {
    run() {
        return new Promise((resolve, reject) => {
            // Request the endpoint
            axios.get(this.env.link + "/api/users", {headers: {authorization: this.env.key}})
                .then(data => {
                    data.data.forEach(user => {
                        console.log("==========================");
                        console.log("_id:", user._id);
                        console.log("username:", user.username);
                        console.log("idp:", user.idp);
                    });
                    resolve();
                })
                .catch(e => {
                    console.error(e);
                    reject(e);
                });
        });
    }
}

module.exports = ListUsers;

