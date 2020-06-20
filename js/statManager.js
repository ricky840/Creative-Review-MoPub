var statManager = (function(global) {
	"use strict";

	let totalNumberOfCreatives = 0;
	let successNumberOfCreatives = 0;
	let failNumberOfCreatives = 0;
	let vastXmlCreatives = 0;
	let vastTagCreatives = 0;
	let nativeCreatives = 0;
	let bannerCreatives = 0;
	let htmlCreatives = 0;

	function increase(type, number) {

		switch(type) {
			case "total":
				totalNumberOfCreatives += number;
				$("#number_of_creatives_stat").html(totalNumberOfCreatives);
				$(".ui.progress").progress("set total", totalNumberOfCreatives);
				$(".ui.progress").progress("set active");
				break;
			case "success":
				successNumberOfCreatives += number;
				$("#number_of_crt_loaded_stat").html(successNumberOfCreatives);
				$(".ui.progress").progress('increment', number);
				break;
			case "fail":
				failNumberOfCreatives += number;
				$("#number_of_crt_failed").html(failNumberOfCreatives);
				$("#number_of_crt_failed_stat").html(failNumberOfCreatives);
				$(".ui.progress").progress('increment', number);
				break;
			case "vast":
				vastXmlCreatives += number;
				$("#number_of_crt_vast").html(vastXmlCreatives + vastTagCreatives);
				break;
			case "vast_tag":
				vastTagCreatives += number;
				$("#number_of_crt_vast").html(vastTagCreatives + vastXmlCreatives);
				break;
			case "native":
				nativeCreatives += number;
				$("#number_of_crt_native").html(nativeCreatives);
				break;
			case "banner":
				bannerCreatives += number;
				$("#number_of_crt_banner").html(bannerCreatives);
				break;
			case "html":
				htmlCreatives += number;
				$("#number_of_crt_html").html(htmlCreatives);
				break;
		}
	}

	function reset() {
		totalNumberOfCreatives = 0;
		successNumberOfCreatives = 0;
		failNumberOfCreatives = 0;
	  vastXmlCreatives = 0;
	  vastTagCreatives = 0;
	  nativeCreatives = 0;
	  bannerCreatives = 0;
	  htmlCreatives = 0;

		$("#number_of_crt_banner").html("");
		$("#number_of_crt_html").html("");
		$("#number_of_crt_native").html("");
		$("#number_of_crt_vast").html("");
		$("#number_of_creatives_stat").html("0");
		$("#number_of_crt_loaded_stat").html("0");
		$("#number_of_crt_failed_stat").html("0");

		$(".ui.progress").progress("reset");
		$(".ui.progress").progress("remove active");
		$(".ui.progress").progress("remove success");
		$('.ui.progress').progress({
			showActivity: false,
			text: {
				active: 'Processing {value} of {total}',
				success: 'Done'
			}
		});
	}
 
  return {
		reset: reset,
		increase: increase
  }
})(this);
