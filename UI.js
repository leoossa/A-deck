function populateUI()
{
    M.AutoInit();
    getOriginSettings();
    cleanPreviouslyDisplayedBoards();
    chrome.storage.sync.get(["nextcloud_boards", "debug_mode", "defaultBoardId", "defaultStackId"], (items) => {
        if (chrome.runtime.lastError) { console.error(chrome.runtime.lastError.message); } // error using chrome.storage
        else {
            if (items.nextcloud_boards) {
                const boardList = document.getElementById('decksList');
                const boardTemplate = document.getElementById('boardItem-template');
                const stackTemplate = boardTemplate.content.getElementById('stackItem-template');

                const boardStructure = items.nextcloud_boards;
                boardStructure.forEach(board => {
                    if (items.debug_mode) {
                        console.log("Board to display:%O", board);
                    }
                    const currentBoardItem = boardTemplate.content.cloneNode(true);
                    currentBoardItem.querySelector('.title').innerText = `board: ${board.title}`;
                    const liBoardItem = currentBoardItem.querySelector('li');
                    liBoardItem.style.backgroundColor = `#${board.color}`; // Deck API retruns board color in "0087C5" format
                    const textColor = (parseInt(board.color, 16) > 0xffffff / 2) ? '#000' : '#fff'; // this is simplified formula taken from https://stackoverflow.com/a/33890907
                    liBoardItem.style.color = textColor
                    board.stacks.forEach(stack => {
                        const stacksList = currentBoardItem.getElementById('stacksList');
                        if (items.debug_mode) {
                            console.log("Stack to display:", stack);
                        }
                        const currentStackItem = stackTemplate.content.cloneNode(true);
                        const liLabel = currentStackItem.querySelector('label');
                        liLabel.style.color = textColor;
                        currentStackItem.querySelector('.title').innerText = `${stack.title}`;
                        currentStackItem.querySelector('input[type=radio]').value = `${board.id}.${stack.id}`;
                        if (board.id == items.defaultBoardId && stack.id == items.defaultStackId) { currentStackItem.querySelector('input[type=radio]').checked = true; }
                        stacksList.append(currentStackItem);
                    });
                    boardList.append(currentBoardItem);
                });
            }
        }
    });
}

function getOriginSettings() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        if (chrome.runtime.lastError)
            console.error(chrome.runtime.lastError);
        chrome.storage.sync.get(["debug_mode"], (items) => {
            if (chrome.runtime.lastError) { console.error(chrome.runtime.lastError.message); } // error using chrome.storage
            if (tab) {
                if (items.debug_mode) {
                    console.log("Current tab: %O", tab);
                }
                let tabOrigins = new URL(tab.url).origin;
                if (items.debug_mode) { console.log("Current tab origin: %s", tabOrigins); }
                chrome.storage.sync.get(tabOrigins, (items) => {
                    if (chrome.runtime.lastError) { console.error(chrome.runtime.lastError.message); } // error using chrome.storage
                    if (items[tabOrigins]) {
                        console.log("Settings for this tab origin: %s", tabOrigins);
                    }
                    else {
                        console.log("No settings for this tab origin: %s", tabOrigins);
                        const tabOriginSettingsButton = document.getElementById('originSettings');
                        tabOriginSettingsButton.lastChild.textContent = `Add settings for ${tabOrigins}`;
                    }
                });
            }

        });
    });
}

function cleanPreviouslyDisplayedBoards() {
    document.querySelectorAll('#decksList>li').forEach((board) => {
        board.remove();
    });
}

// Immediately persist options changes
decksList.addEventListener('change', (event) => {
    let debug_mode;
    chrome.storage.sync.get('debug_mode', (debug) => {
        if (chrome.runtime.lastError) { console.error(chrome.runtime.lastError.message); } // error using browser local storage
        debug_mode = debug.debug_mode;
    });
    const selectedStack = document.querySelector('input[type=radio]:checked').value;
    const boardId_stackId = String(selectedStack).split('.');
    const defaultBoardId = boardId_stackId[0];
    const defaultStackId = boardId_stackId[1];
    chrome.storage.sync.get("nextcloud_boards", (boards) => {
        const defaultBoard = boards.nextcloud_boards.find((board) => { return board.id == defaultBoardId; });
        const defaultBoardTitle = defaultBoard.title;
        const defaultStackTitle = defaultBoard.stacks.find((stack) => { return stack.id == defaultStackId; }).title;
        chrome.storage.sync.set({
            defaultBoardId: defaultBoardId,
            defaultStackId: defaultStackId,
            defaultBoardTitle: defaultBoardTitle,
            defaultStackTitle: defaultStackTitle
        }, () => {
            if (chrome.runtime.lastError) { console.error(chrome.runtime.lastError.message); } // error using browser local storage
            if (debug_mode) { console.log("Default stack:", defaultStackTitle, "(id:", defaultStackId, ") in board:", defaultBoardTitle, "(id:", defaultBoardId, ")"); }

        });
        updateContextMenu();
    });
});

function updateContextMenu() {
    chrome.storage.sync.get(["defaultBoardTitle", "defaultStackTitle", "defaultBoardId", "defaultStackId"], (items) => {
        chrome.contextMenus.update("addToDeck", {
            title: `Add to ${items.defaultStackTitle} in ${items.defaultBoardTitle}`, onclick: (info, tab) => {
                alert("This function is under active development and it is not ready yet!");
            }
        });
    });
}