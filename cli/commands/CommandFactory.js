const Ping = require('./Ping');
const ListUsers = require('./ListUsers');
const GetUser = require('./GetUser');


class CommandFactory {
    static make(env, args) {
        switch(args[0]) {
            case "ping":
                return new Ping(env, args);
            case "user:list":
                return new ListUsers(env, args);
            case "user:get":
                return new GetUser(env, args);
            default:
                return new Command(env, args);
        }
    }
}

module.exports = CommandFactory;
