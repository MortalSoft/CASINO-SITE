function calcPayout(ms) {
	var gamePayout = Math.floor(100 * growthFunc(ms)) / 100;
	return gamePayout;
}

function getTime(){
	if(crash_settings.stage == 'progress') {
		var time = new Date().getTime() - crash_settings.start_time + crash_settings.difference_time;
		crash_settings.current_progress_time = time;
		
		return time;
	}
	
	if(crash_settings.stage == 'crashed') return crash_settings.current_progress_time;
	return 0;
}

var crash_settings = {};

function style(theme, width) {
	function combineTheme(obj) {
		if (typeof obj[theme] === "string") {
			return obj[theme]
		} else {
			return Object.assign({}, obj.base, obj[theme]);
		}
	}

	function combineState(obj) {
		var states = {
			playing: [],
			cashed: [],
			lost: [],
			starting: [],
			small: [],
			startingBetting: ["starting", "playing"],
			progress: [],
			progress1: [],
			progressPlaying: ["progress", "playing"],
			progressCashed: ["progress", "cashed"],
			ended: [],
			ended1: [],
			endedCashed: ["ended", "cashed"],
			connecting: []
		};
		var ret = {};
		Object.keys(states).forEach(function(state) {
			var sups = states[state];
			var res = Object.assign({}, obj.base || {});
			sups.forEach(function(sup) {
				Object.assign(res, obj[sup] || {})
			});
			Object.assign(res, obj[state]);
			ret[state] = res
		});
		return ret
	}

	function fontSizeNum(times) {
		return times * width / 100
	}

	function fontSizePx(times) {
		var fontSize = fontSizeNum(times);
		return fontSize.toFixed(2) + "px"
	}

	return {
		fontSizeNum: fontSizeNum,
		fontSizePx: fontSizePx,
		axis: {
			lineWidth: 1,
			font: "10px \"Titillium Web\"",
			textAlign: "center",
			strokeStyle: "#BBBBD2",
			fillStyle: "#ffffff"
		},
		data: combineState({
			base: {
				textAlign: "center",
				textBaseline: "middle"
			},
			starting: {
				font: fontSizePx(5) + " \"Titillium Web\"",
				fillStyle: "#ffffff"
			},
			small: {
				font: fontSizePx(3) + " \"Titillium Web\"",
				fillStyle: "#ffffff"
			},
			progress: {
				font: fontSizePx(10) + " \"Titillium Web\"",
				fillStyle: "#1eb9ff"
			},
			ended: {
				font: fontSizePx(10) + " \"Titillium Web\"",
				fillStyle: "#ff2f2f"
			},
			connecting: {
				font: fontSizePx(10) + " \"Titillium Web\"",
				fillStyle: "#1eb9ff"
			}
		}),
		graph: combineState({
			base: {
				strokeStyle: "#ffffff"
			},
			progress: {
				strokeStyle: "#1eb9ff33"
			},
			progress1: {
				lineWidth: 3,
				strokeStyle: "#1eb9ff"
			},
			ended: {
				strokeStyle: "#ff2f2f26"
			},
			ended1: {
				lineWidth: 3,
				strokeStyle: "#ff2f2f"
			}
		})
	}
}
var XTICK_LABEL_OFFSET = 20;
var XTICK_MARK_LENGTH = -4;
var YTICK_LABEL_OFFSET = 11;
var YTICK_MARK_LENGTH = -4;

function getEmHeight(font) {
	var sp = document.createElement("span");
	sp.style.font = font;
	sp.style.display = "inline";
	sp.textContent = "Hello world!";
	document.body.appendChild(sp);
	var emHeight = sp.offsetHeight;
	document.body.removeChild(sp);
	return emHeight
}

function tickSeparation(s) {
	if (!Number.isFinite(s)) {
		throw new Error("Is not a number: ", s)
	};
	var r = 1;
	while (true) {
		if (r > s) {
			return r
		};
		r *= 2;
		if (r > s) {
			return r
		};
		r *= 5
	}
}

function Graph() {
	this.canvas = null;
	this.ctx = null;
	this.animRequest = null;
	this.renderBound = this.render.bind(this)
};

Graph.prototype.startRendering = function(canvasNode, config) {
	//console.assert(!this.canvas && !this.ctx);
	if (!canvasNode.getContext) {
		return console.error("No canvas")
	};
	this.ctx = canvasNode.getContext("2d");
	this.canvas = canvasNode;
	this.configPlotSettings(config, true);
	this.animRequest = window.requestAnimationFrame(this.renderBound)
};

