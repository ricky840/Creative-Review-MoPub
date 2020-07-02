var csvManager = (function(global) {
	"use strict";

	// Final list
	let uploadedCreatives = [];

	// Column names
	const colNameCreativeIdBidderId = "Creative ID + Bidder ID";
	const colNameCreativeId = "Creative ID";
	const colNameBidderName = "Bidder Name";

	// Skip rows for Creative ID + Bidder ID CSV format
	const skipRows = [
		"Creative ID + Bidder ID", // Title Row
		"No Winning Bidder-----No Winning Bidder",
		"No Winning Bidder",
		"Not Available-----5eb264ZqwL"
	];

	// Skip creative Id (invalid creative ids)
	const invalidCreativeIds = [
		"Creative ID",
		"Not Available"
	];

	function validateFormat(titleRow) {
		let indexCreativeIdBidderId;
		let indexCreativeId;
		let indexBidderName;
		for (let i=0; i < titleRow.length; i++) {
			let eachCol = titleRow[i];
			switch (eachCol) {
				case colNameCreativeIdBidderId:
					indexCreativeIdBidderId = i;
					break;
				case colNameCreativeId:
					indexCreativeId = i;
					break;
				case colNameBidderName:
					indexBidderName = i;
					break;
			}
		}
		// Verify input
		if (!_.isUndefined(indexCreativeIdBidderId)) {
			return {
				type: 1, // Creative ID + Bidder ID
				index: indexCreativeIdBidderId 
			};
		} else if (!_.isUndefined(indexCreativeId) && !_.isUndefined(indexBidderName)) {
			return {
				type: 2, // Creative ID, Bidder Name in separate columns
				creative_id_index: indexCreativeId,
				bidder_name_index: indexBidderName
			};
		} else {
			return false;
		}
	}

	function parseFile(file, callback) {
		Papa.parse(file, {
			config: { comments: true, skipEmptyLines: true },
			complete: function(results) {
				console.log("Uploaded file parsed");

				let titleRow = results.data[0];
				let validateResult = validateFormat(titleRow);

				if (!validateResult) {
					console.log("File is in wrong format");
					callback(false);
					return;
				}

				// When CSV includes Creative ID + Bidder ID column
				if (validateResult.type == 1) {
					let creativeIdsAndBidderIds = process(validateResult.index, results.data);
					if (creativeIdsAndBidderIds.length > 0) {
						uploadedCreatives = creativeIdsAndBidderIds;
						callback(true);
						return;
					} else {
						console.log("Uploaded file does not have any valid ids");
						callback(false);
						return;
					}
				}

				// When CSV includes Creative ID and Bidder Name column
				if (validateResult.type == 2) {
					let creativeIdsAndBidderIds = processWithIdAndName(
						validateResult.creative_id_index,
						validateResult.bidder_name_index, 
						results.data);

					if (creativeIdsAndBidderIds.length > 0) {
						uploadedCreatives = creativeIdsAndBidderIds;
						callback(true);
						return;
					} else {
						console.log("Uploaded file does not have any valid ids");
						callback(false);
						return;
					}
				}
			}
		});
	}

	function processWithIdAndName(creativeIdIndex, bidderNameIndex, data) {
		let targetCreatives = [];
		
		for (let i=0; i < data.length; i++) {
			let eachRow = data[i];
			let eachRowFiltered = eachRow.filter(function(value) {return value;});
			if (_.isEmpty(eachRowFiltered)) continue;

			let creativeId = eachRowFiltered[creativeIdIndex].trim();

			// Skip if creative Id is not valid
			if (invalidCreativeIds.includes(creativeId)) continue;
			if (creativeId.includes("Other")) continue;

			// Find bidder Id
			let bidderName = eachRowFiltered[bidderNameIndex].trim();
			let bidder = bidderManager.getBidderByName(bidderName);
			let bidderId = (bidder) ? bidder.id : undefined;

			// Save only if bidder Id is available
			if (bidderId) {
				targetCreatives.push({
					creativeId: creativeId,
					bidderId: bidderId 
				});
			}
		}

		return targetCreatives;
	}

	function process(columnIndex, data) {
		let targetCreatives = [];

		for (let i=0; i < data.length; i++) {
			let eachRow = data[i];
			let eachRowFiltered = eachRow.filter(function(value) {return value;});
			if (_.isEmpty(eachRowFiltered)) continue;

			let creativeIdAndBidderId = eachRowFiltered[columnIndex].trim();

			// Skip if row is not in the creative id + bidder id format
			if (skipRows.includes(creativeIdAndBidderId)) continue;
			if (creativeIdAndBidderId.includes("Not Available")) continue;

			let creativeIdAndBidderIdArray = creativeIdAndBidderId.split(DELIMETER);
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
