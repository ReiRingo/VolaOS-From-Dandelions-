const langSelect = document.getElementById('lang-select');
const btnSave = document.getElementById('btn-save');
const statusText = document.getElementById('status');
const bootScreen = document.getElementById('boot-screen');
const progressBar = document.querySelector('.progress-bar');

/* Why do I need to learn about promises, I don't keep my promises! */
function runBootSequence()
{
    return new Promise((resolve) =>
    {
        let progress = 0;
        let wait = 100;
        const interval = setInterval(() =>
        {
            if (wait > 0)
            {
                wait -= (5 + Math.random() * 2) | 0;
                return;
            }
            
            progress += Math.floor(Math.random()) + 5;
            if (progress > 100)
                progress = 100;

            progressBar.style.width = `${progress}%`;

            if (progress >= 100)
            {
                clearInterval(interval);
                setTimeout(() =>
                {
                    bootScreen.style.opacity = '0';
                    setTimeout(() =>
                    {
                        bootScreen.style.display = 'none';
                        resolve();
                    }, 800);
                }, 300);
            }
        }, 120);
    });
}

let currentSettings = {};

async function init()
{
    await runBootSequence();

    statusText.textContent = 'Loading settings...';
    const settings = await window.api.loadSettings();

    if (settings && settings.available_lang)
    {
        currentSettings = settings;

        langSelect.innerHTML = '';

        settings.available_lang.forEach(([code, name]) =>
        {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${name} (${code})`;

            if (code === settings.lang) {
                option.selected = true;
            }

            langSelect.appendChild(option);
        });

        statusText.textContent = 'Languages loaded successfully.';
    }
    else
    {
        statusText.textContent = 'Failed to parse language options from settings.json.';
    }
}

btnSave.addEventListener('click', async () =>
{
    statusText.textContent = 'Saving...';

    currentSettings.lang = langSelect.value;

    const res = await window.api.saveSettings(currentSettings);

    if (res.success)
    {
        statusText.textContent = `Language saved to '${currentSettings.lang}'!`;
    }
    else 
    {
        statusText.textContent = `Error saving: ${res.error}`;
    }
});

init();

function makeDraggable(windowEl) {
    const handleEl = windowEl.querySelector('.title-bar');
    if (!handleEl) return;

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    handleEl.addEventListener('mousedown', (e) =>
    {
        if (e.button !== 0 || e.target.tagName === 'BUTTON') return;

        isDragging = true;

        const rect = windowEl.getBoundingClientRect();
        
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) =>
    {
        if (!isDragging) return;

        const parentRect = windowEl.parentElement.getBoundingClientRect();

        let newX = e.clientX - parentRect.left - offsetX;
        let newY = e.clientY - parentRect.top - offsetY;

        windowEl.style.left = `${newX}px`;
        windowEl.style.top = `${newY}px`;
    });

    document.addEventListener('mouseup', () =>
    {
        isDragging = false;
    });
}

const desktop = document.getElementById('desktop');

function selectionBoxBlueThing(desk)
{
    const desktop = desk;

    let isSelecting = false;
    let startX = 0;
    let startY = 0;
    let selectionBox = null;

    desktop.addEventListener('mousedown', (e) =>
    {
        if (e.button !== 0 || e.target !== desktop) return;

        isSelecting = true;

        const parentRect = desktop.getBoundingClientRect();

        startX = e.clientX - parentRect.left;
        startY = e.clientY - parentRect.top;

        selectionBox = document.createElement('div');
        selectionBox.classList.add('selection-box');
        selectionBox.style.left = `${startX}px`;
        selectionBox.style.top = `${startY}px`;
        selectionBox.style.width = '0px';
        selectionBox.style.height = '0px';

        desktop.appendChild(selectionBox);
    });

    document.addEventListener('mousemove', (e) =>
    {
        if (!isSelecting || !selectionBox) return;

        const parentRect = desktop.getBoundingClientRect();

        const currentX = e.clientX - parentRect.left;
        const currentY = e.clientY - parentRect.top;

        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        selectionBox.style.left = `${left}px`;
        selectionBox.style.top = `${top}px`;
        selectionBox.style.width = `${width}px`;
        selectionBox.style.height = `${height}px`;
    });

    document.addEventListener('mouseup', () =>
    {
        if (isSelecting) {
            isSelecting = false;
            if (selectionBox) {
                selectionBox.remove();
                selectionBox = null;
            }
        }
    });
}

selectionBoxBlueThing(desktop);

const desktopIcons = document.querySelectorAll('.desktop-icon');

desktopIcons.forEach(icon =>
{
    icon.addEventListener('click', (e) =>
    {
        e.stopPropagation();
        desktopIcons.forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');
    });

    icon.addEventListener('dblclick', () =>
    {
        const windowId = icon.getAttribute('data-window');
        const targetWindow = document.getElementById(windowId);
        
        if (targetWindow)
        {
            targetWindow.classList.remove('hidden', 'minimized');
            bringToFront(targetWindow);
        }
    });
});

document.getElementById('desktop').addEventListener('click', () =>
{
    desktopIcons.forEach(i => i.classList.remove('selected'));
});

let highestZIndex = 10;

function bringToFront(windowEl)
{
    highestZIndex++;
    windowEl.style.zIndex = highestZIndex;
}

document.querySelectorAll('.window').forEach(win =>
{
    win.classList.add('hidden');

    makeDraggable(win);

    win.addEventListener('mousedown', () => bringToFront(win));

    const btnClose = win.querySelector('.btn-close');

    if (btnClose)
    {
        btnClose.addEventListener('click', (e) =>
        {
            e.stopPropagation();
            win.classList.add('hidden');
        });
    }

    const btnMinimize = win.querySelector('.btn-minimize');

    if (btnMinimize)
    {
        btnMinimize.addEventListener('click', (e) => {
            e.stopPropagation();
            win.classList.add('minimized');
        });
    }
});

let loadingTimerSeconds = 4.63434;
document.body.style.cursor = 'wait';

setTimeout(() =>
{
    document.body.style.cursor = 'default';
    console.log("Timer finished!");

}, loadingTimerSeconds * 1000);