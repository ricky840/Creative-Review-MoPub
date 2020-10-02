// Close button for notification
$('.message .close').on('click', function() {
	$(this).closest('.message').hide();
});


// Save Setting button
$(".save-settings-btn").click(function(event) {
	let btn = $(this);
	let optionsList = $(".ad-form-options").serializeArray();
	chrome.storage.local.set({settings: optionsList}, function() {
		btn.html("Saved!");
		setTimeout(function() {
			btn.html("Save Settings");
		}, 2000)
	});
});


// File upload event
$('input[type="file"]').on('change', function() {
	let file = $(this).prop('files')[0];
	if (file == undefined) return;
	csvManager.parseFile(file, (result) => {
		if (!result) {
			$(this).val("");	
			csvManager.reset();
			notifyManager.error(ERROR_FILE_IS_NOT_VALID);			
		}
		console.log("Uploaded file was parsed successfully");
	});
});


// When click each card
$(".ui.cards").on("click", ".ad-card", function(event) {
	// Block if it is still in loading
	if (!statManager.isFinished()) {
		notifyManager.info(STILL_IN_LOADING);
		return;
	}

	chrome.storage.local.get("creatives", result => {
		const savedCreatives = result["creatives"];
		const clickedCreativeId = $(this).find(".card-ad-creative-id").html();
		const clickedCreativeImg = $(this).find(".ad-image > img");
		const creative = savedCreatives[clickedCreativeId];

		// If it is a download button
		if (event.target.className.includes("card-ad-download")) {
			downloadCreative(creative);
			return;
		}

		// Reset block status button
		$(".block-status-btn").html("");

		if (creative.type != "vast" && creative.type != "vast_tag") {
			$(".non-video .modal-crt-markup").val(creative.markup);
			$(".non-video .modal-crt-type").html((creative.type).toUpperCase());
			$(".non-video .modal-crt-img").attr("src", clickedCreativeImg.attr("src"));
			$(".non-video .modal-crt-bidder-id").html(creative.bidderId);
			$(".non-video .modal-crt-bidder-name").html(creative.bidderName);
			$(".non-video .modal-crt-id").html(creative.creativeId);
			$(".non-video .modal-crt-adomain").html(creative.adomain);
			$(".non-video .modal-crt-imp").html(creative.impression);
			$(".non-video .modal-crt-click").html(creative.click);
			$(".non-video .modal-crt-rev").html(creative.revenue);
			$(".non-video .modal-crt-size").html(`${creative.width}x${creative.height}`);
			$('.ui.modal.non-video').modal({
				duration: 0
			}).modal("show");
		} else {
			$(".video-modal-crt-markup").val(creative.markup);
			$(".video-modal-crt-type").html((creative.type).toUpperCase());
			$(".video-modal-crt-img").attr("src", clickedCreativeImg.attr("src"));
			$(".video-modal-crt-bidder-id").html(creative.bidderId);
			$(".video-modal-crt-bidder-name").html(creative.bidderName);
			$(".video-modal-crt-id").html(creative.creativeId);
			$(".video-modal-crt-adomain").html(creative.adomain);
			$(".video-modal-crt-imp").html(creative.impression);
			$(".video-modal-crt-click").html(creative.click);
			$(".video-modal-crt-rev").html(creative.revenue);
			$(".video-modal-crt-size").html(`${creative.width}x${creative.height}`);
			// Video modal
			$('.ui.modal.video').modal({
				duration: 0,
				onVisible: function() {
					vastPlayer.play(creative.markup);
				},
				onHide: function() {
					vastPlayer.stop();
				},
				onShow: function () {
					notifyManager.clearVideoError();
				}
			}).modal('show');
		}
	});
});


// Block button in modal
$(".ui.button.block").click(function(event) {
	// Get modal content
	let modal = $(this).parent().closest('.ui.modal');
	let thisBidderId, thisCreativeid;
	if (modal.hasClass("non-video")) {
		thisBidderId = modal.find(".modal-crt-bidder-id").html();
		thisCreativeid = modal.find(".modal-crt-id").html(); 
	} else {
		thisBidderId = modal.find(".video-modal-crt-bidder-id").html();
		thisCreativeid = modal.find(".video-modal-crt-id").html(); 
	}
	creativeBlocker.block(thisCreativeid, thisBidderId);
});


// Download button in modal
$(".ui.button.download-mopub-btn").click(function(event) {
	// Get modal content
	let modal = $(this).parent().closest('.ui.modal');
	let thisBidderId, thisCreativeid;
	if (modal.hasClass("non-video")) {
		thisBidderId = modal.find(".modal-crt-bidder-id").html();
		thisCreativeid = modal.find(".modal-crt-id").html(); 
	} else {
		thisBidderId = modal.find(".video-modal-crt-bidder-id").html();
		thisCreativeid = modal.find(".video-modal-crt-id").html(); 
	}
	chrome.storage.local.get("creatives", result => {
		let savedCreatives = result["creatives"];
		downloadCreative(savedCreatives[thisCreativeid]);
	});
});

