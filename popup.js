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
  document.getElementById('saveSelectorsSettings').addEventListener('click', function () {
    executeSelectorOnCurrentTabAndInjectResult('cardTitle', 'cardTitlePreview');
    executeSelectorOnCurrentTabAndInjectResult('cardDescription', 'cardDescriptionPreview');
  });
}

function executeSelectorOnCurrentTabAndInjectResult(selectorElementId, previewElementId) {
  let element = document.getElementById(selectorElementId);
  chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]) => {
    if (currentTab) {
      try {
        chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          func: evaluateSelector,
          args: [element.value]
        }).then(injectionResults => {
          if (injectionResults[0].result) {
            console.log(element.labels[0].textContent + " : " + injectionResults[0].result);
            document.getElementById(previewElementId).value = injectionResults[0].result;
            let tabOrigins = new URL(currentTab.url).origin;
            let settings = { [tabOrigins]: { [element.id]: element.value } };
            chrome.storage.sync.get([tabOrigins], (items) => {
              if (items[tabOrigins].cardDescription) {
                console.log("cardDescription set to:", items[tabOrigins].cardDescription);
                settings[tabOrigins].cardDescription = items[tabOrigins].cardDescription;
              }
              if (items[tabOrigins].cardTitle) {
                console.log("cardTitle set to:", items[tabOrigins].cardTitle);
                settings[tabOrigins].cardTitle = items[tabOrigins].cardTitle;
              }
              console.log("settings set to:", settings);
              chrome.storage.sync.set(settings, () => {
                if (chrome.runtime.lastError) { console.error(chrome.runtime.lastError.message); } // error using browser local storage
                console.log("tabOrigins set to:", tabOrigins);
              });
            })
          }
          else {
            document.getElementById(previewElementId).value = "";
          }
        })
      } catch (e) {
        console.error('Provided XPath expression is not valid', e)
      }
    }
  });
}

function archivePage(url) {
  console.log("not implemented yet");
  alert("not implemented yet");
}

function evaluateSelector(selector) {
  return document.evaluate(selector, document, null, XPathResult.STRING_TYPE, null).stringValue;
}