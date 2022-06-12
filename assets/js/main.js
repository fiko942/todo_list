const {ipcRenderer} = require('electron');
const ipc = ipcRenderer;
window.$ = window.jQuery = require('jquery');
// window.$ = window.jQuery = require('./jquery-3.0.0.min.js');

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

$('.add-list-btn').on('click', (e) => {
    $('#add-list').modal('show');
    $('.modal-content').css('cssText', `
        box-shadow: 0px 0px 25px 3px #000;
    `);
    $('.modal-header').css('cssText', `
        border-bottom: none !important;
    `);
    $('.modal-footer').css('cssText', `
        border-top: none !important;
    `);
});