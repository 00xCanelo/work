const chalk = require('chalk');
const readline = require('readline');
const { setTimeout } = require('timers/promises');

const BRAND = [
    " ██████╗ █████╗ ███████╗██╗    ██╗██████╗       ████████╗ ██████╗  ██████╗ ██╗     ███████╗",
    "██╔════╝██╔══██╗╚══███╔╝██║    ██║██╔══██╗      ╚══██╔══╝██╔═══██╗██╔═══██╗██║     ██╔════╝",
    "██║     ███████║  ███╔╝ ██║ █╗ ██║██████╔╝         ██║   ██║   ██║██║   ██║██║     ███████╗",
    "██║     ██╔══██║ ███╔╝  ██║███╗██║██╔══██╗         ██║   ██║   ██║██║   ██║██║     ╚════██║",
    "╚██████╗██║  ██║███████╗╚███╔███╔╝██║  ██║         ██║   ╚██████╔╝╚██████╔╝███████╗███████║",
    " ╚═════╝╚═╝  ╚═╝╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝         ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝"
];
const UNDERLINE_1 = "Discord Claimed Tokens Generator";
const UNDERLINE_2 = "For Problems,inquiries and Activations Contact (cazwr.) on discord";

async function typeOut(text, colorFn = chalk.cyan, delay = 8) {
    for (let i = 0; i < text.length; i++) {
        process.stdout.write(colorFn(text[i]));
        await setTimeout(delay);
    }
    process.stdout.write('\n');
}

async function animateBranding() {
    console.clear();
    const terminalWidth = process.stdout.columns || 80;
    const brandWidth = Math.max(...BRAND.map(line => line.length));
    const padding = Math.max(0, Math.floor((terminalWidth - brandWidth) / 2));
    for (let x = 0; x < brandWidth; x++) {
        readline.cursorTo(process.stdout, 0, 0);
        for (let y = 0; y < BRAND.length; y++) {
            let line = ' '.repeat(padding);
            for (let col = 0; col <= x; col++) {
                if (col < BRAND[y].length && BRAND[y][col] !== ' ') {
                    line += chalk.whiteBright(BRAND[y][col]);
                } else {
                    line += ' ';
                }
            }
            console.log(line);
        }
        await setTimeout(15);
    }
}

async function printBranding() {
    await animateBranding();
    const terminalWidth = process.stdout.columns || 80;
    const centerText = (text) => {
        const pad = Math.max(0, Math.floor((terminalWidth - text.length) / 2));
        return ' '.repeat(pad) + text;
    };
    await typeOut(centerText(UNDERLINE_1), chalk.whiteBright, 10);
    await typeOut(centerText(UNDERLINE_2), chalk.whiteBright, 10);
    console.log();
}

function printBrandingInstant() {
    console.clear();
    const terminalWidth = process.stdout.columns || 80;
    const brandWidth = Math.max(...BRAND.map(line => line.length));
    const padding = Math.max(0, Math.floor((terminalWidth - brandWidth) / 2));
    
    for (let y = 0; y < BRAND.length; y++) {
        let line = ' '.repeat(padding);
        line += chalk.whiteBright(BRAND[y]);
        console.log(line);
    }
    
    const centerText = (text) => {
        const pad = Math.max(0, Math.floor((terminalWidth - text.length) / 2));
        return ' '.repeat(pad) + text;
    };
    console.log(chalk.whiteBright(centerText(UNDERLINE_1)));
    console.log(chalk.whiteBright(centerText(UNDERLINE_2)));
    console.log();
}

module.exports = { printBranding, printBrandingInstant }; 