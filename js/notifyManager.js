var notifyManager = (function(global) {
	"use strict";

	let notification = $(".ui.message.notification");

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

	function clear() {
		notification.hide();
		notification.find(".header").html("");
		notification.find(".content").html("");
	}

  return {
		clear: clear,
		error: error,
		// success: success,
		info: info
		// plain: plain
  }
})(this);
