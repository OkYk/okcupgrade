var processed = processed || new Set();
var weightlimit = weightlimit || new Set(["thin", "fit", "average", "average_build", "&mdash;"]);
var nodiet = nodiet || new Set(["vegetarian", "vegan"]);

function filterit(match, url) {
	jQuery.get(url).done(function(data) {
		processed.add(url);
		var pparams = jQuery.parseJSON(data.match(/ProfilePromo\.params[^\n]+/)[0].match(/{.*}/)[0]);
		var profile = pparams.user.details.api_values;
		var id = pparams.tuid;
		if (profile.gender_tags.length != 0 
			|| profile.ethnicity.indexOf("black") != -1 
			|| profile.orientation != "straight" 
			|| (profile.bodytype && !weightlimit.has(profile.bodytype)) 
			|| (profile.diet && nodiet.has(profile.diet))) {
			match.hidden = true;
			console.log("Filtered:", profile);
		} else {
			console.log(profile);
		}
	});
}
var filternonfit = function() {
	var mills = 0;
	jQuery('.match_card_wrapper.user-not-hidden.matchcard-user').each(function() {
		var url = jQuery(jQuery(this).find('.image_link')[0]).attr('href');
		if (!processed.has(url)) {
			setInterval(filterit(this, url), mills);
			mills += 300;
		} else {
			console.log("Skipping");
		}

	});
};
setInterval(filternonfit, 8000);
