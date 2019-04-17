// ==UserScript==
// @name         OkFilterIt
// @namespace
// @version      0.1
// @description  take over the world
// @author       https://github.com/okyk
// @match        https://www.okcupid.com/match
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
var processed = processed || new Set();
var filtered = filtered || new Set();
var pending = pending || new Set();

const mustHave = new Array('straight', 'woman', 'single');
const block = new Array("overweight", "full figured", "a little extra", "curvy", "queer", "trans", "transfeminine", "transgender", "transsexual", "nonconforming", "genderqueer", "pansexual", "demisexual", "questioning", "asexual", "heteroflexible", "gay", "lesbian", "bisexual", "homoflexible", "vegetarian", "vegan");

const cardMatcher=".match-results-card";
const cardProfileURL='.match-results-card';
const profileFilterMatcher='.matchprofile-details-text';

function filterit(match, url) {
    if(url==null){
        return;
    }
	jQuery.get(url).done(function(data) {
		processed.add(url);
        pending.delete(url);
		var plaintext = '';
        var html=data.match(/var profileParams = [^\n]+/);
        if(html==null){
            console.log("UNR: "+url);
            debugger;
            return;
        }
		jQuery.parseJSON(data.match(/var profileParams = [^\n]+/)[0].match(/{.*}/)[0]).profile.details.forEach(function(element){plaintext+=' '+element.text.text.toLowerCase()});
		block.forEach(function(element){
			if (!match.hidden && plaintext.includes(element)){
			match.hidden = true;
            match.remove();
			console.log("Filtered ["+element+"]" + url+":>>"+plaintext);
			filtered.add(url);
			}
		});
		mustHave.forEach(function(element){
			if (!match.hidden && !plaintext.includes(element)){
			match.hidden = true;
            match.remove();
			console.log("Filtered:" + url+":>>"+plaintext);
			filtered.add(url);
			}
		});
	});
}

var filternonfit = function() {
	var mills = 0;
	jQuery(cardMatcher).each(function() {
	var url = 'notfound';
	if(cardMatcher!=cardProfileURL){
		url = jQuery(jQuery(this).find(cardProfileURL)[0]).href;
	} else {
		url = this.href;
	}
		if (filtered.has(url)) {
			this.hidden = true;
		} else if (!processed.has(url) && !pending.has(url)) {
            pending.add(url);
			setTimeout(filterit(this, url), mills);
			mills += 500;
		} else {
//			console.log("Skipping");
		}

	});
};
setInterval(filternonfit, 300);
})();