Graph.prototype.stopRendering = function() {
	window.cancelAnimationFrame(this.animRequest);
	this.canvas = this.ctx = null
};

Graph.prototype.configPlotSettings = function(config, forceUpdate) {
	var devicePixelRatio = window.devicePixelRatio || 5;
	var backingStoreRatio = this.ctx.webkitBackingStorePixelRatio || this.ctx.mozBackingStorePixelRatio || this.ctx.msBackingStorePixelRatio || this.ctx.oBackingStorePixelRatio || this.ctx.backingStorePixelRatio || 0.5;
	var ratio = devicePixelRatio / backingStoreRatio;
	if (this.canvasWidth !== config.width || this.canvasHeight !== config.height || this.devicePixelRatio !== devicePixelRatio || this.backingStoreRatio !== backingStoreRatio || forceUpdate) {
		this.canvasWidth = config.width;
		this.canvasHeight = config.height;
		this.devicePixelRatio = devicePixelRatio;
		this.backingStoreRatio = backingStoreRatio;
		this.canvas.style.height = config.height + "px";
		this.canvas.width = config.width * ratio;
		this.canvas.height = config.height * ratio
	};
	this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
	this.style = style(config.currentTheme, this.canvasWidth);
	this.xMinTickSeparation = 2 * this.ctx.measureText("10000").width;
	this.yMinTickSeparation = getEmHeight(this.style.axis.font) * (config.controlsSize === "small" ? 1.75 : 4);
	this.xStart = 30;
	this.yStart = 20;
	this.plotWidth = this.canvasWidth - this.xStart;
	this.plotHeight = this.canvasHeight - this.yStart;
	this.XTimeMinValue = 10000;
	this.YPayoutMinValue = 210;
};

Graph.prototype.calculatePlotValues = function() {
	this.currentTime = getElapsedTimeWithLag(Engine);
	this.currentGrowth = 100 * growthFunc(this.currentTime);
	this.currentPayout = 100 * calcGamePayout(this.currentTime);
	this.XTimeBeg = 0;
	this.XTimeEnd = Math.max(this.XTimeMinValue, this.currentTime);
	this.YPayoutBeg = 100;
	this.YPayoutEnd = Math.max(this.YPayoutMinValue, this.currentGrowth);
	this.XScale = this.plotWidth / (this.XTimeEnd - this.XTimeBeg);
	this.YScale = this.plotHeight / (this.YPayoutEnd - this.YPayoutBeg);

	Engine.graphPayout = this.currentPayout;
};

Graph.prototype.trX = function(t) {
	return this.XScale * (t - this.XTimeBeg)
};

Graph.prototype.trY = function(p) {
	return -(this.YScale * (p - this.YPayoutBeg))
};

Graph.prototype.render = function() {
	this.calculatePlotValues();
	this.clean();
	this.ctx.save();
	this.ctx.translate(this.xStart, this.canvasHeight - this.yStart);
	// this.drawAxes();
	this.drawGraph();
	this.ctx.restore();
	this.drawGameData();
	this.animRequest = window.requestAnimationFrame(this.renderBound)
};

Graph.prototype.clean = function() {
	this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
};

Graph.prototype.drawGraph = function() {

	var style = this.style.graph;
	var ctx = this.ctx;

	var ctx1 = this.ctx;

	if(Engine.gameState == "IN_PROGRESS"){
		Object.assign(ctx, style.progress);
	}else{
		Object.assign(ctx, style.ended);
	}

	var step = Math.floor(1 / this.XScale);
	ctx.beginPath();
	for (var t = this.XTimeBeg; t < this.currentTime; t += step) {
		var x = this.trX(t);
		var y = this.trY(100 * calcGamePayout(t));
		for(var i = y; i <= -1; i++){
			ctx.lineTo(x, i);
		}
	};
	ctx.stroke();

	if(Engine.gameState == "IN_PROGRESS"){
		Object.assign(ctx1, style.progress1);
	}else{
		Object.assign(ctx1, style.ended1);
	}

	ctx1.beginPath();
	for (var t = this.XTimeBeg; t < this.currentTime; t += step) {
		var t1 = parseInt(t / 1000) * 1000;
		var x = this.trX(t1);
		var y = this.trY(100 * calcGamePayout(t1));

		ctx1.lineTo(x, y);
	};

	var x = this.trX(this.currentTime);
	var y = this.trY(100 * calcGamePayout(this.currentTime));
	ctx1.lineTo(x, y);

	ctx1.stroke();
};

