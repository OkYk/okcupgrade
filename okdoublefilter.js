// ==UserScript==
// @name         OkDoubleFilter
// @namespace
// @version      0.1
// @description  take over someones world
// @author       https://github.com/okyk
// @match        https://www.okcupid.com/doubletake
//       https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
'use strict';

const cardMatcher=".matchprofile-details-text";
const rejectSelector=".cardactions-action--reject";
const mustHave = new Array('straight', 'woman', 'single');
const block = new Array("black", "overweight", "full figured", "a little extra", "curvy", "queer", "trans", "transfeminine", "transgender", "transsexual", "nonconforming", "genderqueer", "pansexual", "demisexual", "questioning", "asexual", "heteroflexible", "gay", "lesbian", "bisexual", "homoflexible", "vegetarian", "vegan");

var rejectButton=null;
var url=null;

var filternonfit = function() {
    var plaintext="";
    var blockreason="";
    jQuery(cardMatcher).each(function(element) {
        plaintext+=this.innerText.toLowerCase();
    });
    block.forEach(function(element){blockreason+=plaintext.includes(element)?"+"+element:"";});
	mustHave.forEach(function(element){blockreason+=!plaintext.includes(element)?"-"+element+",":"";});

    if(blockreason!=""){
        var url=jQuery(".cardsummary-profile-link > a");
        if(url.length>0 && url[0].attributes.length>0){
            url=this.origin+url[0].attributes[0].value;
        }
        console.log("Filtered: ["+blockreason+"] "+url);
        jQuery(rejectSelector)[0].click();
    }
};
setInterval(filternonfit, 300);
})();
