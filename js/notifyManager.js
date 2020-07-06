var notifyManager = (function(global) {
	"use strict";

	let notification = $(".ui.message.notification");
	let videoNotification = $(".ui.message.video-notification");

	function error(message) {
		notification.show();
		notification.addClass("error");
		notification.find(".header").html(message.header);
		notification.find(".content").html(message.description);
	}

	function info(message) {
		notification.show();
		notification.addClass("info");
		notification.find(".header").html(message.header);
		notification.find(".content").html(message.description);
	}

	function videoError(text) {
		videoNotification.show();
		videoNotification.addClass("error");
		videoNotification.find(".content").html(text);
	}

	function clear() {
		notification.hide();
		notification.find(".header").html("");
		notification.find(".content").html("");
	}

	function clearVideoError() {
		videoNotification.hide();
		videoNotification.find(".content").html("");
	}

  return {
		clear: clear,
		error: error,
		// success: success,
		info: info,
		// plain: plain
		videoError: videoError,
		clearVideoError: clearVideoError
  }
})(this);
