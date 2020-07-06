$(document).ready(function() { 

	// Update Version Info
	document.title += ` v${chrome.runtime.getManifest().version}`;

	// Loader
	$(".ui.init-loader").addClass("active");

	// Init
	initialize().then(function(result) {
		$(".ui.init-loader").removeClass("active");
		$(".ad-submit").removeClass("disabled");
		console.log("Init success");
	}).catch(function(error) {
		$(".ui.init-loader").removeClass("active");
		console.log("Init failed");
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
	let button = $("#ad-load-btn");
	switch(status) {
		case "loading":
			if (button.hasClass("disabled")) return;
			button.html("Loading..").addClass("disabled");
			break;
		case "reset":
			button.html("Load").removeClass("disabled");
			break;
		case "in-progress":
			if (button.hasClass("disabled")) return;
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

function initialize() {
	return new Promise(async function(resolve, reject) {

		// Update Account Info
		accountManager.updateHtmlEmail();

		// Load bidder list first
		try {
			await bidderManager.fetchBidderList();
		} catch(e) {
			console.log(e);
			notifyManager.error(ERROR_CANNOT_LOAD_BIDDER_LIST);
			reject(false);
		}

		// Init bidder list dropdown
		$(".ui.dropdown.bidder-list").dropdown({
			placeholder: "Search Bidder(DSP) name or ID..",
			values: bidderManager.getBidderListForDropDown(),
			sortSelect: true,
			fullTextSearch: "exact"
		});

		// Init Tab menu
		$('.tab-menu .item').tab();

		// Init calendar
		$('.ui.calendar').calendar({ type: 'date' });

		// Init vast player
		vastPlayer.init();
		
		// Init modals
		$('.ui.modal.non-video').modal();
		$('.ui.modal.video').modal();

		// Init Progress Bar
		$('.ui.progress').progress({
			showActivity: false,
			autoSuccess: false,
			onChange: function(percent, value, total) {
				if (value > 0 && value != total) {
					$(this).progress("set label", "Working {value} / {total}");
				} else if (value == 0) {
					$(this).progress("set label", " ");
				}
			},
			onSuccess: function(total) {
				$(this).progress("set label", "Completed");
				subBtnStatus("reset");
				$(".download-all-btn").removeClass("disabled");
			},
			onActive: function(value, total) {
				if (value == 0 || Number.isNaN(value)) {
					$(this).progress("set label", `Waiting for the first batch..☕`);
				}
			}
		});

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

		// Dropdowns Inits
		chrome.storage.local.get("settings", result => {
			const savedSettings = result["settings"];
			for (let i=0; i < savedSettings.length; i++) {
				switch (savedSettings[i].name) {
					case "img_quality":
						$(".img-quality-dropdown").dropdown('set selected', savedSettings[i].value);
						$(".img-quality-dropdown").dropdown('save defaults');
						break;
					case "render_delay":
						$(".render-delay-dropdown").dropdown('set selected', savedSettings[i].value);
						$(".render-delay-dropdown").dropdown('save defaults');
						break;
					case "skip_offset":
						$(".skip-offset-dropdown").dropdown('set selected', savedSettings[i].value);
						$(".skip-offset-dropdown").dropdown('save defaults');
						SkipOffset = parseInt(savedSettings[i].value);
						break;
					case "server_mode":
						$(".server-mode-dropdown").dropdown('set selected', savedSettings[i].value);
						$(".server-mode-dropdown").dropdown('save defaults');
						break;
					case "port_num":
						$(".port-number").val(savedSettings[i].value);
						break;
					case "domain_sharding":
						$(".domain-sharding-dropdown").dropdown('set selected', savedSettings[i].value);
						$(".domain-sharding-dropdown").dropdown('save defaults');
						NumberOfShardingDomain = parseInt(savedSettings[i].value);
						break;
				}
			}
		});

		// Format dropdown
		$(".creative-format-dropdown").dropdown('set selected', "all");
		$(".creative-format-dropdown").dropdown('save defaults');

		resolve(true);
	});
}
