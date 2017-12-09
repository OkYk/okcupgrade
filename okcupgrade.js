var processed = processed || new Set();
var bodytype = bodytype || new Set(["thin", "fit", "average", "average_build", "&mdash;"]);
var nodiet = nodiet || new Set(["vegetarian", "vegan"]);
var filtered = filtered || new Set();

function filterit(match, url) {
	jQuery.get(url).done(function(data) {
		processed.add(url);
		var pparams = jQuery.parseJSON(data.match(/ProfilePromo\.params[^\n]+/)[0].match(/{.*}/)[0]);
		var profile = pparams.user.details.api_values;
		if (profile.gender_tags.length != 0 
			|| profile.ethnicity.indexOf("black") != -1 
			|| profile.orientation != "straight" 
			|| (profile.bodytype && !bodytype.has(profile.bodytype)) 
			|| (profile.diet && nodiet.has(profile.diet))) {
			match.hidden = true;
			console.log("Filtered:" + url, profile);
			filtered.add(url);
		} else {
			console.log(profile);
		}
	});
}
var filternonfit = function() {
	var mills = 0;
	jQuery('.match_card_wrapper.user-not-hidden.matchcard-user').each(function() {
		var url = jQuery(jQuery(this).find('.image_link')[0]).attr('href');
		if (filtered.has(url)) {
			this.hidden = true;
		} else if (!processed.has(url)) {
			setTimeout(filterit(this, url), mills);
			mills += 300;
		} else {
			console.log("Skipping");
		}

	});
};
setInterval(filternonfit, 8000);
