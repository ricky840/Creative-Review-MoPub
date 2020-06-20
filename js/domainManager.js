var domainManager = (function(global) {
	"use strict";

	let index = 0;

	function getDomain() {
	  const domain = SHARDING_DOMAINS[index];
		index++;
		if (index >= NumberOfShardingDomain) {
			index = 0;
		}
		return domain;
	}
 
  return {
		getDomain: getDomain
  }
})(this);