Graph.prototype.drawAxes = function() {
  var ctx = this.ctx;
  Object.assign(ctx, this.style.axis);

  // Calcuate separation values.
  var payoutSeparation = tickSeparation(this.yMinTickSeparation / this.YScale * 2);
  var timeSeparation = tickSeparation(this.xMinTickSeparation / this.XScale);



  // Draw tick marks and axes.
  var x, y, payout, time;
  ctx.beginPath();

  // Draw Payout tick marks.
  payout = this.YPayoutBeg + payoutSeparation;
  for (; payout < this.YPayoutEnd; payout += payoutSeparation) {
    y = this.trY(payout);
    ctx.moveTo(0, y);
    ctx.lineTo(XTICK_MARK_LENGTH, y);
  }

  // Draw time tick marks.
  time = timeSeparation;
  for (; time < this.XTimeEnd; time += timeSeparation) {
    x = this.trX(time);
    ctx.moveTo(x, 0);
    ctx.lineTo(x, -YTICK_MARK_LENGTH);
  }

  // Draw background axes
  var x0 = this.trX(this.XTimeBeg), x1 = this.trX(this.XTimeEnd), y0 = this.trY(this.YPayoutBeg), y1 = this.trY(this.YPayoutEnd);
  ctx.moveTo(x0, y1);
  ctx.lineTo(x0, y0);
  ctx.lineTo(x1, y0);

  // Finish drawing tick marks and axes.
  ctx.stroke();

  // Draw payout tick labels.
  payout = this.YPayoutBeg + payoutSeparation;
  for (; payout < this.YPayoutEnd; payout += payoutSeparation) {
	y = this.trY(payout);
	ctx.fillText((payout / 100) + 'x', -XTICK_LABEL_OFFSET + String(payout / 100).length, y);
  }

  // Draw time tick labels.
  time = 0;
  for (; time < this.XTimeEnd; time += timeSeparation) {
    x = this.trX(time);
    ctx.fillText((time / 1000) + 's', x, YTICK_LABEL_OFFSET);
  }
};

Graph.prototype.drawGameData = function() {
	var style = this.style.data;
	var ctx = this.ctx;

	var ctx1 = this.ctx;
	Object.assign(ctx1, style.small);
	ctx1.fillText("Max profit: 5.000.000 coins", 125, 10);

	var state = 0;
	var current_time = getTime();

	if(crash_settings.stage !== 'crashed') {
		$('#crash_crash').css('color', calcPayout(current_time));
		$('.crash .crash-c').css('color', calcPayout(current_time));
	} else {
		$('#crash_crash').css('color', '');
		$('.crash .crash-c').css('color', '');
	}

	// console.log(`currently: ${calcPayout(current_time)}x`);

	switch (Engine.gameState) {
		case "STARTING":
			//console.log(Engine.startingTime);
			//Object.assign(ctx, style.starting);
			//ctx.fillText("Next round in " + Engine.startingTime + "s", this.canvasWidth / 2, this.canvasHeight / 2.5);
			if (!counting) {
				// console.log('countdown started');
				countdown();
			}
			// $('#Multiplier').html("Next round in " + Engine.startingTime + "s");
			$('#Multiplier').css('color','#ffffff');
			ResetRocket();
			break;
		case "IN_PROGRESS":
			let betValues = document.getElementsByClassName('active-crash-bet-value');
			let bets = document.getElementsByClassName('active-crash-bet');

			for(let i in betValues) {
				if(!betValues[i].innerText) break;
				if(!bets[i]) break;

				bets[i].innerHTML = (parseFloat(betValues[i].innerText) * (calcPayout(current_time))).toFixed(2);
			}
			//Object.assign(ctx, style.progress);
			//if(Engine.graphPayout >= 100) ctx.fillText(formatDecimals(Engine.graphPayout / 100, 2) + "x", this.canvasWidth / 2, this.canvasHeight / 2.5);
			// if(Engine.graphPayout >= 100) $('#Multiplier').text(formatDecimals(Engine.graphPayout / 100, 2) + "x");
			$('#Multiplier').text(`${calcPayout(current_time).toFixed(2)}x`);
			$('#Multiplier').css('color','#ffffff');
			StartRocket();
			break;
		case "ENDED":
			//Object.assign(ctx, style.ended);
			//ctx.fillText(formatDecimals(Engine.graphPayout / 100, 2) + "x", this.canvasWidth / 2, this.canvasHeight / 2.5);
			$('#Multiplier').text(formatDecimals(Engine.graphPayout / 100, 2) + "x");
			$('#Multiplier').css('color','#ff0000');
			StopRocket();
			break;
		case "CONNECTING":
			//Object.assign(ctx, style.connecting);
			//ctx.fillText("CONNECTING", this.canvasWidth / 2, this.canvasHeight / 2);
			$('#Multiplier').text("CONNECTING");
			StopRocket();
			break;
	}
};

