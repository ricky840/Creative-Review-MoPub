var bidderManager = (function(global) {
	"use strict";

	let bidderList = [];
	let bidderListActive = [];
	let bidderListKeyById = {};
	let bidderListKeyByName = {};

	function fetchBidderList() {
		return new Promise(function(resolve, reject) { 
			let request = { url: API_BASE + API_DSP_LIST };
			http.getRequest(request).then(function(result) {
		  	let list = JSON.parse(result.responseText);
				if (list.length > 0) {
					bidderList = list;
					console.log("Bidder list fetched successfully");
					(saveBidderList(bidderList)) ? resolve(true) : reject(false);
				} else {
					reject(false);
				}
			}).catch(function(error) {
				console.log(`Error while fetching bidder list: ${error}`);
				reject(false);
			});
		});
	}

	function saveBidderList(bidderList) {
		for (let i=0; i < bidderList.length; i++) {
			let bidder = bidderList[i];
			bidderListKeyById[bidder.id] = bidder;
			bidderListKeyByName[bidder.name] = bidder;
			if (bidder.active) bidderListActive.push(bidder);
		}
		return true;
	}

	function getBidderByName(name) {
		let result = (bidderListKeyByName[name] == undefined) ? {} : bidderListKeyByName[name];
		return result;
	}

	function getBidderByKey(key) {
		let result = (bidderListKeyById[key] == undefined) ? {} : bidderListKeyById[key];
		return result;
	}

	function getBidderList() {
		return bidderList;
	}

	function getActiveBidderList() {
		return bidderListActive;
	}

	function getBidderListForDropDown() {
		let bidderList = getActiveBidderList();
		let list = [];
		for (let i=0; i < bidderList.length; i++) {
			let status = (bidderList[i].active == true) ? "bidderstatusactive" : "bidderstatusinactive"
			let name = `<biddername>${bidderList[i].name}</biddername>`;
			name += `<bidderid>${bidderList[i].id}</bidderid>`;
			name += `<${status} class="right floated"></${status}>`;
			let item = {
				name: name,
				value: bidderList[i].id
			};
			list.push(item);
		}
		return list;
	}
 
  return {
		fetchBidderList: fetchBidderList,
		getBidderByName: getBidderByName,
		getBidderByKey: getBidderByKey,
		getBidderList: getBidderList,
		getActiveBidderList: getActiveBidderList,
		getBidderListForDropDown: getBidderListForDropDown
  }
})(this);
