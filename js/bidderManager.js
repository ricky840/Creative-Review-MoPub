var bidderManager = (function(global) {
	"use strict";

	let bidderList;

	function fetchBidderList() {
		return new Promise(function(resolve, reject) { 
			let request = { url: API_BASE + API_DSP_LIST };
			http.getRequest(request).then(function(result) {
		  	let list = JSON.parse(result.responseText);
				if (list.length > 0) {
					bidderList = list;
					console.log("Fetch bidder list successfully");
					resolve(bidderList);
				} else {
					reject([]);
				}
			}).catch(function(error) {
				console.log("Error while fetching bidder list");
				reject([]);
			});
		});
	}

	function status() {
		return (_.isUndefined(bidderList)) ? false : true;
	}
	
	function getBidderId(bidderName) {
		for (let i=0; i < bidderList.length; i++) {
			if (bidderName == bidderList[i].name)	{
				return bidderList[i].id;	
			}
		}
		return false;
	}

	function getBidderName(bidderId) {
		for (let i=0; i < bidderList.length; i++) {
			if (bidderId == bidderList[i].id)	{
				return bidderList[i].name;	
			}
		}
		return false;
	}
 
  return {
		fetchBidderList: fetchBidderList,
		status: status,
		getBidderId: getBidderId,
		getBidderName: getBidderName
  }
})(this);
