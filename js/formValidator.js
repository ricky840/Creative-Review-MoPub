var formValidator = (function(global) {
	"use strict";

	function validate(formData) {
		let fetchSource, marketPlaceLineItemKey, adUnitKey, dateStr;
		let creativeId, bidderId;
		let imgQuality, renderDelay, skipOffset, serverMode, portNumber, domainShard;
		let creativeFormats;

		for (let i=0; i < formData.length; i++) {
			switch(formData[i].name) {
				case "fetch_source":
					fetchSource = formData[i].value;
					break;
				case "creative_id":
					creativeId = formData[i].value;
					break;
				case "bidder_id":
					bidderId = formData[i].value;
					break;
				case "mpx_line_item_id":
					marketPlaceLineItemKey = formData[i].value;
					break;
				case "adunit_id":
					adUnitKey = formData[i].value;
					break;
				case "date_str":
					dateStr = formData[i].value;
					break;
				case "formats":
					creativeFormats = formData[i].value;
					break;
				case "img_quality":
					imgQuality = formData[i].value;
					break;
				case "render_delay":
					renderDelay = formData[i].value;
					break;
				case "skip_offset":
					skipOffset = formData[i].value;
					break;
				case "server_mode":
					serverMode = formData[i].value;
					break;
				case "port_num":
					portNumber = formData[i].value;
					break;
				case "domain_sharding":
					domainShard = formData[i].value;
					break;
			}
		}

		// Validate fetchSource
		if (_.isEmpty(fetchSource)) {
			notifyManager.error({
				header: "Form Validation Error",
				description: "Please select fetch source and try again"
			});			
			return false;
		}

		// Validate single creative
		if (fetchSource == "single_creative" && (_.isEmpty(creativeId) || _.isEmpty(bidderId))) {
			notifyManager.error({
				header: "Form Validation Error",
				description: "Please enter bidder id and creative id to proceed"
			});			
			return false;
		}

		// Validate MPX Line Item Key
		if (fetchSource == "mpx_line_item" && _.isEmpty(marketPlaceLineItemKey.trim())) {
			notifyManager.error({
				header: "Form Validation Error",
				description: "Marketplace line item key is required"
			});			
			return false;
		}

		// Validate Ad Unit Key
		if (fetchSource == "adunit_id" && _.isEmpty(adUnitKey.trim())) {
			notifyManager.error({
				header: "Form Validation Error",
				description: "Ad unit key is required"
			});			
			return false;
		}

		// Calendar only when mpx, adunit 
		if (fetchSource == "mpx_line_item" || fetchSource == "adunit_id" || fetchSource == "mpx_tab") {
			if (_.isEmpty(dateStr.trim())) {
				notifyManager.error({
					header: "Form Validation Error",
					description: "Please select a date"
				});			
				return false;
			}
		}

		// Validate file upload
		// [To-do]

		// Validate port number, if it was not provided use default.
		const isNumberRegex = /^\d+$/;
		if (!isNumberRegex.test(portNumber)) {
			notifyManager.info({
				header: "Form Validation Error",
				description: "Port number entered is not in the right format. Using default 9000 instead"
			});			
			portNumber = SERVER_PORT;	
			return false;
		}

		// at this point, all validation was successful
		return {
			fetchSource: fetchSource,
			creativeId: creativeId,
			bidderId: bidderId,
			marketPlaceLineItemKey: marketPlaceLineItemKey,
			adUnitKey: adUnitKey,
			dateStr: dateStr,
			creativeFormats: creativeFormats,
			imgQuality: imgQuality,
			renderDelay: renderDelay,
			skipOffset: skipOffset,
			serverMode: serverMode,
			portNumber: portNumber,
			domainShard: domainShard
		};
	}
 
  return {
		validate: validate
  }
})(this);
