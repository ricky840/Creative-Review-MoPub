var csvManager = (function(global) {
	"use strict";

	const colName = "Creative ID + Bidder ID";
	const skipRows = [
		"Creative ID + Bidder ID", // Title Row
		"No Winning Bidder-----No Winning Bidder",
		"No Winning Bidder",
		"Not Available-----5eb264ZqwL"
	];
	let uploadedCreatives = [];

	function parseFile(file, callback) {
		Papa.parse(file, {
			config: { comments: true, skipEmptyLines: true },
			complete: function(results) {
				let titleRow = results.data[0];
				let columnIndex;

				// Find the column
				for (let i=0; i < titleRow.length; i++) {
					let column = titleRow[i];
					if (column == colName) {
						columnIndex = i;
						break;
					}
				}

				if (_.isUndefined(columnIndex)) {
					console.log("File is in wrong format");
					callback(false);
					return;
				}

				// save data for the fetching
				let creativeIdsAndBidderIds = process(columnIndex, results.data);
				if (creativeIdsAndBidderIds.length > 0) {
					uploadedCreatives = creativeIdsAndBidderIds;
					callback(true);
				} else {
					console.log("Uploaded file does not have any valid ids");
					callback(false);
				}
			}
		});
	}

	function process(columnIndex, data) {
		let targetCreatives = [];

		for (let i=0; i < data.length; i++) {
			let eachRow = data[i];
			if (_.isEmpty(eachRow)) continue;

			let creativeIdAndBidderId = eachRow[columnIndex];

			// Skip if row is not in the creative id + bidder id format
			if (skipRows.includes(creativeIdAndBidderId)) continue;

			let creativeIdAndBidderIdArray  = creativeIdAndBidderId.split(DELIMETER);
			if (creativeIdAndBidderIdArray.length != 2) continue;
			targetCreatives.push({
				creativeId: creativeIdAndBidderIdArray[0],
				bidderId: creativeIdAndBidderIdArray[1]
			});
		}

		return targetCreatives;
	}

	function getUploadedCreatives() {
		return uploadedCreatives;
	}

	function reset() {
		uploadedCreatives = [];
	}
 
  return {
		parseFile: parseFile,
		reset: reset,
		getUploadedCreatives: getUploadedCreatives
  }
})(this);
