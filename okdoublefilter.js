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

const writeIn="span.stacks-title-content";
const searchIn="div.qmessays";
const mbsi = new Array("istj","isfj","infj","intj","istp","isfp","infp","intp","estp","esfp","enfp","entp","estj","esfj","enfj","entj");
const cardMatcher=".matchprofile-details-text";
const rejectSelector="button.pill-button.pass-pill-button.doubletake-pass-button";
const mustHave = new Array('straight', 'woman', 'single');
const block = new Array("non-monogamous", "smokes cigarettes", "pescatarian", "has kid(s)", "indian", "black", "overweight", "full figured", "a little extra", "curvy", "queer", "trans", "transfeminine", "transgender", "transsexual", "nonconforming", "genderqueer", "pansexual", "demisexual", "questioning", "asexual", "heteroflexible", "gay", "lesbian", "bisexual", "homoflexible", "vegetarian", "vegan");

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
    var writeInBlock = jQuery(writeIn);
    var searchInText = jQuery(searchIn);
    if (searchInText.length>0 && writeInBlock.length>0){
        searchInText = searchInText[0].innerHTML.toLowerCase();
        var setText = "MBSI not found";
        mbsi.forEach(function(element){if(searchInText.includes(element)){setText=element.toUpperCase();}});
        writeInBlock[0].innerHTML=setText;
    }
};
setInterval(filternonfit, 300);
})();
