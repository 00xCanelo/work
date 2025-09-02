class HWIDFormatter {
    static formatHWID(rawHwid) {
        if (!rawHwid || typeof rawHwid !== 'string') {
            throw new Error('Invalid HWID provided');
        }

        const cleanHwid = rawHwid.replace(/[-\s]/g, '');
        
        const truncatedHwid = cleanHwid.substring(0, 24);
        
        const paddedHwid = truncatedHwid.padEnd(24, '0');
        
        const formattedHwid = paddedHwid.match(/.{1,4}/g).join('-');
        
        return formattedHwid;
    }

    static isFormatted(hwid) {
        if (!hwid || typeof hwid !== 'string') {
            return false;
        }
        
        const formatRegex = /^[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}$/i;
        return formatRegex.test(hwid);
    }

    static toRawFormat(formattedHwid) {
        if (!formattedHwid || typeof formattedHwid !== 'string') {
            throw new Error('Invalid formatted HWID provided');
        }
        
        return formattedHwid.replace(/-/g, '');
    }
}

module.exports = HWIDFormatter;
