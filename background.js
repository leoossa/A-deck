chrome.runtime.onInstalled.addListener(() =>
{
  // add context menu
  chrome.contextMenus.create({ title: "Add to deck", contexts: ['page'], id: "addToDeck" });
  // open options page
  if (chrome.runtime.openOptionsPage)
  {
    chrome.runtime.openOptionsPage();
  } else
  {
    window.open(chrome.runtime.getURL('options.html'));
  }
});