// ==UserScript==
// @name         OkDoubleFilter
// @namespace
// @version      0.5
// @description  take over someones world
// @author       https://github.com/okyk
// @match        https://www.okcupid.com/doubletake
// @match        https://www.okcupid.com/home
// @match        https://www.okcupid.com/discover
// @require      http://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @require      https://gist.githubusercontent.com/OkYk/3004d92fd072855b5a5f34e10636837a/raw/12a7586a969039558557ea20d56a3e7848e9124d/GM_XHR.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      api.opencagedata.com
// ==/UserScript==

(function() {
'use strict';

const locationSelector="span.cardsummary-location";
const ageSelector="span.cardsummary-age";
const nameSelector="span.cardsummary-item.cardsummary-realname";
const writeIn="div.qmcard-blurb";
const searchIn="div.qmessays";
const cardMatcher=".matchprofile-details-text";
const rejectSelector="button.pill-button.pass-pill-button.doubletake-pass-button";
//const mustHave = new Array('woman', 'single');
const keepSelector = "div.qm-inner-left";
const keep = new Array("they wrote you an intro", "enfp", "entp", "intj");
const block = new Array("punjabi", "non-monogamous", "smokes cigarettes", "pescatarian", "has kid(s)", "indian", "hindi", "hindu", "black", "overweight", "full figured", "a little extra", "queer", "trans", "transfeminine", "transgender", "transsexual", "nonconforming", "genderqueer", "pansexual", "questioning", "asexual", "heteroflexible", "gay", "lesbian", "homoflexible", "vegetarian", "vegan");
const blockFullText = new Array("lockdownhump", "quickiemeet", "lockdown hump", "bang meets", "bangmeets", "kinkyfanny", "kinky fanny", "shag");
const heightMtch = /[\d]{2,}cm/;

const okcLocationCache = "OKC_LOCATION_CACHE"
const distanceEnabled = true;
const userLoc = new Array(43.642630, -79.386441); // your location (or close by, for my paranoid friends)
const distMax = 20; // in KM, no freedom units here.
const urlBase="https://api.opencagedata.com/geocode/v1/json?q=";
const url2="&key=641c51bed8ab490184632ad8526e29ad&no_annotations=1&language=en";

const heightMin = 150;
const heightMax = 178;

const ageMin = 20;
const ageMax = 35;

const highlight = ["location","god","currently in","trans","lady boy","church","jesus","faith","important"];

const mbsiSelf = "INTJ"; // ye, you guessed it.
const colorPalete = ["teal","green","lightgreen","lightyellow","lightred"]; // you can change it to what you want ["ideal", "good chance", "have chance", "with luck", "good luck"]
const levelKeep = 0; // <= match level to keep. -1 to disable
const cycle= 300; // run it every "cycle" ms
const locationCategory = "place";
var reqInProgress = false;

const mbsi = new Array("INFP","ENFP","INFJ","ENFJ","INTJ","ENTJ","INTP","ENTP","ISFP","ESFP","ISTP","ESTP","ISFJ","ESFJ","ISTJ","ESTJ");
let mbsiInfo = new Map();
mbsiInfo.set('INFP', {title: "The Healer", match: [1,1,1,0,1,0,1,1,4,4,4,4,4,4,4,4], description: "Imaginative idealists, guided by their own core values and beliefs. To a Healer, possibilities are paramount; the reality of the moment is only of passing concern. They see potential for a better future, and pursue truth and meaning with their own flair."});
mbsiInfo.set('ENFP', {title: "The Champion", match: [1,1,0,1,0,1,1,1,4,4,4,4,4,4,4,4], description: "People-centered creators with a focus on possibilities and a contagious enthusiasm for new ideas, people and activities. Energetic, warm, and passionate, ENFPs love to help other people explore their creative potential."});
mbsiInfo.set('INFJ', {title: "The Counselor", match: [1,0,1,1,1,1,1,0,4,4,4,4,4,4,4,4], description: "Creative nurturers with a strong sense of personal integrity and a drive to help others realize their potential. Creative and dedicated, they have a talent for helping others with original solutions to their personal challenges."});
mbsiInfo.set('ENFJ', {title: "The Teacher", match: [0,1,1,1,1,1,1,1,0,4,4,4,4,4,4,4], description: "Idealist organizers, driven to implement their vision of what is best for humanity. They often act as catalysts for human growth because of their ability to see potential in other people and their charisma in persuading others to their ideas."});
mbsiInfo.set('INTJ', {title: "The Mastermind", match: [1,0,1,1,1,1,1,0,2,2,2,2,3,3,3,3], description: "Analytical problem-solvers, eager to improve systems and processes with their innovative ideas. They have a talent for seeing possibilities for improvement, whether at work, at home, or in themselves."});
mbsiInfo.set('ENTJ', {title: "The Commander", match: [0,1,1,1,1,1,0,1,2,2,2,2,2,2,2,2], description: "Strategic leaders, motivated to organize change. They are quick to see inefficiency and conceptualize new solutions, and enjoy developing long-range plans to accomplish their vision. They excel at logical reasoning and are usually articulate and quick-witted."});
mbsiInfo.set('INTP', {title: "The Architect", match: [1,1,1,1,1,0,1,1,2,2,2,2,3,3,3,0], description: "Philosophical innovators, fascinated by logical analysis, systems, and design. They are preoccupied with theory, and search for the universal law behind everything they see. They want to understand the unifying themes of life, in all their complexity."});
mbsiInfo.set('ENTP', {title: "The Visionary", match: [1,1,0,1,0,1,1,1,2,2,2,2,3,3,3,3], description: "Inspired innovators, motivated to find new solutions to intellectually challenging problems. They are curious and clever, and seek to comprehend the people, systems, and principles that surround them."});
mbsiInfo.set('ISFP', {title: "The Composer", match: [4,4,4,0,2,2,2,2,3,3,3,3,2,0,2,0], description: "Gentle caretakers who live in the present moment and enjoy their surroundings with cheerful, low-key enthusiasm. They are flexible and spontaneous, and like to go with the flow to enjoy what life has to offer."});
mbsiInfo.set('ESFP', {title: "The Performer", match: [4,4,4,4,2,2,2,2,3,3,3,3,0,2,0,2], description: "Vivacious entertainers who charm and engage those around them. They are spontaneous, energetic, and fun-loving, and take pleasure in the things around them: food, clothes, nature, animals, and especially people."});
mbsiInfo.set('ISTP', {title: "The Craftsperson", match: [4,4,4,4,2,2,2,2,3,3,3,3,2,0,2,0], description: "Observant artisans with an understanding of mechanics and an interest in troubleshooting. They approach their environments with a flexible logic, looking for practical solutions to the problems at hand."});
mbsiInfo.set('ESTP', {title: "The Dynamo", match: [4,4,4,4,2,2,2,2,3,3,3,3,0,2,0,2], description: "Energetic thrillseekers who are at their best when putting out fires, whether literal or metaphorical. They bring a sense of dynamic energy to their interactions with others and the world around them."});
mbsiInfo.set('ISFJ', {title: "The Protector", match: [4,4,4,4,3,2,3,3,2,0,2,0,1,1,1,1], description: "Industrious caretakers, loyal to traditions and organizations. They are practical, compassionate, and caring, and are motivated to provide for others and protect them from the perils of life."});
mbsiInfo.set('ESFJ', {title: "The Provider", match: [4,4,4,4,3,2,3,3,0,2,0,2,1,1,1,1], description: "Conscientious helpers, sensitive to the needs of others and energetically dedicated to their responsibilities. They are highly attuned to their emotional environment and attentive to both the feelings of others and the perception others have of them."});
mbsiInfo.set('ISTJ', {title: "The Inspector", match: [4,4,4,4,3,2,3,3,2,0,2,0,1,1,1,1], description: "Responsible organizers, driven to create and enforce order within systems and institutions. They are neat and orderly, inside and out, and tend to have a procedure for everything they do."});
mbsiInfo.set('ESTJ', {title: "The Supervisor", match: [4,4,4,4,3,2,0,3,0,2,0,2,1,1,1,1], description: "Hardworking traditionalists, eager to take charge in organizing projects and people. Orderly, rule-abiding, and conscientious, ESTJs like to get things done, and tend to go about projects in a systematic, methodical way."});


let selfInfo = mbsiInfo.get(mbsiSelf);

var breakRefresh = false;
var interval = null;
var rejectButton=null;
var url=null;

function highlightText(text) {
  var essay =jQuery(searchIn)[0];
  var innerHTML = essay.innerHTML;
  var index = innerHTML.toLowerCase().indexOf(text);
  var pastHighlight = innerHTML.indexOf("orangered");
  if (index >= 0 && index-pastHighlight!=11) {
      innerHTML = innerHTML.substring(0,index) + "<span style='background-color: orangered'>" + innerHTML.substring(index,index+text.length) + "</span>" + innerHTML.substring(index + text.length);
      essay.innerHTML = innerHTML;
  }
}

var filternonfit = function() {

    if(!breakRefresh && jQuery("span.okicon.i-refresh").length>0){
        breakRefresh=true;
        window.location.reload(false);
        clearInterval(interval);
    }

    let mbsiIdentified = null;
    let levelSet = -1;
    var writeInBlock = jQuery(writeIn);
    var searchInText = jQuery(searchIn);
    var mbsiTypeElement = null;

    var plaintext="";
    var fulltext="";
    var blockreason="";
    var flagreason="";
    jQuery(cardMatcher).each(function(element) {
        plaintext+=this.innerText.toLowerCase();
    });
    searchInText.each(function(element) {
        fulltext+=this.innerText.toLowerCase();
    });

    let height = plaintext.match(heightMtch);
    if(height!=null && height.length==1){
        height = height.toString()
        height = height.substring(0, height.length-2);
        if (height>heightMax || height<heightMin){
            blockreason+=(", Height:"+height);
        }
    }

    block.forEach(function(element){blockreason+=plaintext.includes(element)?"+"+element:"";});
    blockFullText.forEach(function(element){blockreason+=fulltext.includes(element)?"+"+element:"";});
//	mustHave.forEach(function(element){blockreason+=!plaintext.includes(element)?"-"+element+",":"";});

    let jqAge = jQuery(ageSelector);
    if (jqAge.length == 0){
        return;
    }
    let age = jqAge.get(0).innerHTML;
    if (age>=ageMax || age<=ageMin){ blockreason+=",Age:"; blockreason+=age; }

    var geoloc=encodeURI(jQuery(locationSelector).get(0).innerHTML);
    var xmlhttp = new GM_XHR();

    var locationURL=urlBase+geoloc+url2;

    xmlhttp.onreadystatechange = function() {
        function distance(lat1, lon1, lat2, lon2) {
            var R = 6371;
            var dLat = (lat2-lat1).toRad();
            var dLon = (lon2-lon1).toRad();
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c;
            return d;
        }

        if (typeof(Number.prototype.toRad) === "undefined") {
            Number.prototype.toRad = function() {
                return this * Math.PI / 180;
            }
        }

        if (this.readyState == 4 && this.status == 200) {
            var locArr = JSON.parse(this.responseText).results;
            if(locArr.length>0){
                let locRes=locArr[0];
                for(let i = 0; i < locArr.length; i++){
                    if(locArr[i].components._category==locationCategory){
                        locRes=locArr[i];
                        break;
                    }
                }
                let lat = locRes.geometry.lat;
                let lng = locRes.geometry.lng;
                let distanceCalculated=distance(userLoc[0], userLoc[1], lat, lng);

                let cache = GM_getValue(okcLocationCache);
                if(cache!=null){
                    cache=new Map(JSON.parse(cache));
                } else {
                    cache=new Map();
                }
                cache.set(geoloc, Math.round(distanceCalculated));
                GM_setValue(okcLocationCache, JSON.stringify(Array.from(cache.entries())));
                reqInProgress = false;
            }
        }
    };

    var locationCache = GM_getValue(okcLocationCache);
    if (locationCache!=null){
        locationCache=new Map(JSON.parse(locationCache));
    } else {
        locationCache=new Map();
    }

    let distance=locationCache.get(geoloc);
    if (distance!=null && distance>distMax){
        blockreason+=(",Distance:"+distance);
    } else if(distance==null && !reqInProgress){
        reqInProgress = true;
        xmlhttp.open("GET", locationURL, true);
        xmlhttp.send();
    }

    highlight.forEach(function(element){
        highlightText(element);
    });

    if (searchInText.length>0 && writeInBlock.length>0){
        searchInText = searchInText[0].innerHTML.toUpperCase();
        mbsi.forEach(function(element){
            if(searchInText.includes(element)){
                mbsiIdentified = element;
                let mbsiType = mbsiInfo.get(element);
                mbsiTypeElement = element;
                levelSet=selfInfo.match[mbsi.indexOf(element)];
                let color = colorPalete[levelSet];
                writeInBlock[0].innerHTML= "<div style='position: relative;display: grid;background-color: "+color+";width: 22%;float: left;margin-right: 15px;line-height: 30px'>"+element+" - "+mbsiType.title
                    +"</div><div style='position: relative;background-color: #ffcccb;font-size: 80%;width:75%;float: right; line-height: 22px;'>"+blockreason+"</div><div style='position: relative;font-size: 80%;width:75%;float: right; line-height: 22px;'>"+mbsiType.description+"</div>";
            }
        });
    }

    var url=jQuery(".cardsummary-profile-link > a");
    if(url.length>0 && url[0].attributes.length>0){
        url=this.origin+url[0].attributes.getNamedItem("href").value;
    }

    var keepscan=jQuery(keepSelector);
    var keepOverride = false;
    if(keepscan.length>0){
        var keepText = keepscan[0].innerHTML.toLowerCase()
        keep.forEach(function(element){
            if(keepText.includes(element)){
                keepOverride=true;
            }
        });
    }

    if(blockreason!=""){
        if(!keepOverride && levelSet<=levelKeep){
            console.log("Filtered: ["+blockreason+"] "+url);
            jQuery(rejectSelector)[0].click();
        } else if(!keepOverride) {
            console.log("MBSI "+mbsiIdentified+" Overide: ["+blockreason+"] "+url);
        } else {
            console.log("KEEP Overide: ["+blockreason+"] "+url);
        }
    } else if(levelSet>-1){
        console.log("MBSI: "+mbsiIdentified+" "+url);
    }

};
if(!breakRefresh)
    setInterval(filternonfit, cycle);
var clearReqInProgres = function() {
    reqInProgress = false;
}
interval = setInterval(clearReqInProgres, cycle*10);

})();
// I know mbsi is misspelt. Leave it alone.
