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

const nameSelector="span.cardsummary-item.cardsummary-realname"
const writeIn="div.qmcard-blurb";
const searchIn="div.qmessays";
const mbsi = new Array("ISTJ","ISFJ","INFJ","INTJ","ISTP","ISFP","INFP","INTP","ESTP","ESFP","ENFP","ENTP","ESTJ","ESFJ","ENFJ","ENTJ");
const cardMatcher=".matchprofile-details-text";
const rejectSelector="button.pill-button.pass-pill-button.doubletake-pass-button";
const mustHave = new Array('straight', 'woman', 'single');
const block = new Array("non-monogamous", "smokes cigarettes", "pescatarian", "has kid(s)", "indian", "black", "overweight", "full figured", "a little extra", "curvy", "queer", "trans", "transfeminine", "transgender", "transsexual", "nonconforming", "genderqueer", "pansexual", "demisexual", "questioning", "asexual", "heteroflexible", "gay", "lesbian", "bisexual", "homoflexible", "vegetarian", "vegan");

let mbsiInfo = new Map();
mbsiInfo.set('INFP', {title: "The Healer", description: "Imaginative idealists, guided by their own core values and beliefs. To a Healer, possibilities are paramount; the reality of the moment is only of passing concern. They see potential for a better future, and pursue truth and meaning with their own flair."});
mbsiInfo.set('INTJ', {title: "The Mastermind", description: "Analytical problem-solvers, eager to improve systems and processes with their innovative ideas. They have a talent for seeing possibilities for improvement, whether at work, at home, or in themselves."});
mbsiInfo.set('INFJ', {title: "The Counselor", description: "Creative nurturers with a strong sense of personal integrity and a drive to help others realize their potential. Creative and dedicated, they have a talent for helping others with original solutions to their personal challenges."});
mbsiInfo.set('INTP', {title: "The Architect", description: "Philosophical innovators, fascinated by logical analysis, systems, and design. They are preoccupied with theory, and search for the universal law behind everything they see. They want to understand the unifying themes of life, in all their complexity."});
mbsiInfo.set('ISFJ', {title: "The Protector", description: "Industrious caretakers, loyal to traditions and organizations. They are practical, compassionate, and caring, and are motivated to provide for others and protect them from the perils of life."});
mbsiInfo.set('ISFP', {title: "The Composer", description: "Gentle caretakers who live in the present moment and enjoy their surroundings with cheerful, low-key enthusiasm. They are flexible and spontaneous, and like to go with the flow to enjoy what life has to offer."});
mbsiInfo.set('ISTJ', {title: "The Inspector", description: "Responsible organizers, driven to create and enforce order within systems and institutions. They are neat and orderly, inside and out, and tend to have a procedure for everything they do."});
mbsiInfo.set('ISTP', {title: "The Craftsperson", description: "Observant artisans with an understanding of mechanics and an interest in troubleshooting. They approach their environments with a flexible logic, looking for practical solutions to the problems at hand."});
mbsiInfo.set('ENFP', {title: "The Champion", description: "People-centered creators with a focus on possibilities and a contagious enthusiasm for new ideas, people and activities. Energetic, warm, and passionate, ENFPs love to help other people explore their creative potential."});
mbsiInfo.set('ENTJ', {title: "The Commander", description: "Strategic leaders, motivated to organize change. They are quick to see inefficiency and conceptualize new solutions, and enjoy developing long-range plans to accomplish their vision. They excel at logical reasoning and are usually articulate and quick-witted."});
mbsiInfo.set('ENTP', {title: "The Visionary", description: "Inspired innovators, motivated to find new solutions to intellectually challenging problems. They are curious and clever, and seek to comprehend the people, systems, and principles that surround them."});
mbsiInfo.set('ENFJ', {title: "The Teacher", description: "Idealist organizers, driven to implement their vision of what is best for humanity. They often act as catalysts for human growth because of their ability to see potential in other people and their charisma in persuading others to their ideas."});
mbsiInfo.set('ESFJ', {title: "The Provider", description: "Conscientious helpers, sensitive to the needs of others and energetically dedicated to their responsibilities. They are highly attuned to their emotional environment and attentive to both the feelings of others and the perception others have of them."});
mbsiInfo.set('ESFP', {title: "The Performer", description: "Vivacious entertainers who charm and engage those around them. They are spontaneous, energetic, and fun-loving, and take pleasure in the things around them: food, clothes, nature, animals, and especially people."});
mbsiInfo.set('ESTJ', {title: "The Supervisor", description: "Hardworking traditionalists, eager to take charge in organizing projects and people. Orderly, rule-abiding, and conscientious, ESTJs like to get things done, and tend to go about projects in a systematic, methodical way."});
mbsiInfo.set('ESTP', {title: "The Dynamo", description: "Energetic thrillseekers who are at their best when putting out fires, whether literal or metaphorical. They bring a sense of dynamic energy to their interactions with others and the world around them."});

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
            url=this.origin+url[0].attributes.getNamedItem("href").value;
        }
        console.log("Filtered: ["+blockreason+"] "+url);
        jQuery(rejectSelector)[0].click();
    }
    var writeInBlock = jQuery(writeIn);
    var searchInText = jQuery(searchIn);
    if (searchInText.length>0 && writeInBlock.length>0){
        searchInText = searchInText[0].innerHTML.toUpperCase();
        mbsi.forEach(function(element){
            if(searchInText.includes(element)){
                let mbsiType = mbsiInfo.get(element);
                writeInBlock[0].innerHTML= "<div style='position: relative;display: grid;background-color:lightblue;width: 22%;float: left;margin-right: 15px;'>"+element+" - "+mbsiType.title
                    +"</div><div style='position: relative;font-size: 80%;width:75%;float: right; line-height: 22px;'>"+mbsiType.description+"</div>";
            }
        });
    }
};
setInterval(filternonfit, 300);
})();
