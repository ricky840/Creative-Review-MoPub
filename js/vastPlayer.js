var vastPlayer = (function(global) {
	"use strict";

	let videoElement;
	let adContainer;
	let adDisplayContainer;
	let adsManager;

	let playButton;
	let pauseButton;
	let stopButton;
	let muteButton;

	let adMarkup;
	
	// For status
	let isPaused = false;
	let isMuted = false;
	let statusMsg;

	function requestAd() {
		console.log("initializing IMA");
		adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoElement);
		let adsLoader = new google.ima.AdsLoader(adDisplayContainer);

		// Ad loader event
		adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, onAdsManagerLoaded, false);
		adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

		// Let the AdsLoader know when the video has ended - to show the end card?
		videoElement.addEventListener('ended', function() {
			adsLoader.contentComplete();
		});

		// Construct ad request
		let adsRequest = new google.ima.AdsRequest();
		adsRequest.vastLoadTimeout = 20000 // load timeout
		adsRequest.linearAdSlotWidth = videoElement.clientWidth;
		adsRequest.linearAdSlotHeight = videoElement.clientHeight;
		adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth;
		adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3;
		adsRequest.adsResponse = adMarkup;
		adsLoader.requestAds(adsRequest);
	}

	function onAdsManagerLoaded(adsManagerLoadedEvent) {
		let adsRenderingSettings = new google.ima.AdsRenderingSettings();
		adsRenderingSettings.loadVideoTimeout = 20000; // default is 8 seconds

		adsManager = adsManagerLoadedEvent.getAdsManager(videoElement, adsRenderingSettings);
		adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
		adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, onAdStarted);
		adsManager.addEventListener(google.ima.AdEvent.Type.PAUSED, onAdPaused);
		showAds();

		$(statusMsg).html("Loaded, showing ad..");
	}

	function showAds(event) {
		console.log("Showing video ad");

		videoElement.load();
		adDisplayContainer.initialize();
		let width = videoElement.clientWidth;
		let height = videoElement.clientHeight;

		try {
			adsManager.init(width, height, google.ima.ViewMode.NORMAL);
			// Reflect mute status before play
			if (isMuted) adsManager.setVolume(0);
			adsManager.start();
		} catch (adError) {
			// Play the video without ads, if an error occurs
			// [To-do] Show notification
			console.log("AdsManager could not be started");
			console.log(adError);
		}
	}
	
	// On ad events
	function onAdError(adErrorEvent) {
		// Handle the error logging.
		console.log(adErrorEvent.getError());
		if(adsManager) {
			adsManager.destroy();
		}
	}

	function onAdStarted(AdEvent) {
		console.log("Video ad started to play");
		console.log(AdEvent.getAd().getMediaUrl());

		$(statusMsg).html("");
		$(".vast-player-btns .ui.button").removeClass("disabled");
	}

	function onAdPaused(AdEvent) {
		console.log("Video ad paused");
		isPaused = true;
	}

	function play(xml) {
		adMarkup = xml;
		$(playButton).trigger("click");
	}

	function pause() {
		if (adsManager) adsManager.pause();
	}

	function resume() {
		if (adsManager) adsManager.resume();
	}

	function stop() {
		if (adsManager) {
			adsManager.stop();
			adsManager.destroy();
		}
		isPaused = false;
	}

	function mute() {
		if (adsManager) {
			adsManager.setVolume(0);
			isMuted = true;
		}
	}

	function unmute() {
		if (adsManager) {
			adsManager.setVolume(1);
			isMuted = false;
		}
	}

	function init() {
		playButton = $(".ui.modal.video .play.button")[0];
		pauseButton = $(".ui.modal.video .pause.button")[0];
		stopButton = $(".ui.modal.video .stop.button")[0];
		muteButton = $(".ui.modal.video .mute.button")[0];
		videoElement= $("#vast-video-element")[0];
		adContainer = $("#vast-ad-container")[0];
		statusMsg = $(".modal-video-load-msg")[0];

		$(playButton).click(function(event) {
			if (isPaused) {
				resume();
				return;
			} 
			// Stop existing play and make new request
			if (adsManager) stop();
			requestAd();

			$(statusMsg).html("Loading..");
			$(".vast-player-btns .ui.button").addClass("disabled");
		});

		$(pauseButton).click(function(event) {
			pause();
		});

		$(stopButton).click(function(event) {
			stop();
		});

		$(muteButton).click(function(event) {
			if (adsManager.getVolume() == 0) {
				unmute();
				$(muteButton).find(".volume").removeClass("off").addClass("up");
			} else {
				mute();
				$(muteButton).find(".volume").removeClass("up").addClass("off");
			}
		});
	}

  return {
		init: init,
		play: play,
		pause: pause,
		stop: stop
  }
})(this);



