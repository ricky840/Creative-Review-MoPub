var htmlFactory = (function(global) {
	"use strict";

	const cardHtml = `
	<div class="ui link card ad-card">
		<div class="content image">
			<span class="ad-image"></span>
		</div>
		<div class="content text">
			<h4 class="ui sub header"><span class="card-ad-adomain"></span></h4>
			<div class="description">
				<div class="card-ad-bidder-id"></div>
				<div class="card-ad-creative-id"></div>
			</div>
		</div>
		<div class="content stats">
			<div class="ui grid">
				<div class="row">
					<div class="five wide column stat-imp" style="padding: 0px;"><i class="eye icon"></i><span class="card-ad-imp"></span></div>
					<div class="four wide column" style="padding: 0px;"><i class="mouse pointer icon"></i><span class="card-ad-click"></span></div>
					<div class="six wide column" style="padding: 0px;"><i class="icon dollar sign"></i><span class="card-ad-rev"></span></div>
				</div>
			</div>
		</div>
		<div class="extra content">
			<span class="card-ad-size"></span>
			<a class="card-ad-see-markup-btn right floated">See Markup</a>
		</div>
	</div>`;

	const failCardHtml = `
	<div class="ui link card ad-card">
		<div class="content image">
			<span class="ad-image"></span>
		</div>
		<div class="content text">
			<h4 class="ui sub header"><span class="card-ad-adomain"></span></h4>
			<div class="description">
				<div class="card-ad-bidder-id"></div>
				<div class="card-ad-creative-id"></div>
			</div>
		</div>
		<div class="content stats">
			<div class="ui grid">
				<div class="three column row">
					<div class="column"><i class="eye icon"></i><span class="card-ad-imp"></span></div>
					<div class="column"><i class="mouse pointer icon"></i><span class="card-ad-click"></span></div>
					<div class="column"><i class="icon dollar sign"></i><span class="card-ad-rev"></span></div>
				</div>
			</div>
		</div>
		<div class="extra content">
			<span class="card-ad-size"></span>
			<a class="card-ad-see-markup-btn right floated">See Markup</a>
		</div>
	</div>`;


	function getCardHtml() {
		return $.trim(cardHtml);
	}

	function getFailCardHtml() {
		return $.trim(failCardHtml);
	}

  return {
		getCardHtml: getCardHtml,
		getFailCardHtml: getFailCardHtml
  }
})(this);