var counting = false;

function countdown() {
	clearInterval(counter);

	counting = true;
	var secs = 5;
	$('#Multiplier').html("Next round in " + secs + "s");

    var counter = setInterval(function() {
        if(secs == 0) {
			$('#Multiplier').html("Round is starting...");
			clearInterval(counter);
			counting = false;
            return
        }
        secs -= 1;
		$('#Multiplier').html("Next round in " + secs + "s");
    }, 1000);
}

function str2int(s) {
	s = s.replace(/,/g, "");
	s = s.toLowerCase();
	var i = parseFloat(s);
	if (isNaN(i)) {
		return 0
	} else {
		if (s.charAt(s.length - 1) == "k") {
			i *= 1000
		} else {
			if (s.charAt(s.length - 1) == "m") {
				i *= 1000000
			} else {
				if (s.charAt(s.length - 1) == "b") {
					i *= 1000000000
				}
			}
		}
	};
	return i
}

function calcGamePayout(ms) {
	var gamePayout = Math.floor(100 * growthFunc(ms)) / 100;
	return gamePayout;
}

function growthFunc(ms) {
	var r = 0.00006;
	return Math.pow(Math.E, r * ms);
}

function formatDecimals(n, decimals) {
	if (typeof decimals === "undefined") {
		if (n % 100 === 0) {
			decimals = 0
		} else {
			decimals = 2
		}
	};

	n = parseFloat(n);

	return n.toFixed(decimals).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}

function getElapsedTimeWithLag(Engine) {
	if (Engine.gameState == "IN_PROGRESS") {
		var elapsed = Engine.elapsed + (new Date().getTime() - Engine.startTime);

		Engine.crashTime = elapsed;
		return elapsed;
	} else if(Engine.gameState == "ENDED") {
		return Engine.crashTime;
	} else {
		return 0
	}
}

function GenerateStars() {
    $( "#generated_stars" ).empty();
    for(i=1;i<=32;i++){
        var starLeft = Math.floor(Math.random()*$('#CrashScreen').width()-105);
        var delay = (Math.random()*5).toFixed(1);
        var newContent = '<div class="star stars" style="left:'+starLeft+'px;animation:starGo 2s linear '+ delay +'s infinite"></div>';
        var oldContent = $('#generated_stars').html();
        $('#generated_stars').html(newContent+oldContent);
    }
}
function GeneratePlanets() {
    $( "#generated_planets" ).empty();
    for(i=1;i<=5;i++){
        var planetLeft = Math.floor(Math.random()*$('#CrashScreen').width()-100);
        var delay = (Math.random()*5).toFixed(1);
        var newContent = '<div class="planet planets" style="left:'+planetLeft+'px;animation:planetGo 4s linear '+ delay +'s infinite"></div>';
        var oldContent = $('#generated_planets').html();
        $('#generated_planets').html(newContent+oldContent);
    }
}
function StartRocket() {
    let planets = document.getElementsByClassName("planet");
    let stars = document.getElementsByClassName("star");
    for (var i = 0; i < planets.length; i++) {
        planets[i].style.animationPlayState="running";
    }
    for (var i = 0; i < stars.length; i++) {
        stars[i].style.animationPlayState="running";
    }
}
function StopRocket() {
    let planets = document.getElementsByClassName("planet");
    let stars = document.getElementsByClassName("star");
    for (var i = 0; i < planets.length; i++) {
        planets[i].style.animationPlayState="paused";
    }
    for (var i = 0; i < stars.length; i++) {
        stars[i].style.animationPlayState="paused";
    }
}
function ResetRocket() {
    GenerateStars();
    GeneratePlanets();
}
