const fs = require('fs');
const path = require('path');
const machineId = require('node-machine-id');
const HWIDFormatter = require('../utils/HWIDFormatter');

class HWIDSystem {
    constructor() {
        this.hwidFilePath = path.join(__dirname, '../../HWID.txt');
    }

    async generateHWID() {
        try {
            const rawHwid = machineId.machineIdSync();
            
            const formattedHwid = HWIDFormatter.formatHWID(rawHwid);
            
            return formattedHwid;
        } catch (error) {
            throw new Error(`Failed to generate HWID: ${error.message}`);
        }
    }

    async saveHWID(hwid) {
        try {
            fs.writeFileSync(this.hwidFilePath, hwid, 'utf8');
        } catch (error) {
            throw new Error(`Failed to save HWID: ${error.message}`);
        }
    }

    async loadHWID() {
        try {
            if (fs.existsSync(this.hwidFilePath)) {
                const hwid = fs.readFileSync(this.hwidFilePath, 'utf8').trim();
                return hwid;
            }
            return null;
        } catch (error) {
            throw new Error(`Failed to load HWID: ${error.message}`);
        }
    }

    async getHWID() {
        try {
            let hwid = await this.loadHWID();
            
            if (!hwid) {
                hwid = await this.generateHWID();
                await this.saveHWID(hwid);
            }
            
            return hwid;
        } catch (error) {
            throw new Error(`Failed to get HWID: ${error.message}`);
        }
    }

    hwidExists() {
        return fs.existsSync(this.hwidFilePath);
    }
}

module.exports = HWIDSystem;
