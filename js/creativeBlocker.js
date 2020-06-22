var creativeBlocker = (function(global) {
	"use strict";

	function updateStatusButton(status) {
		switch (status) {
			case "requesting":
				$(".block-status-btn").html("Requesting..");
				break;
			case "blocked":
				$(".block-status-btn").html("Success");
				break;
			case "failed":
				$(".block-status-btn").html("Failed");
				break;
			default:
				$(".block-status-btn").html("");
				break;
		}
	}

	function block(creativeId, bidderId) {
		updateStatusButton("requesting");

		let postData = {
			creative_id: creativeId, 
			dsp_id: bidderId, 
			reason: "Blocked by Creative Review for MoPub"
		};

		let request = { 
			url: API_BASE + API_BLOCK_CREATIVE ,
			data: postData,
			headers: { "Content-Type": "application/json; charset=utf-8" }
		};

		http.postRequest(request).then(function(result) {
			updateStatusButton("blocked");
		}).catch(function(error) {
			console.log("Error while requesting creative block");
			updateStatusButton("failed");
		});
	}

	function resetBlockStatusButton() {
		$(".block-status-btn").html("");
	}
 
  return {
		block: block,
		resetBlockStatusButton: resetBlockStatusButton
  }
})(this);
