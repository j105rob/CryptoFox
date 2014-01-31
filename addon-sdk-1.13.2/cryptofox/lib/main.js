var widgets = require('sdk/widget');
var data = require('sdk/self').data;
var pageMod = require('sdk/page-mod');
var panels = require('sdk/panel');
var base64 = require("sdk/base64");

//array to hold worker refs; not sure why this is needed, maybe because of tabs?
//TODO: might need to change this to a dictionary
var selectors = [];

//state of the switch
var annotatorIsOn = false;

function toggleActivation() {
	annotatorIsOn = !annotatorIsOn;
	activateSelectors();
	return annotatorIsOn;
}

function activateSelectors() {
	selectors.forEach(function(selector) {
		var j = {
			action : 'activator',
			args : [annotatorIsOn]
		};
		console.log("Selector worker URL",selector.url);
		selector.postMessage(JSON.stringify(j));
	});
}

function detachWorker(worker, workerArray) {
	var index = workerArray.indexOf(worker);
	if (index != -1) {
		workerArray.splice(index, 1);
	}
}

//this is the driver of the add-on
exports.main = function() {

	//this is the on-off widget; the click listener is in the js file
	var widget = widgets.Widget({
		id : 'toggle-switch',
		label : 'CryptoFox',
		contentURL : data.url('widget/pencil-off.png'),
		contentScriptWhen : 'ready',
		contentScriptFile : data.url('widget/widget.js')
	});

	//this is the handler for the left click
	widget.port.on('left-click', function() {
		console.log('activate/deactivate');
		widget.contentURL = toggleActivation() ? data.url('widget/pencil-on.png') : data.url('widget/pencil-off.png');
	});

	//this is the handler for the right click
	widget.port.on('right-click', function() {
		console.log('show annotation list');
	});

	// fires off for each page load; adds scripts to the page; creates a worker
	var selector = pageMod.PageMod({
		//attachTo:["existing","top"],
		// * means every page; might mean every tab!
		include : ['*'],
		contentScriptWhen : 'ready',
		contentScriptFile : [data.url('jquery-1.9.1.min.js'), data.url('selector.js')],
		// runs when script has been attached to the page
		onAttach : function(worker) {
			console.log("Worker Attached to URL",worker.url);
			//tell the worker the state of the annotator switch
			var j = {
				action : 'activator',
				args : [annotatorIsOn]
			};
			worker.postMessage(JSON.stringify(j));
	
			//push the worker onto the array for later comms
			selectors.push(worker);

			//event handler when selected element is clicked.
			worker.port.on('show', function(data) {
				console.log(data);
				annotationEditor.annotationAnchor = data[0];
				annotationEditor.origValue = data[1];
				annotationEditor.show();
			});
			//event handler
			worker.on('detach', function() {
				console.log("Selector detach worker", this.url);
				detachWorker(this, selectors);
			});
		}
	});
	//widget for adding the annotation
	var annotationEditor = panels.Panel({
		width : 220,
		height : 220,
		contentURL : data.url('editor/annotation-editor.html'),
		contentScriptFile : data.url('editor/annotation-editor.js'),
		onMessage : function(annotationText) {
			if (annotationText) {
				//add crypto then set the annotation anchor's element value to encrypted data
				console.log(this.annotationAnchor);
				console.log(annotationText);
				console.log(base64.encode(annotationText));
				//need to signal selector
				var j = {
					action : 'setValue',
					args : [this.annotationAnchor, base64.encode(annotationText)]
				};
				selectors[0].postMessage(JSON.stringify(j));
			}
		},
		onShow : function() {
			this.postMessage(JSON.stringify({
				action : 'focus',
				args : [this.origValue]
			}));
		}
	});
}

