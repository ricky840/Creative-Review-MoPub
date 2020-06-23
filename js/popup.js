$(document).ready(function() { 

	// Close button notification
	$('.message .close').on('click', function() {
    $(this).closest('.message').hide();
  });

	// Account Info
	accountManager.updateHtmlEmail();

	// Version
	document.title += ` v${chrome.runtime.getManifest().version}`;

	// Progress Bar
	$('.ui.progress').progress({
		showActivity: false,
		onChange: function(percent, value, total) {
			if (value > 0) {
				$(this).progress("set label", "Processed {value} / {total}");
				subBtnStatus("in-progress");
			} else if (value == 0) {
				$(this).progress("set label", " ");
				subBtnStatus("reset");
			} else if (value == total) {
				$(this).progress("set label", " ");
				subBtnStatus("reset");
			}
		},
		onSuccess: function(total) {
			$(this).progress("set label", "Completed");
			subBtnStatus("reset");
		},
		onActive: function(value, total) {
			if (value == 0 || Number.isNaN(value)) {
				$(this).progress("set label", `Waiting for the first batch..`);
				subBtnStatus("in-progress");
			}
		}
	});

	// Tab menu
	$('.tab-menu .item').tab();

	// Init calendar
	$('.ui.calendar').calendar({ type: 'date' });

	// Init fetch source dropdown
	$('.fetch-source-dropdown.dropdown').dropdown({
		onChange: function(value, text, selected) {
			$(this).removeClass("error");
			$(".fetch-source").hide();
			switch(value) {
				case "mpx_line_item":
					$(".field-mpx-line-item").show();
					$(".fetch-calendar-field").show();
					break;
				case "ad_unit":
					$(".field-ad-unit").show();
					$(".fetch-calendar-field").show();
					break;
				case "file_upload":
					$(".field-upload-file").show();
					break;
				case "single_creative":
					$(".crt-bid-id-field").show();	
					break;
				case "mpx_tab":
					$(".fetch-calendar-field").show();
					break;
			}
    }
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
		});
	});

	// Init vast player
	vastPlayer.init();

	// Init modals
	$('.ui.modal.non-video').modal();
	$('.ui.modal.video').modal();

	// When click a card
	$(".ui.cards").on("click", ".ad-card", function(event) {
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
		let url = `https://app.mopub.com/staff/creative-preview?creativeId=${thisCreativeid}-----${thisBidderId}`;
		window.open(url, '_blank');
	});

	// Dropdowns Inits
	$(".img-quality-dropdown").dropdown('set selected', "20");
	$(".img-quality-dropdown").dropdown('save defaults');
	$(".render-delay-dropdown").dropdown('set selected', "5000");
	$(".render-delay-dropdown").dropdown('save defaults');
	$(".server-mode-dropdown").dropdown('set selected', "localhost");
	$(".server-mode-dropdown").dropdown('save defaults');
	$(".creative-format-dropdown").dropdown('set selected', "all");
	$(".creative-format-dropdown").dropdown('save defaults');
	$(".skip-offset-dropdown").dropdown('set selected', "50");
	$(".skip-offset-dropdown").dropdown('save defaults');
	$(".domain-sharding-dropdown").dropdown('set selected', "3");
	$(".domain-sharding-dropdown").dropdown('save defaults');

	// Submit button click
	$(".ad-submit").click(function() {
		subBtnStatus("loading");
		resetScreen();

		// Get date
		let selectedDate = new Date($('.ui.calendar').calendar('get date'));
		let dateStr = (isNaN(selectedDate.getTime())) ? "" : selectedDate.toISOString().split('T')[0];
		// Get creative formats
		let creativeFormats = $('.creative-format-dropdown').dropdown('get value');
		creativeFormats = (creativeFormats.length == 0) ? ["all"] : creativeFormats;
		// Get uploaded file creatives
		let uploadedCreatives = csvManager.getUploadedCreatives();

		let userInput = $(".ad-form").serializeArray();
		let options = $(".ad-form-options").serializeArray();
		userInput.push({ name: "date_str", value: dateStr	});
		userInput.push({ name: "formats", value: creativeFormats });
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

		// Set global config
	  SkipOffset = parseInt(userConfig.skipOffset);
		NumberOfShardingDomain = parseInt(userConfig.domainShard);

		chrome.storage.local.set({creatives: {}}, function() {
			switch(userConfig.fetchSource) {
				case "single_creative":
					moPubAPI.getCreative(userConfig.bidderId, userConfig.creativeId, function(creative) {
						let filteredCreatives = creativeFormatFilter([creative], userConfig.creativeFormats);
						if (filteredCreatives.length == 0) {
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
						let filteredCreatives = creativeFormatFilter(creatives, userConfig.creativeFormats);
						if (filteredCreatives.length == 0) {
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
						let filteredCreatives = creativeFormatFilter(creatives, userConfig.creativeFormats);
						if (filteredCreatives.length == 0) {
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
						let filteredCreatives = creativeFormatFilter(creatives, userConfig.creativeFormats);
						if (filteredCreatives.length == 0) {
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
});

function creativeFormatFilter(creatives, filterList) {
	if (filterList[0] == "all") return creatives;

	// Add vast_tag if VAST is selected
	if (filterList.includes("vast")) filterList.push("vast_tag");

	let filteredCreativeList = [];
	for (let i=0; i < creatives.length; i++) {
		let type = creatives[i].getType();
		if (filterList.includes(type)) filteredCreativeList.push(creatives[i]);
	}
	return filteredCreativeList;
}

function loadScreenShotAndRender(creatives, userConfig) {

	for (let i=0; i < creatives.length; i++) {

		if (creatives[i].getDidMarkUpLoaded() != "loaded") {
			console.log("Creative failed to get markup from MoPub");
			let cardHtml = cardRender.createCardWithElement(creatives[i], "fail");
			cardRender.attachCard("fail", cardHtml);
			statManager.increase("fail", 1);
			continue;
		}

		const requestUrl = serverManager.createServerUrl(creatives[i], userConfig);	

		// Load ScreenShot
		creatives[i].loadScreenShot(requestUrl).then(result => {
			let cardHtml = cardRender.createCardWithElement(creatives[i], "success");
			cardRender.attachCard(creatives[i].getType(), cardHtml);
			statManager.increase("success", 1);
			statManager.increase(creatives[i].getType(), 1);
		}).catch(error => {
			console.log("ScreenShot load failed");
			let cardHtml = cardRender.createCardWithElement(creatives[i], "fail");
			cardRender.attachCard("fail", cardHtml);
			statManager.increase("fail", 1);
		});

	}
}

function saveCreatives(creatives) {
	let creativeObjects = {}; 
	for (let i=0; i < creatives.length; i++) {
		creativeObjects[creatives[i].getCreativeId()] = creatives[i].export();
	}
	chrome.storage.local.set({creatives: creativeObjects}, function() {
		console.log("Creatives saved");
	});
}

function resetScreen() {
	cardRender.removeAllCards();
	statManager.reset();
	notifyManager.clear();
	$('input[type="file"]').val("");
}

function zeroCreative() {
	resetScreen();
	notifyManager.error(ERROR_NO_CREATIVE);			
}

function subBtnStatus(status) {
	const button = $(".ui.button.ad-submit");
	switch(status) {
		case "loading":
			button.html("Loading..").addClass("disabled");
			break;
		case "reset":
			button.html("Load").removeClass("disabled");
			break;
		case "in-progress":
			button.html("Processing..").addClass("disabled");
			break;
		default:
			button.html("Load").removeClass("disabled");
			break;
	}
}

function downloadCreative(creative) {
	let hiddenElement = document.createElement('a');

	if ((creative.type).includes("vast")) {
		hiddenElement.href = 'data:text/xml;charset=utf-8,' + encodeURIComponent(creative.markup);
		hiddenElement.target = '_blank';
		hiddenElement.download = `${creative.creativeId}-${creative.bidderId}.xml`;
		hiddenElement.click();
	} else if ((creative.type).includes("native")) {
		hiddenElement.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(creative.markUpWithContainer);
		hiddenElement.target = '_blank';
		hiddenElement.download = `${creative.creativeId}-${creative.bidderId}.html`;
		hiddenElement.click();
	}	else {
		hiddenElement.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(creative.markUpWithContainer);
		hiddenElement.target = '_blank';
		hiddenElement.download = `${creative.creativeId}-${creative.bidderId}.html`;
		hiddenElement.click();
	}
}
