const SELECTED_PROCESS = 'hotmail007';

const PROCESS_CONFIGS = {
    hotmail007: {
        name: 'Hotmail007 Process',
        description: 'Discord automation using Hotmail007 email service',
        file: 'Process For Hotmail007.js',
        emailService: 'Hotmail007',
        priority: 1
    },
    thanosmail: {
        name: 'ThanosMail Process',
        description: 'Discord automation using ThanosMail email service',
        file: 'Process For Thanos Email.js',
        emailService: 'Thanos',
        priority: 2
    },
    othermail: {
        name: 'OtherMail Process',
        description: 'Discord automation using OtherMail email service',
        file: 'Process For Other Email Service.js',
        emailService: 'Other',
        priority: 3
    }
};

function getSelectedProcess() {
    const process = PROCESS_CONFIGS[SELECTED_PROCESS];
    if (!process) {
        throw new Error(`Invalid process selected: ${SELECTED_PROCESS}`);
    }
    return process;
}

function getAllProcesses() {
    return PROCESS_CONFIGS;
}

function getSelectedProcessName() {
    return getSelectedProcess().name;
}

function getSelectedProcessFile() {
    return getSelectedProcess().file;
}

function getSelectedEmailService() {
    return getSelectedProcess().emailService;
}

function isValidProcess() {
    return PROCESS_CONFIGS.hasOwnProperty(SELECTED_PROCESS);
}

function getSelectedProcessPriority() {
    return getSelectedProcess().priority;
}

module.exports = {
    getSelectedProcess,
    getAllProcesses,
    getSelectedProcessName,
    getSelectedProcessFile,
    getSelectedEmailService,
    isValidProcess,
    getSelectedProcessPriority,
    SELECTED_PROCESS
};
