import { gapi } from "gapi-script";

// Client ID and API key from the Developer Console
const CLIENT_ID =
  "332113919380-dqb0076eim4p14p6pcv88nmg2j46im4a.apps.googleusercontent.com";
const API_KEY = "AIzaSyDviN1mLnga8oRIK1TD2nFPnnSpUIxYVrI";

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
// const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';
const SCOPES = "https://www.googleapis.com/auth/drive";

let updateSigninStatus;
export function init(f) {
  updateSigninStatus = f
  gapi.load("client:auth2", initClient);

}

export function login() {
  gapi.auth2.getAuthInstance().signIn();
}

export function logout() {
  gapi.auth2.getAuthInstance().signOut();
}

async function initClient() {
  await gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    })
    .catch((error) => {
      console.error(JSON.stringify(error, null, 2));
    });
  // Listen for sign-in state changes.
  gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

  // Handle the initial sign-in state.
  updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
}