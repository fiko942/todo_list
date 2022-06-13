const {ipcRenderer} = require('electron');
const ipc = ipcRenderer;
window.$ = window.jQuery = require('jquery');
let dataTemp;

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

$('.add-task').on('click', (e) => {
    $('#add-task').modal('show');
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

function showNotification(title = '', message = '') {
    let toast = new bootstrap.Toast(document.querySelector('#live-toast'));
    $('.toast-title').text(title.trim());
    $('.toast-message').text(message.trim());
    $('.toast-container').css('cssText', `
            margin-left: 10px !important;
            margin-top: -10px !important;
        `);
    $('body, html').css('cssText', `
            overflow: hidden !important;
        `);
    toast.show();
}

$('#list-name-add').on('keyup', (e) => {
    if(e.keyCode === 13) {
        addList();
    }
});

$("#submit-add-list").on('click', () => {
    addList();
});

function addList() {
    ipc.send('add-list', $('#list-name-add').val().trim());
}

ipc.on('message', (e, data) => {
    showNotification(data[0], data[1]);
});

ipc.on('add-list-error', (e, data) => {
    showNotification('Add list error', data);
    $("#add-list").modal('hide');
});

ipc.on('add-list-complete', (e, data) => {
    showNotification('Add list success', 'New list has been added successfully');
    $("#add-list").modal('hide');
    $("#list-name-add").val('');
});

ipc.on('list-data', (e, data) => {
    let listContainer = document.querySelector('.task-item-container');
    listContainer.innerHTML = '';
    for(let i = data.length - 1; i > -1; i--) {
        let el = document.createElement('div');
        el.classList.add('task');
        el.setAttribute('list-id', data[i]['id']);
        el.classList.add('d-flex');
        el.setAttribute('task-id', data[i]['id']);
        el.innerHTML = `
            <i class='bx bxs-calendar-star icon' ></i>
            <span class="name">${data[i]['name']}</span>
            <button class="delete" id="delete-list" style="z-index: 9999999999999999999999" list-id="${data[i]['id']}" list-name="${data[i]['name']}"><i class='bx bx-trash' ></i></button>
            <span class="count"></span>
        `;
        if(i === data.length - 1) {
            el.classList.add('active');
        }
        listContainer.appendChild(el);
        document.querySelectorAll('.task-item-container .task').forEach(el => {
            el.addEventListener('click', () => {
                document.querySelectorAll('.task-item-container .task').forEach(elel => { elel.classList.remove('active'); });
                el.classList.add('active');
                let id = (el.hasAttribute('task-id')) ? el.getAttribute('task-id') : '';
                ipc.send('open-list', id);
                $(".tasks .head .t-name").text($('.task.active').text());
            });
        });

        document.querySelectorAll("#delete-list[list-id][list-name]").forEach(el => {
            el.addEventListener('click', () => {
                var data = {id: el.getAttribute('list-id'), name: el.getAttribute('list-name')};
                dataTemp = data;
                $('#confirm-delete-list-message').text(`Are you sure to delete list: ${data['name']} ?`);
                $('#confirm-delete-list').modal('show');
            });
        });
    }
    $('.task-item-container .task')[0].click();
});

$('#continue-delete-list').on('click', () => {
    ipc.send('delete-list', dataTemp);
    $('#confirm-delete-list').modal('hide');
});

function randomString(length = 1) {
  let allowedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890____________';
  let c = '';
  for(let i = 0; i < length; i++) {
    c += allowedChars[Math.floor(Math.random() * allowedChars.length)];
  }
  return c;
}

$('#add-task form').on('submit', (e) => {
    e.preventDefault();
    let name = $("#task-name-add").val().trim().replace('<', '').replace('>', '').replace(';', '');
    let date = $('#task-date-add').val();
    let time = $("#task-time-add").val();
    let note = $("#task-note-add").val().trim().replace('<', '').replace('>', '').replace(';', '');
    let list_id = $(".task.active").attr('list-id');
    let task_id = randomString(50);
    if(name.length < 1) {
        showNotification('Canceled', 'Enter name cahracters length more than 0');
    } else if(name.length > 60) {
        showNotification('Canceled', 'Enter name characters length less than 61');
    }
    let data = {name, date, time, note, list_id, task_id};
    ipc.send('add-task', data);
    $("#add-task").modal('hide');
    $(".task.active").click();
});

ipc.on('after-open-list', (e, data) => {
    if(data.length === 0) {
        $('.detail').addClass('nan');
        $('.detail textarea').val('');
        $('.detail .task-name').text('');
        deleteElementDeleteTask();
    }
    let listContainer = document.querySelector('.tasks .data');
    if(listContainer !== undefined) {
        listContainer.innerHTML = '';
        for(let i = data.length - 1; i > -1; i--) {
            let el = document.createElement('div');
            el.classList.add('list');
            el.setAttribute('task-id', data[i]['task_id']);
            el.innerHTML = `
                    <div class="title">${data[i]['name']}</div>
                    <div class="date"><i class='bx bx-calendar' ></i><span>${data[i]['date']}</span><i class='bx bxs-watch'></i><span>${data[i]['time']}</span></div>
            `;
            listContainer.appendChild(el);
            el.addEventListener('click', () => {
                deleteElementDeleteTask();
                openTask(data[i]['task_id']);
                $('.detail textarea').val(data[i]['note']);
                $('.detail .task-name').text('# ' + data[i]['name']);
                document.querySelectorAll('.tasks .data .list.active').forEach(elelel => {
                    elelel.classList.remove('active');
                });
                el.classList.add('active');
                // Create delete task button element
                let del = document.createElement('button');
                del.classList.add('delete');
                del.innerHTML = `<i class='bx bxs-trash-alt' ></i>`;
                del.addEventListener('click', () => {
                    deleteTask(data[i]['task_id'], data[i]['name']);
                });
                document.querySelector('.detail .bottom').appendChild(del);
            });
        }
        if($('.tasks .data .list')[0] !== undefined) {
            $('.tasks .data .list')[0].click();
        }
    }
});

function deleteElementDeleteTask() {
    if($('.detail .delete') !== undefined) {
        $('.detail .delete').remove();
    }
}

function deleteTask(id, name) {
    dataTemp = id;
    $("#confirm-delete-task").modal('show');
    $("#confirm-delete-task #confirm-delete-task-message").text(`Are you sure to delete task: ${name} ?`);
}

$('#continue-delete-task').on('click', () => {
    ipc.send('delete-task', dataTemp);
    $('#confirm-delete-task').modal('hide');
});

function openTask(id) {
    if($('.detail.nan') !== undefined) {
        $('.detail.nan').removeClass('nan');
    }
}

$("#note-detail").on('click', (e) => {
    e.preventDefault();
});

ipc.on('count-data', (e, data) => {
    console.log(data);
    for(let i = 0; i < data.length; i++) {
        var c = (data[i]['count'] < 1) ? '' : data[i]['count']
        $(`.task[list-id="${data[i]['list_id']}"] .count`).text(c);
    }
});