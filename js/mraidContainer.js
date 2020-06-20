var mraidContainer = (function(global) {
	"use strict";

	const mraid = `
		<!DOCTYPE html>
		<html>
			<head>
				<script src="${MRAID_CDN}"></script>
				<script>
					window.alert = console.log;
					document.addEventListener('DOMContentLoaded', function () {
						mraidbridge.fireChangeEvent({
							placementType: 'inline',
							supports: {
								sms: false,
								tel: false,
								calendar: false,
								storePicture: false,
								inlineVideo: true
							},
							state: 'default'
						});
						mraidbridge.fireChangeEvent({viewable: true});
						mraidbridge.setCurrentPosition(0.0, 0.0, 320, 50);
						mraidbridge.setDefaultPosition(0.0, 0.0, 320, 50);
						mraidbridge.setScreenSize(320.0, 480.0);
						mraidbridge.setMaxSize(320.0, 480.0);
						mraidbridge.notifySizeChangeEvent(320, 50);
						mraidbridge.fireReadyEvent();
					}, false );
				</script>
			</head>
			<body style="margin: 0; padding: 0;"></body>
		</html>`;

	const nativeAssetContainer = `
		<div class="native_ad" style="max-width: fit-content;">
			<div style="position: relative; width: 320px;">
				<img class="icon" style="width: 40px; border-radius: 25px;">
				<span class="title" style="top: 50%; position: absolute; transform: translateY(-50%); margin-left: 0.5em; font-weight: bold; word-break: break-all;"></span>
			</div>
			<div style="width: 320px;">
				<div class="text" style="text-align: center; margin-bottom: 0.3em; word-break: break-all;"></div>
			</div>
			<img class="main_image" style="width: 320px; border-radius: 3px;">
			<div style="text-align: center; margin-top: 0.2em;">
				<button>
					<span class="ctatext"></span>
				</button>
			</div>
		</div>`;

	function attach(html) {
		// unscape first, hmmmm
		// html = decodeHtml(html);
		
		let parser = new DOMParser();
		let htmlDoc = parser.parseFromString($.trim(mraid), 'text/html');
		htmlDoc.getElementsByTagName("body")[0].innerHTML += html;
		let markup = htmlDoc.documentElement.outerHTML;
		return $.trim(markup);
	}

	function attachNative(jsonMarkUp) {
		let parser = new DOMParser();
		let htmlDoc = parser.parseFromString($.trim(mraid), 'text/html');
		let htmlDocNative = parser.parseFromString(nativeAssetContainer, 'text/html');

		// Native asset mapping
		$(htmlDocNative).find(".icon").attr("src", jsonMarkUp.iconimage);
		$(htmlDocNative).find(".title").html(jsonMarkUp.title);
		$(htmlDocNative).find(".text").html(jsonMarkUp.text);
		$(htmlDocNative).find(".main_image").attr("src", jsonMarkUp.mainimage);
		$(htmlDocNative).find(".ctatext").html(jsonMarkUp.ctatext);
		htmlDoc.getElementsByTagName("body")[0].innerHTML += $(htmlDocNative).find(".native_ad").prop("outerHTML");

		let markup = htmlDoc.documentElement.outerHTML;
		return $.trim(markup);
	}
 
  return {
		attach: attach,
		attachNative: attachNative
  }
})(this);
