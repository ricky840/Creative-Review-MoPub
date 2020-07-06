var moPubAPI = (function(global) {
  "use strict";

	function isAdvancedBidder(bidderId) {
		let bidder = bidderManager.getBidderByKey(bidderId);
		if (_.isEmpty(bidder)) return false;

		let bidderName = bidder.name.toUpperCase();
		return (bidderName.includes("ADVANCED_")) ? true : false;
	}

	function fetchBulkCreatives(request) {
		return new Promise((resolve, reject) => {
			http.getRequest(request).then(function(result) {
				let creatives = [];
				let creativeList = JSON.parse(result.responseText);

				for (let i=0; i < creativeList.length; i++) {
					let creativeIdAndBidderId = creativeList[i].key;
					let components = creativeIdAndBidderId.split(":");
					let bidderId = components.shift();
					let creativeId = components.join(":").trim();

					if (!_.isEmpty(creativeId) && !_.isEmpty(bidderId)) {

						if (isAdvancedBidder(bidderId)) continue;	

						let creativeObj = {
							creativeId: creativeId,
							bidderId: bidderId,
							blocked:  creativeList[i].blocked,
							impressions: creativeList[i].impressions,
							publisherRevenue: creativeList[i].publisherRevenue,
							clicks: creativeList[i].clicks
						};
						let creative = new Creative(creativeObj.creativeId, creativeObj.bidderId);
						creative.setStats(creativeObj);
						creatives.push(creative);

						// Temp
						if (i == NUMBER_OF_CREATIVE_TO_LOAD) break;
					}
				}
				return creatives;
			}).then(function(creatives) {
				let promises = [];
				for (let i=0; i < creatives.length; i++) {
					promises.push(creatives[i].loadMarkUp());
				}
				// Don't promise all to be successful
				Promise.allSettled(promises).then(response => {
					// Do nothing
				}).then(function() {
					// Try just one more time
					let failedCreatives = [];
					for (let i=0; i < creatives.length; i++) {
						if (creatives[i].getDidMarkUpLoaded() != "loaded") {
							failedCreatives.push(creatives[i]);
						}
					}
					console.log(`Number of markup load failed creatives: ${failedCreatives.length}`);

					if (creatives.length == failedCreatives.length) {
						// This is all creatives were failed, just return
						resolve(creatives);
						return;
					}

					if (failedCreatives.length == 0) {
						// All were successful
						console.log("All creative's markup loaded successfully");
						resolve(creatives);
						return;
					}

					// Try one more time
					console.log("Trying to load creative markup again");
					let retryPromises = [];
					for (let i=0; i < failedCreatives.length; i++) {
						retryPromises.push(failedCreatives[i].loadMarkUp());
					}
					Promise.allSettled(retryPromises).then(response => {
						resolve(creatives);
					});
				});
			}).catch(function(error) {
				console.log(`[Error] Failed to load creative list from MoPub: ${error}`);
				reject([]);
			});
		});
	}

  function getCreative(bidderId, creativeId, callback) {
		let creative = new Creative(creativeId, bidderId);
		if (isAdvancedBidder(bidderId)) {
			callback([]);
			return;
		}
		creative.loadMarkUp().then(function(result) {
			callback([creative]);
		}).catch(function(error) {
			console.log(error);
			callback([]);
    });
  }

  function getCreativesForMarketPlaceTab(dateStr, callback) {
		const request = { url: API_BASE + API_GET_MPX_CREATIVE_LIST + `date=${dateStr}`	};
		fetchBulkCreatives(request).then(function(creatives) {
			callback(creatives);
		}).catch(function(error) {
			console.log(error);
			callback([]);
		});
  }

  function getCreativesByLineItem(dateStr, lineItemKey, callback) {
		const request = {	url: API_BASE + API_GET_LINE_ITEM_CREATIIVE_LIST + `key=${lineItemKey}&date=${dateStr}`};
		fetchBulkCreatives(request).then(function(creatives) {
			callback(creatives);
		}).catch(function(error) {
			console.log(error);
			callback([]);
		});
	}

	function getCreativesByBulkCreativeIds(bulkData, callback) {
		let promises = [];
		let creatives = [];
		for (let i=0; i < bulkData.length; i++) {
			let creative = new Creative(bulkData[i].creativeId, bulkData[i].bidderId);
			if (isAdvancedBidder(bulkData[i].bidderId)) continue;
			creatives.push(creative);
			promises.push(creative.loadMarkUp());	
		}
		// Don't promise all to be successful
		Promise.allSettled(promises).then(response => {
			// 1st
		}).then(function() {
			// Try just one more time
			let failedCreatives = [];
			for (let i=0; i < creatives.length; i++) {
				if (creatives[i].getDidMarkUpLoaded() != "loaded") {
					failedCreatives.push(creatives[i]);
				}
			}
			console.log(`Number of markup load failed creatives: ${failedCreatives.length}`);

			if (bulkData.length == failedCreatives.length) {
				// This is all creatives were failed, just return
				callback(creatives);
				return;
			}

			if (failedCreatives.length == 0) {
				// All were successful
				console.log("All creative's markup loaded successfully");
				callback(creatives);
				return;
			}

			// Try one more time
			console.log("Trying to load creative markup again");
			let retryPromises = [];
			for (let i=0; i < failedCreatives.length; i++) {
				retryPromises.push(failedCreatives[i].loadMarkUp());
			}
			Promise.allSettled(retryPromises).then(response => {
				callback(creatives);
			});
		});
	}

  function getCreativeForAdUnit(adunit) {
		// yet implemented
  }

  return {
    getCreativeForAdUnit: getCreativeForAdUnit,
    getCreative: getCreative,
    getCreativesByLineItem: getCreativesByLineItem,
    getCreativesForMarketPlaceTab: getCreativesForMarketPlaceTab,
		getCreativesByBulkCreativeIds: getCreativesByBulkCreativeIds
  }
})(this);