// Download all button
$(".ui.button.download-all-btn").click(function(event) {
	chrome.storage.local.get("creatives", result => {
		let savedCreatives = result["creatives"];
		let jsonText = JSON.stringify(savedCreatives);
		let hiddenElement = document.createElement('a');
		hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(jsonText);
		hiddenElement.target = '_blank';
		hiddenElement.download = `creatives.json`;
		hiddenElement.click();
	});
});


// MoPub preview button in modal
$(".preview-mopub-btn").click(function(event) {
	let modal = $(this).parent().closest('.ui.modal');
	let thisBidderId, thisCreativeid;
	if (modal.hasClass("non-video")) {
		thisBidderId = modal.find(".modal-crt-bidder-id").html();
		thisCreativeid = modal.find(".modal-crt-id").html(); 
	} else {
		thisBidderId = modal.find(".video-modal-crt-bidder-id").html();
		thisCreativeid = modal.find(".video-modal-crt-id").html(); 
	}
	let url = `${PREVIEW_URL}creativeId=${thisCreativeid}-----${thisBidderId}`;
	window.open(url, '_blank');
});


// Submit button click
$("#ad-load-btn").click(async function(event) {
	subBtnStatus("loading");
	resetScreen();

	// Get date
	let selectedDate = new Date($('.ui.calendar').calendar('get date'));
	let dateStr = (isNaN(selectedDate.getTime())) ? "" : selectedDate.toISOString().split('T')[0];
	// Get uploaded file creatives
	let uploadedCreatives = csvManager.getUploadedCreatives();
	// Get creative formats
	let creativeFormats = $('.creative-format-dropdown').dropdown('get value');
	creativeFormats = (creativeFormats.length == 0) ? [] : creativeFormats;
	// Get bidder list (filter)
	let bidderFilters = _.compact($('.dropdown.bidder-list-filter').dropdown('get value').split(","));

	let userInput = $(".ad-form").serializeArray();
	let options = $(".ad-form-options").serializeArray();
	userInput.push({ name: "date_str", value: dateStr	});
	userInput.push({ name: "formats", value: creativeFormats });
	userInput.push({ name: "bidder_id_filter", value: bidderFilters });
	userInput.push({ name: "uploaded_creatives", value: uploadedCreatives });
	const formDataBeforeValidation = userInput.concat(options);
	const userConfig = formValidator.validate(formDataBeforeValidation);

	if (!userConfig) {
		subBtnStatus("reset");
		return;
	}

	// Temp
	// console.log(userConfig);
	// return;
	
	// Check if server is running
	try {
		await serverManager.healthCheck(userConfig.portNumber);
	} catch (e) {
		notifyManager.error(SERVER_HEALTH_CHECK_FAILED);
		console.log(e);
		subBtnStatus("reset");
		return;
	}

	// Set global config
	SkipOffset = parseInt(userConfig.skipOffset);
	NumberOfShardingDomain = parseInt(userConfig.domainShard);

	chrome.storage.local.set({creatives: {}}, function() {
		switch(userConfig.fetchSource) {
			case "single_creative":
				moPubAPI.getCreative(userConfig.bidderId, userConfig.creativeId, function(creatives) {
					let filteredCreatives = creativeFilter(creatives, userConfig);
					if (filteredCreatives.length == 0) {
						subBtnStatus("reset");
						zeroCreative();
						return;
					}
					statManager.increase("total", 1);
					loadScreenShotAndRender(filteredCreatives, userConfig);
					saveCreatives(filteredCreatives);
				});
				break;

			case "mpx_tab":
				moPubAPI.getCreativesForMarketPlaceTab(userConfig.dateStr, function(creatives) {
					let filteredCreatives = creativeFilter(creatives, userConfig);
					if (filteredCreatives.length == 0) {
						subBtnStatus("reset");
						zeroCreative();
						return;
					}
					statManager.increase("total", filteredCreatives.length);
					loadScreenShotAndRender(filteredCreatives, userConfig);
					saveCreatives(filteredCreatives);
				});
				break;

			case "mpx_line_item":
				moPubAPI.getCreativesByLineItem(userConfig.dateStr, userConfig.marketPlaceLineItemKey, function(creatives) {
					let filteredCreatives = creativeFilter(creatives, userConfig);
					if (filteredCreatives.length == 0) {
						subBtnStatus("reset");
						zeroCreative();
						return;
					}
					statManager.increase("total", filteredCreatives.length);
					loadScreenShotAndRender(filteredCreatives, userConfig);
					saveCreatives(filteredCreatives);
				});
				break;

			case "file_upload":
				let bulkCreativeIds = csvManager.getUploadedCreatives();
				moPubAPI.getCreativesByBulkCreativeIds(bulkCreativeIds, function(creatives) {
					csvManager.reset();
					let filteredCreatives = creativeFilter(creatives, userConfig);
					if (filteredCreatives.length == 0) {
						subBtnStatus("reset");
						zeroCreative();
						return;
					}
					statManager.increase("total", filteredCreatives.length);
					loadScreenShotAndRender(filteredCreatives, userConfig);
					saveCreatives(filteredCreatives);
				});
				break;

			case "ad_unit":
				// to-do
				break;

			default:
					subBtnStatus("reset");
					zeroCreative();
					return;
				break;
		}
	});
});
