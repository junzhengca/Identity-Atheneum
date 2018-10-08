const readline = require('readline-sync');
const CommandFactory = require('./commands/CommandFactory');

console.log(` ___      ________         
|\\  \\    |\\   __  \\        
\\ \\  \\   \\ \\  \\|\\  \\       
 \\ \\  \\   \\ \\   __  \\      
  \\ \\  \\ __\\ \\  \\ \\  \\ ___
   \\ \\__\\\\__\\ \\__\\ \\__\\\\__\\
    \\|__\\|__|\\|__|\\|__\\|__|
    Identity Atheneum CLI v1.0
    `);

// Initialization questions
console.log("===== BEGIN INITIALIZATION SEQUENCE =====");
let link = readline.question("I.A. Host Root (http://localhost:3000): ");
let key = readline.question("Admin Key: ");
console.log("===== END INITIALIZATION SEQUENCE =====");

async function start() {
    while(true) {
        let cmd = readline.question("> ");
        cmd = cmd.split(" ");

        if(cmd[0] === 'exit') {
            break;
        }

        let program = CommandFactory.make({link, key}, cmd);
        try {
            await program.run();
        } catch(e) {
            console.error("ERROR");
        }

    }
}

start();
