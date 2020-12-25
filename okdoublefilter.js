// ==UserScript==
// @name         OkDoubleFilter
// @namespace
// @version      0.4
// @description  take over someones world
// @author       https://github.com/okyk
// @match        https://www.okcupid.com/doubletake
// @match        https://www.okcupid.com/home
//       https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant        none
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
const mustHave = new Array('straight', 'woman', 'single');
const block = new Array("non-monogamous", "smokes cigarettes", "pescatarian", "has kid(s)", "indian", "hindi", "hindu", "black", "overweight", "full figured", "a little extra", "queer", "trans", "transfeminine", "transgender", "transsexual", "nonconforming", "genderqueer", "pansexual", "questioning", "asexual", "heteroflexible", "gay", "lesbian", "bisexual", "homoflexible", "vegetarian", "vegan");
const heightMtch = /[\d]{2,}cm/;

// needed only to sort by distance
// install nodejs(latest stable) with npm https://nodejs.org/en/
// create a folder "cors-server" (wherever you like)
// run "npm install cors-anywhere"
// run "node node_modules/cors-anywhere/server.js" (you'll need it running while using the distance filter)
// expected response: "Running CORS Anywhere on 0.0.0.0:8080"
// stores distance in km in local storage in locationCache

const distanceEnabled = false;
const proxy = 'http://localhost:8080/';
const userLoc = new Array(43.642560, -79.387251); // your location (or close by, for my paranoid friends)
const distMax = 20; // in KM, no freedom units here.
const urlBase="https://api.opencagedata.com/geocode/v1/json?q=";
const url2="&key=641c51bed8ab490184632ad8526e29ad&no_annotations=1&language=en";

const heightMin = 150;
const heightMax = 169;

const ageMin = 25;
const ageMax = 35;

const nbsiSelf = "INTJ"; // ye, you guessed it. change to yours if desired.
const colorPalete = ["teal","green","lightgreen","lightyellow","lightred"]; // you can change it to what you want ["do it", "good chance", "have chance", "with luck", "good luck"]
const levelKeep = -1; // <= match level to keep. -1 to disable
const cycle= 300; // run it every "cycle" ms
const locationCategory = "place";
var reqInProgress = false;

// credit for descriptions goes to https://www.truity.com/
const nbsi = new Array("INFP","ENFP","INFJ","ENFJ","INTJ","ENTJ","INTP","ENTP","ISFP","ESFP","ISTP","ESTP","ISFJ","ESFJ","ISTJ","ESTJ");
let nbsiInfo = new Map();
nbsiInfo.set('INFP', {title: "The Healer", match: [1,1,1,0,1,0,1,1,4,4,4,4,4,4,4,4], description: "Imaginative idealists, guided by their own core values and beliefs. To a Healer, possibilities are paramount; the reality of the moment is only of passing concern. They see potential for a better future, and pursue truth and meaning with their own flair."});
nbsiInfo.set('ENFP', {title: "The Champion", match: [1,1,0,1,0,1,1,1,4,4,4,4,4,4,4,4], description: "People-centered creators with a focus on possibilities and a contagious enthusiasm for new ideas, people and activities. Energetic, warm, and passionate, ENFPs love to help other people explore their creative potential."});
nbsiInfo.set('INFJ', {title: "The Counselor", match: [1,0,1,1,1,1,1,0,4,4,4,4,4,4,4,4], description: "Creative nurturers with a strong sense of personal integrity and a drive to help others realize their potential. Creative and dedicated, they have a talent for helping others with original solutions to their personal challenges."});
nbsiInfo.set('ENFJ', {title: "The Teacher", match: [0,1,1,1,1,1,1,1,0,4,4,4,4,4,4,4], description: "Idealist organizers, driven to implement their vision of what is best for humanity. They often act as catalysts for human growth because of their ability to see potential in other people and their charisma in persuading others to their ideas."});
nbsiInfo.set('INTJ', {title: "The Mastermind", match: [1,0,1,1,1,1,1,0,2,2,2,2,3,3,3,3], description: "Analytical problem-solvers, eager to improve systems and processes with their innovative ideas. They have a talent for seeing possibilities for improvement, whether at work, at home, or in themselves."});
nbsiInfo.set('ENTJ', {title: "The Commander", match: [0,1,1,1,1,1,0,1,2,2,2,2,2,2,2,2], description: "Strategic leaders, motivated to organize change. They are quick to see inefficiency and conceptualize new solutions, and enjoy developing long-range plans to accomplish their vision. They excel at logical reasoning and are usually articulate and quick-witted."});
nbsiInfo.set('INTP', {title: "The Architect", match: [1,1,1,1,1,0,1,1,2,2,2,2,3,3,3,0], description: "Philosophical innovators, fascinated by logical analysis, systems, and design. They are preoccupied with theory, and search for the universal law behind everything they see. They want to understand the unifying themes of life, in all their complexity."});
nbsiInfo.set('ENTP', {title: "The Visionary", match: [1,1,0,1,0,1,1,1,2,2,2,2,3,3,3,3], description: "Inspired innovators, motivated to find new solutions to intellectually challenging problems. They are curious and clever, and seek to comprehend the people, systems, and principles that surround them."});
nbsiInfo.set('ISFP', {title: "The Composer", match: [4,4,4,0,2,2,2,2,3,3,3,3,2,0,2,0], description: "Gentle caretakers who live in the present moment and enjoy their surroundings with cheerful, low-key enthusiasm. They are flexible and spontaneous, and like to go with the flow to enjoy what life has to offer."});
nbsiInfo.set('ESFP', {title: "The Performer", match: [4,4,4,4,2,2,2,2,3,3,3,3,0,2,0,2], description: "Vivacious entertainers who charm and engage those around them. They are spontaneous, energetic, and fun-loving, and take pleasure in the things around them: food, clothes, nature, animals, and especially people."});
nbsiInfo.set('ISTP', {title: "The Craftsperson", match: [4,4,4,4,2,2,2,2,3,3,3,3,2,0,2,0], description: "Observant artisans with an understanding of mechanics and an interest in troubleshooting. They approach their environments with a flexible logic, looking for practical solutions to the problems at hand."});
nbsiInfo.set('ESTP', {title: "The Dynamo", match: [4,4,4,4,2,2,2,2,3,3,3,3,0,2,0,2], description: "Energetic thrillseekers who are at their best when putting out fires, whether literal or metaphorical. They bring a sense of dynamic energy to their interactions with others and the world around them."});
nbsiInfo.set('ISFJ', {title: "The Protector", match: [4,4,4,4,3,2,3,3,2,0,2,0,1,1,1,1], description: "Industrious caretakers, loyal to traditions and organizations. They are practical, compassionate, and caring, and are motivated to provide for others and protect them from the perils of life."});
nbsiInfo.set('ESFJ', {title: "The Provider", match: [4,4,4,4,3,2,3,3,0,2,0,2,1,1,1,1], description: "Conscientious helpers, sensitive to the needs of others and energetically dedicated to their responsibilities. They are highly attuned to their emotional environment and attentive to both the feelings of others and the perception others have of them."});
nbsiInfo.set('ISTJ', {title: "The Inspector", match: [4,4,4,4,3,2,3,3,2,0,2,0,1,1,1,1], description: "Responsible organizers, driven to create and enforce order within systems and institutions. They are neat and orderly, inside and out, and tend to have a procedure for everything they do."});
nbsiInfo.set('ESTJ', {title: "The Supervisor", match: [4,4,4,4,3,2,0,3,0,2,0,2,1,1,1,1], description: "Hardworking traditionalists, eager to take charge in organizing projects and people. Orderly, rule-abiding, and conscientious, ESTJs like to get things done, and tend to go about projects in a systematic, methodical way."});


