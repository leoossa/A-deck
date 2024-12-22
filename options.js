/** Saves options to chrome.storage */
function save_options() {
  // Check if debug checkbox is checked and store in local storage
  const debug = document.getElementById('debug').checked;
  chrome.storage.sync.set({ debug_mode: debug }, () => {
    if (chrome.runtime.lastError) { console.error(chrome.runtime.lastError.message); } // error using browser local storage
  });
  // check each input validity
  if (Array.from(document.querySelectorAll("#instance, #username, #password")).every((element) => element.checkValidity())) {
    const instance = document.getElementById('instance').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const archive = document.getElementById('archive').checked;
    if (String(instance).endsWith('/')) {
      nextcloud_instance = String(instance).slice(0, -1);
    }
    /** 
     * https://stackoverflow.com/questions/22090255/how-to-store-a-password-as-securely-in-chrome-extension/22103578#22103578
    */
    chrome.storage.sync.set({
      nextcloud_instance: instance,
      nextcloud_username: username,
      nextcloud_password: password,
      archive: archive
    }, () => {
      if (chrome.runtime.lastError) { console.error(chrome.runtime.lastError.message); } // error using browser local storage
      if (debug) { console.log("Options saved"); }

      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 750);
    });
  }
  else {
    Array.from(document.querySelectorAll("#instance, #username, #password")).forEach((element) => {
      if (element.name != "password") {
        element.checkValidity() ? console.log(element.name, "input value is:\'", element.value, "\'")
          : console.error(element.name, "input has incorrect value:\'", element.value, "\'");
      } else {
        if (!element.checkValidity()) {
          console.error(element.name, "input has incorrect value");
          const status = document.getElementById('status');
          status.textContent = element.name + ' has incorrect value!';
        }
      }
    });
  }
}

/** Restore options from chrome.storage */
function restore_options() {
  chrome.storage.sync.get(["nextcloud_instance", "nextcloud_username", "debug_mode", "nextcloud_boards", "archive"], (items) => {
    if (chrome.runtime.lastError) { console.error(chrome.runtime.lastError.message); } // error using chrome.storage
    else {
      if (Object.values(items).length > 0) {
        document.getElementById('instance').value = items.nextcloud_instance;
        document.getElementById('username').value = items.nextcloud_username;
        document.getElementById('debug').checked = items.debug_mode;
        document.getElementById('archive').checked = items.archive;
        if (items.nextcloud_boards.length > 0) {
          if (items.debug_mode) {
            console.log("Found saved boards, populating UI...")
          }
          populateUI();
        }
      }
    }
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('launchWebAuthFlow').addEventListener('click', function (event) {
  console.log("web auth flow");
  event.preventDefault();
  const instance = document.getElementById('instance');
  if (instance.checkValidity()) {
    let loginURL = instance.value + "index.php/login/v2"
    fetch(loginURL, {
      method: "POST",
      headers: {
        "User-Agent": "A-deck Chrome Extension",
      },
    }).then((value) => {
      console.log("Success");
      value.json().then(
        (data) => {
          console.log(data);
          chrome.tabs.create({ url: data.login }).then((tab) => {
            chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
              if (tab.id == tabId) {
                console.log("Closed auth session");
                fetch(data.poll.endpoint, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  body: new URLSearchParams({
                    'token': data.poll.token
                  })
                }).then((loginData) => {
                  console.log("logged in");
                  loginData.json().then(
                    (user_data) => {
                      const username = document.getElementById('username').value = user_data.loginName;
                      const password = document.getElementById('password').value = user_data.appPassword;
                      save_options();
                      fetch_and_save_boards();
                      populateUI();
                    }
                  )
                })
              }
            })
          })
        }
      )
    },
      () => { console.log("Failure"); });
  }
});
document.getElementById('save').addEventListener('click', function (event) {
  event.preventDefault();
  save_options();
  fetch_and_save_boards();
  populateUI();
});