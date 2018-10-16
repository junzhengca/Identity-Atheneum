const Command = require('./Command');
const axios = require('axios');

class AddUserGroup extends Command {
    run() {
        // Depends on the arguments
        if(this.args.length === 3) {
            return new Promise((resolve, reject) => {
                // Request the endpoint
                axios.post(this.env.link + "/api/users/" + this.args[1] + "/groups", {group: this.args[2]}, {headers: {authorization: this.env.key}})
                    .then(data => {
                        console.log(data.data);
                        resolve();
                    })
                    .catch(e => {
                        reject(e);
                    });
            });
        } else {
            return new Promise(resolve => {console.log("Invalid number of arguments."); resolve()})
        }

    }
}

module.exports = AddUserGroup;