let selfInfo = nbsiInfo.get(nbsiSelf);
let nbsiIdentified = null;

var rejectButton=null;
var url=null;

var filternonfit = function() {
    let levelSet = -1;
    var writeInBlock = jQuery(writeIn);
    var searchInText = jQuery(searchIn);
    var nbsiTypeElement = null;
    if (searchInText.length>0 && writeInBlock.length>0){
        searchInText = searchInText[0].innerHTML.toUpperCase();
        nbsi.forEach(function(element){
            if(searchInText.includes(element)){
                nbsiIdentified = element;
                let nbsiType = nbsiInfo.get(element);
                nbsiTypeElement = element;
                levelSet=selfInfo.match[nbsi.indexOf(element)];
                let color = colorPalete[levelSet];
                writeInBlock[0].innerHTML= "<div style='position: relative;display: grid;background-color: "+color+";width: 22%;float: left;margin-right: 15px;line-height: 30px'>"+element+" - "+nbsiType.title
                    +"</div><div style='position: relative;font-size: 80%;width:75%;float: right; line-height: 22px;'>"+nbsiType.description+"</div>";
            }
        });
    }

    var plaintext="";
    var blockreason="";
    jQuery(cardMatcher).each(function(element) {
        plaintext+=this.innerText.toLowerCase();
    });

    let height = plaintext.match(heightMtch);
    if(height!=null && height.length==1){
        height = height.toString()
        height = height.substring(0, height.length-2);
        if (height>heightMax || height<heightMin){
            blockreason+=(",Height:"+height);
        }
    }

    block.forEach(function(element){blockreason+=plaintext.includes(element)?"+"+element:"";});
	mustHave.forEach(function(element){blockreason+=!plaintext.includes(element)?"-"+element+",":"";});

    let age = jQuery("span.cardsummary-age").get(0).innerHTML;
    if (age>ageMax || age<ageMin){ blockreason+=",Age:"; blockreason+=age; }

    var geoloc=encodeURI(jQuery(locationSelector).get(0).innerHTML);
    var xmlhttp = new XMLHttpRequest();

    var locationURL=proxy+urlBase+geoloc+url2;

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

                let cache = localStorage.locationCache;
                if(cache!=null){
                    cache=new Map(JSON.parse(localStorage.locationCache));
                } else {
                    cache=new Map();
                }
                cache.set(geoloc, Math.round(distanceCalculated));
                localStorage.locationCache=JSON.stringify(Array.from(cache.entries()));
                reqInProgress = false;
            }
        }
    };

    var locationCache = localStorage.locationCache;
    if (locationCache!=null){
        locationCache=new Map(JSON.parse(localStorage.locationCache));
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

    var url=jQuery(".cardsummary-profile-link > a");
    if(url.length>0 && url[0].attributes.length>0){
        url=this.origin+url[0].attributes.getNamedItem("href").value;
    }

    if(blockreason!=""){
        if(levelSet<=levelKeep){
            console.log("Filtered: ["+blockreason+"] "+url);
            jQuery(rejectSelector)[0].click();
        } else {
            console.log("NBSI "+nbsiIdentified+" Overide: ["+blockreason+"] "+url);
        }
    } else if(levelSet>-1){
        console.log("NBSI: "+nbsiIdentified+" "+url);
    }

};
setInterval(filternonfit, cycle);
var clearReqInProgres = function() {
    reqInProgress = false;
}
setInterval(clearReqInProgres, cycle*10);

})();
// nbsi is not a typo. its an easter for fellow EVE players.
