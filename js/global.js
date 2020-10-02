const API_BASE = "https://app.mopub.com";
const API_GET_CREATIVE = "/web-client/api/dsps/creative?";
const API_GET_MPX_CREATIVE_LIST = "/web-client/api/marketplace/dsp-creatives/query?";
const API_GET_LINE_ITEM_CREATIIVE_LIST = "/web-client/api/line-items/dsp-creatives/query?";
const API_GET_USER_LIST = "/web-client/api/users/query";
const API_BLOCK_CREATIVE = "/web-client/api/account/create-creative-id-blocks";
const API_DSP_LIST = "/web-client/api/dsps/query";
const PREVIEW_URL = "https://app.mopub.com/staff/creative-preview?";

// Mraid.js file CDN
const MRAID_CDN = "https://d2al1opqne3nsh.cloudfront.net/js/mraid.js";

// MoAnalytics creative id + bidder id column delimeter
const DELIMETER = "-----";

// Server default settings
const SERVER_PORT = "9000";
const SERVER_API_URL = "/api/render?";
const SERVER_FIXED_OPTIONS = [
	"output=screenshot",
	"screenshot.type=jpeg",
	"goto.waitUntil=load",
	"ignoreHttpsErrors=true"
];
const SERVER_HEALTH_CHECK_URL = "/ok";

// FAIL IMAGE IN CARD
FAIL_IMG = "img/fail.png";

// Temporary
NUMBER_OF_CREATIVE_TO_LOAD = 100000000;

// Default Screen Size
const DEFAULT_SCREEN_WIDTH = 320;
const DEFAULT_SCREEN_HEIGHT = 480;

// List of sharding domains
const SHARDING_DOMAINS = [
	"http://find-creative-1.datswatsup.com",
	"http://find-creative-2.datswatsup.com",
	"http://find-creative-3.datswatsup.com",
	"http://find-creative-4.datswatsup.com",
	"http://find-creative-5.datswatsup.com",
	"http://find-creative-6.datswatsup.com",
	"http://find-creative-7.datswatsup.com",
	"http://find-creative-8.datswatsup.com",
	"http://find-creative-9.datswatsup.com",
	"http://find-creative-10.datswatsup.com",
	"http://find-creative-11.datswatsup.com",
	"http://find-creative-12.datswatsup.com",
	"http://find-creative-13.datswatsup.com",
	"http://find-creative-14.datswatsup.com",
	"http://find-creative-15.datswatsup.com",
	"http://find-creative-16.datswatsup.com"
];

// Default number of sharding domain
var NumberOfShardingDomain;

// Default skip offset
var SkipOffset;

// Vast.datswatusp.com domain
const VAST_DATSWATSUP_COM = "http://vast.datswatsup.com/";

// ***********************
// Notification messages
 
// When uploaded file is not valid
const ERROR_FILE_IS_NOT_VALID = {
	header: "File Invalid Error",
	description: "Uploaded file is either in the wrong format or the bidder list is not available. Upload the correct file format or refresh the page, and try it again."
};
// When there is no creative returned from MoPub UI
const ERROR_NO_CREATIVE = {
	header: "No Creatives",
	description: "There is no creative to process. Remove filter or login to MoPub UI and try again."
};
// When all creative is failed
const NO_SERVER_RUNNING = {
	header: "All Creatives Failed",
	description: "Did you forget to run the server? Please make sure that you chose the right port number :)"
};
// When failed to load bidder list
const ERROR_CANNOT_LOAD_BIDDER_LIST = {
	header: "Could not download the bidder list",
	description: "Did you login to MoPub UI? Please login and try again."
};
// Server health check failed
const SERVER_HEALTH_CHECK_FAILED = {
	header: "Server is not running",
	description: "Did you forget to start the server? Please start the server and try it again."
};
// Still in loading
const STILL_IN_LOADING = {
	header: "Still in loading",
	description: "Please wait until all creatives are loaded."
};
// Extension Updated
const EXTENSION_UPDATED = {
	header: "Extension Updated!! :-)",
	description: `Updated to ${chrome.runtime.getManifest().version}. See <a href="https://github.com/ricky840/Creative-Review-MoPub/releases" target="_blank">change logs</a> for more details.`
};
