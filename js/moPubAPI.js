var moPubAPI = (function(global) {
  "use strict";

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
					resolve(creatives);
				});
			}).catch(function(error) {
				console.log(`[Error] Failed to load creative list from MoPub: ${error}`);
				reject([]);
			});
		});
	}

  function getCreative(bidderId, creativeId, callback) {
		let creative = new Creative(creativeId, bidderId);
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
			creatives.push(creative);
			promises.push(creative.loadMarkUp());	
		}
		// Don't promise all to be successful
		Promise.allSettled(promises).then(response => {
			callback(creatives);
		});
	}

  function getCreativeForAdUnit(adunit) {

  }

  return {
    getCreativeForAdUnit: getCreativeForAdUnit,
    getCreative: getCreative,
    getCreativesByLineItem: getCreativesByLineItem,
    getCreativesForMarketPlaceTab: getCreativesForMarketPlaceTab,
		getCreativesByBulkCreativeIds: getCreativesByBulkCreativeIds
  }
})(this);
