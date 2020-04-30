// quotes are stored in an array of objects
var quotes = [{
  "quote": "A new way to procrastinate"
}, {
  "quote": "A game that's too hard - Kotaku", 
}, {
  "quote": "The reason why I drink"
}, {
  "quote": "Bragging rights the game"
}, {
  "quote": "Big Brain Energy the game"
}, {
  "quote": "The reason why your dad doesn't like you"
}, {
  "quote": "Not sponsored by Raid: Shadow Legends"
}, {
  "quote": "Not a jackbox game"
}, {
  "quote": "A project by four guys who don't know what the hell is going on"
}, {
  "quote": "Truly awful 7.5 / 8 - IGN"
}, {
  "quote": "Couldn't have done this without John, a God amongst men." //thanks again for all the help
}, {
  "quote": "Something to keep you mildly entertained during the 2020 quarantine." 
}];

// function to load and display a new quote
function newQuote() {
  var quoteID = Math.floor(Math.random() * (quotes.length));
  $("#insertQuote").html(quotes[quoteID].quote);
	return quotes[quoteID].quote
}

function openWindow(quote) {
	var tweetUrl = "https://twitter.com/intent/tweet?&text=" + encodeURIComponent("'" + quote + "'\n-Trivial Disappointment (@TrivialDis)")
	window.open(tweetUrl, "_blank"); //allows users to tweet the quote shown on the main page from a new tab
}

// wait for page load before displaying content
$(document).ready(function() {
  // load an initial quote
  var chosenQuote = newQuote();

	$('#insertQuote').click(function() {

	  openWindow(chosenQuote)

	}); 

});