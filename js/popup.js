$(document).ready(function() { 

	// Close button notification
	$('.message .close').on('click', function() {
    $(this).closest('.message').hide();
  });

	// Progress Bar
	$('.ui.progress').progress({
		showActivity: false,
		text: {
      active: 'Processing {value} of {total}',
      success: 'Done'
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

	// Init vast player
	vastPlayer.init();

	// Init modals
	$('.ui.modal.non-video').modal();
	$('.ui.modal.video').modal();

	$(".ui.cards").on("click", ".ad-card", function() {
		chrome.storage.local.get("creatives", result => {
			const savedCreatives = result["creatives"];
			const clickedCreativeId = $(this).find(".card-ad-creative-id").html();
			const clickedCreativeImg = $(this).find(".ad-image > img");
			const creative = savedCreatives[clickedCreativeId];

			if (creative.type != "vast" && creative.type != "vast_tag") {
				$(".non-video .modal-crt-type").html((creative.type).toUpperCase());
				$(".non-video .modal-crt-img").attr("src", clickedCreativeImg.attr("src"));
				$(".non-video .modal-crt-bidder-id").html(creative.bidderId);
				$(".non-video .modal-crt-id").html(creative.creativeId);
				$(".non-video .modal-crt-adomain").html(creative.adomain);
				$(".non-video .modal-crt-blocked").html((creative.blocked) ? "Blocked" : "Allowed");
				$(".non-video .modal-crt-imp").html(creative.impression);
				$(".non-video .modal-crt-click").html(creative.click);
				$(".non-video .modal-crt-rev").html(creative.revenue);
				$(".non-video .modal-crt-size").html(`${creative.width}x${creative.height}`);
				$(".non-video .modal-crt-markup").val(creative.markup);
				$('.ui.modal.non-video').modal({
					duration: 0
				}).modal("show");
			} else {
				$(".video-modal-crt-type").html((creative.type).toUpperCase());
				$(".video-modal-crt-img").attr("src", clickedCreativeImg.attr("src"));
				$(".video-modal-crt-bidder-id").html(creative.bidderId);
				$(".video-modal-crt-id").html(creative.creativeId);
				$(".video-modal-crt-adomain").html(creative.adomain);
				$(".video-modal-crt-blocked").html((creative.blocked) ? "Blocked" : "Allowed");
				$(".video-modal-crt-imp").html(creative.impression);
				$(".video-modal-crt-click").html(creative.click);
				$(".video-modal-crt-rev").html(creative.revenue);
				$(".video-modal-crt-size").html(`${creative.width}x${creative.height}`);
				$(".video-modal-crt-markup").val(creative.markup);
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

	// Submit
	$(".ad-submit").click(function() {
		let subBtn = $(this);
		subBtn.html("Loading..").addClass("disabled");
		resetScreen();

		let selectedDate = new Date($('.ui.calendar').calendar('get date'));
		let dateStr = (isNaN(selectedDate.getTime())) ? "" : selectedDate.toISOString().split('T')[0];
		let creativeFormats = $('.creative-format-dropdown').dropdown('get value');
		creativeFormats = (creativeFormats.length == 0) ? ["all"] : creativeFormats;
		let userInput = $(".ad-form").serializeArray();
		let options = $(".ad-form-options").serializeArray();
		userInput.push({ name: "date_str", value: dateStr	});
		userInput.push({ name: "formats", value: creativeFormats });
		const formDataBeforeValidation = userInput.concat(options);
		const userConfig = formValidator.validate(formDataBeforeValidation);

		if (!userConfig) {
			subBtn.html("Load").removeClass("disabled");
			return;
		}

		// Set global config
	  SkipOffset = parseInt(userConfig.skipOffset);
		NumberOfShardingDomain = parseInt(userConfig.domainShard);

		chrome.storage.local.set({creatives: {}}, function() {
			switch(userConfig.fetchSource) {
				case "single_creative":
					moPubAPI.getCreative(userConfig.bidderId, userConfig.creativeId, function(creative) {
						subBtn.html("Load").removeClass("disabled");
						statManager.increase("total", 1);
						loadScreenShotAndRender([creative], userConfig);
						saveCreatives([creative]);
					});
					break;
				case "mpx_tab":
					moPubAPI.getCreativesForMarketPlaceTab(userConfig.dateStr, function(creatives) {
						subBtn.html("Load").removeClass("disabled");

						if (creatives.length == 0) {
							notifyManager.error({
								header: "No Creatives",
								description: "MoPub UI did not return any creatives"
							});			
							return;
						} 

						statManager.increase("total", creatives.length);
						loadScreenShotAndRender(creatives, userConfig);
						saveCreatives(creatives);
					});
					break;
				case "mpx_line_item":
					moPubAPI.getCreativesByLineItem(userConfig.dateStr, userConfig.marketPlaceLineItemKey, function(creatives) {

						if (creatives.length == 0) {
							notifyManager.error({
								header: "No Creatives",
								description: "MoPub UI did not return any creatives"
							});			
							return;
						} 

						statManager.increase("total", creatives.length);
						loadScreenShotAndRender(creatives, userConfig);
						saveCreatives(creatives);

					});
					break;
				case "ad_unit":
					break;
				case "file_upload":
					break;
				default:
					break;
			}
		});

	});

});


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
}


