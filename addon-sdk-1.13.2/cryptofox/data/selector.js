//this script gets loaded into the user's page via page-mod in the main.js

// assume this is a worker thread; but it has access to the DOM?

var matchedElement = null;
var originalBgColor = null;
var active = false;

function resetMatchedElement() {
	if (matchedElement) {
		$(matchedElement).css('background-color', originalBgColor);
		$(matchedElement).unbind('click.annotator');
	}
}

function setValue(elementId, val) {
	var el = document.getElementById(elementId);
	el.value = val;
};
function activator(activation) {
	active = activation;
	if (!active) {
		resetMatchedElement();
	}
}

self.on('message', function(msg) {
	//helper function caller
	console.log("Selector message",msg);
	var j = JSON.parse(msg);
	var fn = window[j.action];
	if ( typeof fn !== 'function') {
		console.log("Selector has no function",j.action);
		return;
	}
	fn.apply(window, j.args);
});

$('*').mouseenter(function() {
	//check the type to see if it is a desired input object
	// only add the handler if the type is desired
	console.log("Selector mouse enter");
	//if ($(this).attr("type") == "text" || $(this).is("textarea") || $(this).is("text")) {
		if (!active || $(this).hasClass('annotated')) {
			return;
		}
		resetMatchedElement();
		//ancestor = $(this).closest("[id]");
		matchedElement = $(this).first();
		originalBgColor = $(matchedElement).css('background-color');
		$(matchedElement).css('background-color', 'yellow');

		//bind a function named click.annotator to the element; "click.annotator" is a namespaced event; in this case for click handling
		$(matchedElement).bind('click.annotator', function(event) {
			event.stopPropagation();
			event.preventDefault();
			//emit the show event
			self.port.emit('show', [$(matchedElement).attr("id"),$(matchedElement).val()]);
		});
	//}
});
$('*').mouseout(function() {
	resetMatchedElement();
});
