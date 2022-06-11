const {ipcRenderer} = require('electron');
const ipc = ipcRenderer;

const el = (q) => {
    return document.querySelector(q);
};

const elAll = (q) => {
    return document.querySelectorAll(q);
};

el('.nav .min').addEventListener('click', (e) => {
    e.preventDefault();
    ipc.send('minimize-app');
});

el('.nav .max').addEventListener('click', (e) => {
    e.preventDefault();
    ipc.send('maximize-app');
});

el('.nav .close').addEventListener('click', (e) => {
    e.preventDefault();
    ipc.send('close-app');
});