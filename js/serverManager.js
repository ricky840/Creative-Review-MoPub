var serverManager = (function(global) {
	"use strict";

	function healthCheck(portNumber) {
		return new Promise(function(resolve, reject) {
			let domain = domainManager.getDomain();
			let url = domain + ":" + portNumber + SERVER_HEALTH_CHECK_URL;
			let request = { url: url };
			http.getRequest(request).then(function(result) {
				resolve(true);
			}).catch(function(error) {
				reject(false);
			});
		});
	}

	function createServerUrl(creative, options) {
		let newOptions = JSON.parse(JSON.stringify(options));

		newOptions["width"] = (creative.getWidth() != 0) ? creative.getWidth() : DEFAULT_SCREEN_WIDTH;
		newOptions["height"] = (creative.getHeight() != 0) ? creative.getHeight() : DEFAULT_SCREEN_HEIGHT;
		newOptions["domain"] = domainManager.getDomain();

		// Set max viewport (width 320, height 480)
		if (newOptions.width > 320) newOptions.width = DEFAULT_SCREEN_WIDTH;
		if (newOptions.height > 480) newOptions.height = DEFAULT_SCREEN_HEIGHT;

		let url = newOptions.domain + ":" + newOptions.portNumber + SERVER_API_URL;
		let query = SERVER_FIXED_OPTIONS.join("&");
		query += `&waitFor=${newOptions.renderDelay}`;
		query += `&viewport.width=${newOptions.width}&viewport.height=${newOptions.height}`;
		query += `&screenshot.quality=${newOptions.imgQuality}`;
		return (url + query);
	}

  return {
		createServerUrl: createServerUrl,
		healthCheck: healthCheck
  }
})(this);
