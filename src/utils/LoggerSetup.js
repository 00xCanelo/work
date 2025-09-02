const chalk = require('chalk');

const log = {
    success: (msg) => console.log(chalk.greenBright(`[+] ${msg}`)),
    warning: (msg) => console.log(chalk.yellowBright(`[!] ${msg}`)),
    failure: (msg) => console.log(chalk.redBright(`[-] CRITICAL: ${msg}`)),
    info: (msg) => console.log(chalk.grey(`[*] ${msg}`)),
    critical: (msg) => console.log(chalk.redBright(`[-] CRITICAL: ${msg}`))
};

module.exports = log; 