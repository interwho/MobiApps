var myFont=JSON.parse('{"a":{"w":4,"h":"00699970"},"b":{"w":4,"h":"88e999e0"},"c":{"w":4,"h":"00788870"},"d":{"w":4,"h":"11799970"},"e":{"w":4,"h":"0069f870"},"f":{"w":4,"h":"34f44440"},"g":{"w":4,"h":"00699971e0"},"h":{"w":4,"h":"88e99990"},"i":{"w":1,"h":"be"},"j":{"w":2,"h":"455580"},"k":{"w":4,"h":"889aca90"},"l":{"w":1,"h":"fe"},"m":{"w":5,"h":"003d5ad6a0"},"n":{"w":4,"h":"00e99990"},"o":{"w":4,"h":"00699960"},"p":{"w":4,"h":"00e999e880"},"q":{"w":4,"h":"0079997110"},"r":{"w":4,"h":"00698880"},"s":{"w":4,"h":"007861e0"},"t":{"w":4,"h":"44f44430"},"u":{"w":4,"h":"00999970"},"v":{"w":4,"h":"00999960"},"w":{"w":5,"h":"002b5ad540"},"x":{"w":5,"h":"0022a22a20"},"y":{"w":4,"h":"00999971e0"},"z":{"w":4,"h":"00f248f0"}," ":{"w":3,"h":"00"},",":{"w":2,"h":"003d80"},".":{"w":2,"h":"003c00"},"A":{"w":5,"h":"74631fc620"},"B":{"w":5,"h":"f463e8c7c0"},"C":{"w":5,"h":"74610845c0"},"D":{"w":5,"h":"f46318c7c0"},"E":{"w":5,"h":"fc21e843e0"},"F":{"w":5,"h":"fc21e84200"},"G":{"w":5,"h":"746178c5c0"},"H":{"w":5,"h":"8c63f8c620"},"I":{"w":3,"h":"e924b8"},"J":{"w":5,"h":"084218c5c0"},"K":{"w":5,"h":"8ca98a4a20"},"L":{"w":5,"h":"84210843e0"},"M":{"w":5,"h":"8eeb18c620"},"N":{"w":5,"h":"8c7359c620"},"O":{"w":5,"h":"746318c5c0"},"P":{"w":5,"h":"f463e84200"},"Q":{"w":5,"h":"74631acdc0"},"R":{"w":5,"h":"f463ea4a20"},"S":{"w":5,"h":"7460e0c5c0"},"T":{"w":5,"h":"f908421080"},"U":{"w":5,"h":"8c6318c5c0"},"V":{"w":5,"h":"8c6318a880"},"W":{"w":5,"h":"8c6b5ad540"},"X":{"w":5,"h":"8c54454620"},"Y":{"w":5,"h":"8c54421080"},"Z":{"w":5,"h":"f8444443e0"}}');

