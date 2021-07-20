// +-------------------------------------------+
// |                  BOARD                    |
// |                                           |
// | +----------+  +----------+  +----------+  |
// | |  STACK   |  |  STACK   |  |  STACK   |  |
// | | +------+ |  | +------+ |  | +------+ |  |
// | | | CARD | |  | | CARD | |  | | CARD | |  |
// | | +------+ |  | +------+ |  | +------+ |  |
// | | +------+ |  | +------+ |  | +------+ |  |
// | | | CARD | |  | | CARD | |  | | CARD | |  |
// | | +------+ |  | +------+ |  | +------+ |  |
// | | +------+ |  | +------+ |  | +------+ |  |
// | | | CARD | |  | | CARD | |  | | CARD | |  |
// | | +------+ |  | +------+ |  | +------+ |  |
// | +----------+  +----------+  +----------+  |
// +-------------------------------------------+


/** List of API endpoints. Immutable */
const NEXTCLOUD_API_ENDPOINTS = {
  DECK_BASE_URL: "/index.php/apps/deck/api/v1.0/", // The API is located at https://nextcloud.local/index.php/apps/deck/api/v1.0
  BOARDS: "boards", // Fetch all user board GET /api/v1.0/boards
  BOARDS_DETAILS: "?details", // Fetch all user board with details GET /api/v1.0/boards?details
  STACKS: "stacks", // Get stacks - GET /boards/{boardId}/stacks
  CARDS: "cards", // POST /boards/{boardId}/stacks/{stackId}/cards - Create a new card
};

/** This objects returns constructed endpoint for fetch */
const NEXTCLOUD_REQUESTS = {
  GET_BOARDS: function (details) // Fetch all user board with details GET /api/v1.0/boards?details
  {
    const addDetails = (details) ? NEXTCLOUD_API_ENDPOINTS.BOARDS_DETAILS : "";
    return { 'ENDPOINT': NEXTCLOUD_API_ENDPOINTS.DECK_BASE_URL + NEXTCLOUD_API_ENDPOINTS.BOARDS + addDetails, 'METHOD': 'GET', 'ADDITIONAL_HEADERS': null };
  },
  CREATE_CARD: function (boardId, stackId, title, order, description) // POST /boards/{boardId}/stacks/{stackId}/cards - Create a new card
  {
    return {
      'ENDPOINT': NEXTCLOUD_API_ENDPOINTS.DECK_BASE_URL + NEXTCLOUD_API_ENDPOINTS.BOARDS + "/" +
        boardId + "/" + NEXTCLOUD_API_ENDPOINTS.STACKS + "/" + stackId + "/" + NEXTCLOUD_API_ENDPOINTS.CARDS,
      'METHOD': 'POST', 'BODY': { title: title, type: 'plain', order: order, description: description }, 'ADDITIONAL_HEADERS': null
    };
  },
};

/** Fetches all structure from Nextcloud instance and saves it to the chrome.storage with saveBoards */
function fetch_and_save_boards()
{
  call_nextcloud_api(NEXTCLOUD_REQUESTS.GET_BOARDS(true), saveBoards);
}

function create_new_card(boardId, stackId, title, order, description)
{
  call_nextcloud_api(NEXTCLOUD_REQUESTS.CREATE_CARD(boardId, stackId, title, order, description));
}


/** This function saves boards to chrome.storage
 *  also saves labels and stacks if available.
 */
function saveBoards(boards) 
{
  let debug;
  chrome.storage.sync.get('debug_mode', (debug) =>
  {
    if (chrome.runtime.lastError) { console.error(chrome.runtime.lastError.message); } // error using browser local storage
    debug = debug.debug_mode;
  });
  let boardsToSave = [];
  for (let { title, color, id, stacks } of boards)
  {
    const currBoard = { title: title, color: color, id: id, stacks: stacks }
    boardsToSave.push(currBoard);
  }
  chrome.storage.sync.set({
    nextcloud_boards: boardsToSave
  }, () =>
  {
    if (chrome.runtime.lastError) { console.error(chrome.runtime.lastError.message); } // error using browser local storage
    else
    {
      if (debug) console.log(`Saving ${boards} boards to local storage`);
    }
  });
}


/** Generic function for calling Nextcloud API */
function call_nextcloud_api(nextcloud_request, callback)
{
  const additional_headers = nextcloud_request.ADDITIONAL_HEADERS;
  const body = nextcloud_request.BODY;
  chrome.storage.sync.get(["nextcloud_instance", "nextcloud_username", "nextcloud_password", "debug_mode"], (items) =>
  {
    if (chrome.runtime.lastError) { console.error(chrome.runtime.lastError.message); } // error using chrome.storage
    else
    {
      if (Object.values(items).length > 0)
      {
        const nextcloud_instance = items.nextcloud_instance;
        const nextcloud_username = items.nextcloud_username;
        const nextcloud_pasword = items.nextcloud_password;
        const debug = items.debug_mode;

        if (debug)
        {
          const additional_headers_message = (additional_headers) ? additional_headers : "No additional headers";
          const body_message = (body) ? body : "Request without body";
          console.log("Fetch Nextcloud API with: \'" + nextcloud_username + "\' username")
          console.log("Request:", nextcloud_request.METHOD, nextcloud_instance + nextcloud_request.ENDPOINT)
          console.log("Headers:", additional_headers_message);
          console.log("Body:", body_message);
        }
        if (nextcloud_request.METHOD == 'GET')
        {
          fetch(nextcloud_instance + nextcloud_request.ENDPOINT, {
            method: nextcloud_request.METHOD,
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'include', // include, *same-origin, omit
            headers: {
              'Authorization': 'Basic ' + btoa(nextcloud_username + ":" + nextcloud_pasword),
              'Content-Type': 'application/json',
              'OCS-APIRequest': true
            },
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(body)
          }).then((response) =>
          {
            if (debug)
            {
              if (response.ok)
              {
                console.log("Response status code:", response.status);
              } else
              {
                console.error("Response status code:", response.status);
              }
            }
            return response.json();
          }).then((data) =>
          {
            if (debug)
            {
              console.log("Data returned by endpoint", nextcloud_instance + nextcloud_request.ENDPOINT + ":", data);
            }
            if (callback) { callback(data); }
            return data;
          }).catch((error) =>
          {
            console.error('ERROR', error);
          });
        }
        else
        {
          fetch(nextcloud_instance + nextcloud_request.ENDPOINT, {
            method: nextcloud_request.METHOD,
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'include', // include, *same-origin, omit
            headers: {
              'Authorization': 'Basic ' + btoa(nextcloud_username + ":" + nextcloud_pasword),
              'Content-Type': 'application/json',
              'OCS-APIRequest': true
            },
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(body)
          }).then((response) =>
          {
            if (debug)
            {
              if (response.ok)
              {
                console.log("Response status code:", response.status);
              } else
              {
                console.error("Response status code:", response.status);
              }
            }
            return response.json();
          }).then((data) =>
          {
            if (debug)
            {
              console.log("Data returned by endpoint", nextcloud_instance + nextcloud_request.ENDPOINT + ":", data);
            }
            if (callback) { callback(data); }
            return data;
          }).catch((error) =>
          {
            console.error('ERROR', error);
          });
        }
      }
    }
  });
}