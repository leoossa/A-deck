document.addEventListener('DOMContentLoaded', () =>
{
  addEventListeners();
  populateUI();
});

function addEventListeners()
{
  //add open options button event listener
  document.querySelector('#options').addEventListener('click', function ()
  {
    if (chrome.runtime.openOptionsPage)
    {
      chrome.runtime.openOptionsPage();
    } else
    {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });

  document.querySelector('#refresh').addEventListener('click', function ()
  {
    fetch_and_save_boards();
    populateUI();
  });
  //add get decks button event listener
  document.getElementById('sendPage').addEventListener('click', function (event)
  {
    chrome.storage.sync.get(["debug_mode", "defaultBoardId", "defaultStackId", "archive"], (items) =>
    {
      if (items.defaultStackId) // if there's no selected stack to send then there's no point of making call
      {
        chrome.tabs.query({ active: true, currentWindow: true }, currentTab => 
        {
          if (items.archive)
          {
            archivePage(currentTab[0].url);
          }
          if (items.debug_mode) console.log("current tab is:", currentTab);
          create_new_card(items.defaultBoardId, items.defaultStackId, currentTab[0].title, 1, currentTab[0].url);
        });
      }
    });
  });
}

function archivePage(url)
{
  console.log("not implemented yet");
  alert("not implemented yet");
}