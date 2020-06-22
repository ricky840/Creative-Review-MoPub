const API_BASE = "https://app.mopub.com";
const API_GET_CREATIVE = "/web-client/api/dsps/creative?";
const API_GET_MPX_CREATIVE_LIST = "/web-client/api/marketplace/dsp-creatives/query?";
const API_GET_LINE_ITEM_CREATIIVE_LIST = "/web-client/api/line-items/dsp-creatives/query?";
const API_GET_USER_LIST = "/web-client/api/users/query";
const API_BLOCK_CREATIVE = "/web-client/api/account/create-creative-id-blocks";

const MRAID_CDN = "https://d2al1opqne3nsh.cloudfront.net/js/mraid.js";

// MoAnalytics creative id + bidder id column delimeter
const DELIMETER = "-----";

// const HEROKU_BASE = "https://mopub-preview-ad.herokuapp.com";
// const HEROKU_API_URL = "/api/render?";
// const HEROKU_OPTIONS = "output=screenshot&waitFor=5000&viewport.width=320&viewport.height=50&screenshot.type=jpeg&screenshot.quality=10";
const HEROKU_API_KEY = "062da44af48b4dcebb03a6dbf8768e00";

const SERVER_PORT = "9000";
const SERVER_API_URL = "/api/render?";
const SERVER_FIXED_OPTIONS = [
	"output=screenshot",
	"screenshot.type=jpeg",
	"goto.waitUntil=load",
	"ignoreHttpsErrors=true"
];

// FAIL IMAGE IN CARD
FAIL_IMG = "img/fail.png";

// TEMP
NUMBER_OF_CREATIVE_TO_LOAD = 1000;

// Default Screen Size
const DEFAULT_SCREEN_WIDTH = 320;
const DEFAULT_SCREEN_HEIGHT = 480;

const SHARDING_DOMAINS = [
	"http://localhost", 
	"http://find-creative-1.datswatsup.com",
	"http://find-creative-2.datswatsup.com",
	"http://find-creative-3.datswatsup.com",
	"http://find-creative-4.datswatsup.com",
	"http://find-creative-5.datswatsup.com",
	"http://find-creative-6.datswatsup.com",
	"http://find-creative-7.datswatsup.com",
	"http://find-creative-8.datswatsup.com",
	"http://find-creative-9.datswatsup.com",
	"http://find-creative-10.datswatsup.com"
];

var NumberOfShardingDomain = 3; // Default 3

var SkipOffset = 50; // default 3;

const VAST_DATSWATSUP_COM = "http://vast.datswatsup.com/";

// Notification messages
// 
// When uploaded file is not valid
const ERROR_FILE_IS_NOT_VALID = {
	header: "File Invalid",
	description: "Uploaded file is either in the wrong format or has no valid creative and bidder ids"
};
// When there is no creative returned from MoPub UI
const ERROR_NO_CREATIVE = {
	header: "No Creatives",
	description: "There is no creative to process. Remove filter or login to MoPub UI and try again"
};
// When all creative is failed
const NO_SERVER_RUNNING = {
	header: "All Creatives Failed",
	description: "Did you forget to run the server? Please make sure that you chose the right port number :)"
};
