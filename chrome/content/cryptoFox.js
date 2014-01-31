//
//Crypto Fox Plugin
//
//TODO:
// refactor this into a single object to avoid namespace conflicts.
// allow user to turn on and off the crypto functions
// run the findElements func when page changes.
// need to hook into the crypto devices
// need to be able to float crypto inputs over the underlying original inputs
//
//example encryption - rplace later with real
//use btoa() to encode string
//use atob() to decode string

var cfUtils = {
	addInput : function() {
		var d = content.document.createElement("div");
		d.setAttribute("id", "divrob");
		var newInput = content.document.createElement("input");
		d.appendChild(newInput);
		return d;
	},
	console : function(msg) {
		var _console = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		_console.logStringMessage(msg);
	},
	place : function() {
		var b = content.document.getElementsByTagName("body")
		newInputs.forEach(function(e, i, a) {
			var l = cfUtils.getOffset(e.under);

			var d = content.document.createElement("div");
			d.setAttribute("id", e.under.id + "-cryptofox");
			var ci = content.document.createElement("input");
			d.appendChild(ci);
			ci.style.setProperty("width", l.width);
			ci.style.setProperty("height", l.height);
			e.over = d;

			e.over.style.setProperty("top", l.top);
			e.over.style.setProperty("left", l.left);
			//e.over.style.setProperty("width", l.width);
			e.over.style.setProperty("position", "absolute");
			e.over.style.setProperty("background-color", "gray");
			e.over.style.setProperty("z-index", "100");
			b[0].appendChild(e.over);

			//adjust the tab index for the under element.
			e.under.className += ((e.under.className.length > 0) ? " " : "") + "cryptofox-selected";

		}, this);
	},
	getOffset : function(el) {
		var _x = 0;
		var _y = 0;
		var _w = el.offsetWidth;
		var _h = el.offsetHeight;
		while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
			_x += el.offsetLeft - el.scrollLeft;
			_y += el.offsetTop - el.scrollTop;
			el = el.offsetParent;
		}
		return {
			top : _y + "px",
			left : _x + "px",
			width : _w + "px",
			height : _h + "px"
		};
	},
};

var newInputs = [];

var cryptoFox = function() {
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	return {
		//refs to array of objs that will be crypto enabled; changes on page loads
		_cryptoElements : [],

		//ref to head; this changes based on page loads
		_head : null,

		//ref to body; this changes based on page loads
		_body : null,

		//ref to console; s/b ok to set in init;
		_log : null,

		//logging func
		_console : function(msg) {
			this._log.logStringMessage(msg);
		},

		//init routine; runs once when FF is loaded
		init : function() {
			alert("CryptoFox Init");

			//handler overrides
			var old_handleCommand = gURLBar.handleCommand;
			gURLBar.handleCommand = function(event) {
				cryptoFox._onUrlChange(event);
				old_handleCommand.call(gURLBar, event);
			};
			gBrowser.addEventListener("DOMContentLoaded", cryptoFox._onPageLoad, true);

			//set up refs.
			this._log = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

		},

		// find the replacable elements on the page.
		_findElements : function() {

		},
		_onUrlChange : function(evt) {
			alert("CryptoFox URL Change Detected");
		},
		_onPageLoad : function(evt) {
			
			var doc = evt.originalTarget;
			// doc is document that triggered "onload" event
			alert(doc.nodeType);
			alert(doc.DOCUMENT_NODE);
			if (doc.nodeType != doc.DOCUMENT_NODE) {
				doc = doc.ownerDocument;
				alert("CryptoFox PageLoad Detected");
			}

		},
		run : function() {

			var head = content.document.getElementsByTagName("head")[0], style = content.document.getElementById("cryptofox-style"), allLinks = content.document.getElementsByTagName("input"), foundLinks = 0;

			if (!style) {
				style = content.document.createElement("link");
				style.id = "cryptofox-style";
				style.type = "text/css";
				style.rel = "stylesheet";
				style.href = "chrome://cryptofox/skin/skin.css";
				head.appendChild(style);
			}

			for (var i = 0, il = allLinks.length; i < il; i++) {
				var elm = allLinks[i];
				//alert(i);
				if (elm.getAttribute("type") != "hidden") {
					newInputs.push({
						'under' : elm
					});
					foundLinks++;
				}
			}
			cfUtils.place();
		}
	};
}();
window.addEventListener("load", cryptoFox.init, false);
//browser.addEventListener("load", cryptoFox.pageLoad, false);

