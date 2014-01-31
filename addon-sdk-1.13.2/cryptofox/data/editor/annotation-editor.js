//this runs in the browser....
var textArea = document.getElementById('annotation-box');

textArea.onkeyup = function(event) {
	if (event.keyCode == 13) {
		self.postMessage(textArea.value);
		textArea.value = '';
	}
};
function test() {
	console.log("test");
};

function focus(origValue) {
	var textArea = document.getElementById('annotation-box');
	if (origValue) {
		textArea.value = atob(origValue);
	} else {
		textArea.value = '';
	}
	textArea.focus();
};
self.on('message', function(msg) {
	//helper function caller
	console.log("Annotator message",msg);
	var j = JSON.parse(msg);
	var fn = window[j.action];
	if ( typeof fn !== 'function') {
		return;
	}
	fn.apply(window, j.args);

});
