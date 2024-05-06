document.addEventListener('DOMContentLoaded', () => {
  addEventListeners();
  populateUI();
});

function addEventListeners() {
  //add open options button event listener
  document.querySelector('#options').addEventListener('click', function () {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });

  document.querySelector('#refresh').addEventListener('click', function () {
    fetch_and_save_boards();
    populateUI();
  });

  //add get decks button event listener
  document.getElementById('sendPage').addEventListener('click', function (event) {
    const sendPageButton = document.getElementById('sendPage');
    chrome.storage.sync.get(["debug_mode", "defaultBoardId", "defaultStackId", "archive"], (items) => {
      if (items.defaultStackId) // if there's no selected stack to send then there's no point of making call
      {
        chrome.tabs.query({ active: true, currentWindow: true }, currentTab => {
          if (items.archive) {
            archivePage(currentTab[0].url);
          }
          if (items.debug_mode) console.log("current tab is:", currentTab);
          create_new_card(items.defaultBoardId, items.defaultStackId, currentTab[0].title, 1, currentTab[0].url, ((data) => {
            sendPageButton.classList.toggle('fadeOut');
            setTimeout(function () { sendPageButton.remove(); }, 1000);
          }));
        });
      }
    });
  });
  document.getElementById('saveSelectorsSettings').addEventListener('click', async function () {
    let [currentTab] = await getCurrentTab();
    let cardTitleSelector = document.getElementById('cardTitle').value;
    let cardTitleSelectorResult = await evaluateSelectorOnTab(cardTitleSelector, currentTab);
    let cardDescriptionSelector = document.getElementById('cardDescription').value;
    let cardDescriptionSelectorResult = await evaluateSelectorOnTab(cardDescriptionSelector, currentTab);
    setPreviews(cardTitleSelectorResult, cardDescriptionSelectorResult);
    let settings = makeSettings(currentTab, cardTitleSelector, cardDescriptionSelector);
    chrome.storage.sync.set(settings, () => {
      if (chrome.runtime.lastError) { console.error(chrome.runtime.lastError.message); } // error using browser local storage
      console.log("settings set to:", settings);
    });
  });
}

function makeSettings(currentTab, cardTitleSelector, cardDescriptionSelector) {
  let tabOrigins = new URL(currentTab.url).origin;
  let settings = { [tabOrigins]: {} };
  if (cardTitleSelector) {
    settings[tabOrigins]["cardTitle"] = cardTitleSelector;
  }
  if (cardDescriptionSelector) {
    settings[tabOrigins]["cardDescription"] = cardDescriptionSelector;
  }
  return settings;
}

function setPreviews(cardTitle, cardDescription) {
  document.getElementById('cardTitlePreview').value = cardTitle;
  document.getElementById('cardDescriptionPreview').value = cardDescription;
}

async function evaluateSelectorOnTab(selector, tab) {
  let injectionResults = null;
  try {
    injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: evaluateSelector,
      args: [selector]
    })
  }
  catch (e) {
    console.error('Provided XPath expression is not valid', e)
  }
  if (injectionResults && injectionResults[0].result) {
    return injectionResults[0].result;
  }
  else {
    return null;
  }
}

async function getCurrentTab() {
  return await chrome.tabs.query({ active: true, currentWindow: true });
}

function archivePage(url) {
  console.log("not implemented yet");
  alert("not implemented yet");
}

function evaluateSelector(selector) {
  return document.evaluate(selector, document, null, XPathResult.STRING_TYPE, null).stringValue;
}