var led = (function() {
	var _self = {},	//public member container
		constants = {
			PIXEL_SIZE : 10,
			PIXEL_GAP : 3,
			MARGIN : 5.5,
			TOP_BUFFER: 2,
			PIXEL_RADIUS: 5
		},
		c,
		pixelBuffer=[],
		pixelsHigh,
		pixelsWide,
		idxPos=0,
		keepScrolling = false,
		pixelBufferPop = false,
		timeout = 51,
		currentTimeoutId = null;
		
		_self.stateSwitches = {
			disco: false
		};
		_self.colourOn = "#F22";
		_self.colourOff = "#311";

	var log = function(msg) {
		if (window.console && window.console.log) {
			console.log(msg);
		}
	}
	var init = function() {
		try {
			c = $("#led")[0].getContext("2d");
		} catch (e) {
			throw new Error("You browser is not supported. HTML5 <CANVAS> required.");
			return;
		}
		c.lineWidth=0;
		c.fillStyle=_self.colourOn;
		pixelsWide = parseInt(($("#led").innerWidth() - (constants.MARGIN * 2)) / (constants.PIXEL_SIZE + constants.PIXEL_GAP));
		pixelsHigh = parseInt(($("#led").innerHeight() - (constants.MARGIN * 2)) / (constants.PIXEL_SIZE + constants.PIXEL_GAP));
		return true;
	}
	
	var showBlank = function() {
		c.fillStyle=getOffColour();
		
		var pixelSize = constants.PIXEL_SIZE + constants.PIXEL_GAP;
		
		for (var i = 0; i <= pixelsWide; i++) {
			for (var k = 0; k <= pixelsHigh; k++) {
				var x = (i * pixelSize) + constants.MARGIN + constants.PIXEL_RADIUS;
				var y = (k * pixelSize) + constants.MARGIN + constants.PIXEL_RADIUS;
			
				drawPixel(x , y);
			}
		}
	};
	
	var getRandomBrightColour = function() {
		var getRandomHex = function() {
			return (parseInt(Math.random()*196) + 64).toString(16);
		}
		
		return "#" + getRandomHex() + getRandomHex() + getRandomHex();
	}
	
	var getOnColour = function() {
		if (_self.stateSwitches.disco) {
			return "#000";
		}
		return _self.colourOn;
	}
	
	var getOffColour = function() {
		if (_self.stateSwitches.disco) {
			return getRandomBrightColour();
		}
		return _self.colourOff;
	}
	
	
	var writeMessageToBuffer = function(msg) {
		if (typeof msg != "string") msg = msg.toString();
		pixelBuffer = new Array(pixelsHigh);
		for (var p=0; p < pixelBuffer.length; p++) {
			pixelBuffer[p] = new Array();
		}
		
		for (var i =0; i < msg.length; i++) {
			var ch = msg.charAt(i),
				l;
			
			ch = ch.replace(/[^a-zA-Z\s\.,]/g,"");	//drop everything that is not lowercase char or space.
			
			if (ch == "") continue;
			
			if ((l=_self.getLetter(ch))) {
				var charWidth = l[0].length;
				
				for (var k = 0; k < pixelsHigh; k++) {
					if (k >= l.length) {		//write blank lines to matrix
						for (var z=0; z < (charWidth+1); z++) {
							pixelBuffer[k].push(0);
						}
					} else {	//copy matrix for letter into buffer
						pixelBuffer[k] = pixelBuffer[k].concat(l[k], [0]);
					}
				}
			}
		}
		
		pixelBufferPop = true;
	};
	
	_self.getLetter = function (let) {
		var h=myFont[let],
			bin = [],
			out=[],
			i;
			
		if (!h) return false;
		
		var htba = function(h) {
			h=parseInt(h,16);
			var s=128,i,b=[],r;
			for (i=0;i<8;i++) {
				if ((r=Math.floor(h/s))) h=h-s;
				s=s/2;
				b.push(r);
			}
			return b;
		}
		for (i=0; i < h.h.length; i+=2) {
			bin = bin.concat(htba(h.h.substr(i,2)));
		}
		while (bin.length >= h.w) {
			out.push(bin.splice(0,h.w));
		}
		if (out.length > 1 && out[out.length-1].indexOf(1) == -1) {
			out.pop();
		}
		
		return out;
	};
	
	var beginScrollMsg = function() {
		idxPos = 0;

		if (currentTimeoutId != null) {
			window.clearTimeout(currentTimeoutId);
			currentTimeoutId = null;
		}
		renderMsg(idxPos);
	};
	
	var scrollMsg = function() {
		idxPos++;

		if (idxPos > pixelBuffer[0].length + pixelsWide) idxPos = 0;
		renderMsg(idxPos);
	};
	
	var renderMsg = function(pos) {
		var pixelSize = constants.PIXEL_SIZE + constants.PIXEL_GAP;
		
		var msgStart = pixelsWide - pos;
		var canvas = $("#led")[0];
		canvas.width=canvas.width;
		
		for (var i = 0; i <= pixelsWide; i++) {
			for (var k = 0; k <= pixelsHigh; k++) {
				c.fillStyle=getOffColour();
				if (i >= msgStart) {
					if (k >= constants.TOP_BUFFER) {
						if (pixelBuffer[k-constants.TOP_BUFFER][i-msgStart] == 1) {
							c.fillStyle=getOnColour();
						}
					}
				}
			
				var x = (i * pixelSize) + constants.MARGIN + constants.PIXEL_RADIUS;
				var y = (k * pixelSize) + constants.MARGIN + constants.PIXEL_RADIUS;
			
				drawPixel(x, y);
			}
		}
		
		if (keepScrolling) {
			currentTimeoutId = window.setTimeout(scrollMsg, timeout);
		}
	};
	
	var drawPixel = function (x, y) {
		c.beginPath();
		c.arc(x,y,Math.round(constants.PIXEL_SIZE/2),0,2*Math.PI,false);
		c.fill();
		//c.fillRect(x , y, constants.PIXEL_SIZE, constants.PIXEL_SIZE);
	};
	
	_self.stop = function() {
		keepScrolling = false;
	};
	
	_self.start = function() {
		keepScrolling = true;
		if (!pixelBufferPop) return;
		beginScrollMsg();
	};
	
	_self.setText = function(txt) {
		showBlank();
		if (typeof txt == "undefined")
			writeMessageToBuffer($("#msgText").val());
		else 
			writeMessageToBuffer(txt);
		keepScrolling=true;
		beginScrollMsg();
	};
	
	_self.slowScroll = function() {
		if (timeout < 500) timeout += 25;
	};
	
	_self.fastScroll = function() {
		if (timeout > 1) timeout -= 25;
	};
	
	_self.setInt = function(val) {
		if (val > 0 && val < 1000) {
			timeout = val;
		}
	};
	
	_self.randomColour = function() {
			var pickOne =function () {
				var colours = [
					"#F22,#311",
					"#22F,#113",
					"#FF2,#331",
					"#F2F,#313",
					"#2F2,#131",
					];
				return colours[Math.floor(Math.random()*colours.length)];
			}
			
			var result;
			do {
				//nothing needed here
			} while ( _self.colourOn + "," + _self.colourOff == (result = pickOne()));
			
			result = result.split(",");
			
			_self.colourOn = result[0];
			_self.colourOff = result[1];
	};
	
	$(document).ready(function () {
		init();
	});
	
	return _self;	//return public methods (if any)
})();

