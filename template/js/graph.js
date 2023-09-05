//GRAPH
var canvas, ctx;

var crash_settings = {
	start_time: new Date().getTime(),
	current_progress_time: 0,
	difference_time: 0,
	stage: 'starting'
}

var XTimeBeg, XTimeEnd, YPayoutBeg, YPayoutEnd, XScale, YScale;

var line_weight = 4;

$(window).resize(function(){
	crashGame_resize();
});

$(document).ready(function() {
	canvas = document.getElementById('crash_canvas');
	
	if(canvas !== null) {
		ctx = canvas.getContext('2d');

		var prev_x_current = 0;
		var prev_y_current = 0;
		var ang = 20;

		setInterval(function(){
			var marks_size = 12;
			
			Object.assign(ctx, {
				fillStyle : '#bbbbd2',
				font: 'bold ' + marks_size + 'px "Titillium Web",sans-serif',
				lineWidth: 2
			});
			
			var current_time = getTime();
			
			var currentGrowth = 100 * growthFunc(current_time);
			var currentPayout = 100 * calcPayout(current_time);
			
			var offset_bottom = 10; // 20
			var offset_left = 0; // 50
			
			XTimeBeg = 0;
			XTimeEnd = Math.max(10000, current_time);
			YPayoutBeg = 100;
			YPayoutEnd = Math.max(210, currentGrowth);
			XScale = (canvas.width - offset_left) / (XTimeEnd - XTimeBeg);
			YScale = (canvas.height - offset_bottom) / (YPayoutEnd - YPayoutBeg);
			
			ctx.beginPath();
			
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			
			//DRAW AXES
			/*var payoutSeparation = tickSeparation(20 / YScale);
			var timeSeparation = tickSeparation(40 / XScale);

			for (var payout = 100; payout < YPayoutEnd; payout += payoutSeparation) {
				var y = calcY(payout) - offset_bottom;
				
				ctx.fillText((payout / 100).toFixed(2) + 'x', 0, canvas.height + y);
			}

			for (var time = 0; time < XTimeEnd; time += timeSeparation) {
				var x = calcX(time);
				
				ctx.fillText((time / 1000).toFixed(0) + 's', x + offset_left, canvas.height);
			}*/
			
			if(crash_settings.stage != 'crashed') {
				$('#crash_crash').text(calcPayout(current_time).toFixed(2));
				ang = 20;
			}

			if(crash_settings.stage !== 'crashed') {
				$('#crash_crash').css('color', getCrashColor(calcPayout(current_time)).bg);
				$('.crash .crash-c').css('color', getCrashColor(calcPayout(current_time)).bg);
			} else {
				$('#crash_crash').css('color', '');
				$('.crash .crash-c').css('color', '');
			}
			
			if(crash_settings.stage == 'progress' || crash_settings.stage == 'crashed'){
				//DRAW LINE
				var colors = {
					progress: '#0084FF', // 355e37
					crashed: '#7d3232'
				}

				var finalColor  = colors['crashed'];
				if(crash_settings.stage == 'progress') {
					// getCrashColor(current_time);
					finalColor = getCrashColor(calcPayout(current_time)).bg;
				} else {
					// $('#crash_crash').css('color', 'x');
					// $('.crash .crash-c').css('color', 'x');
				}

				// console.log(calcPayout(current_time));

				ctx.strokeStyle = finalColor;
				ctx.lineWidth = line_weight;
				
				for (var t = XTimeBeg; t < current_time; t += parseInt(1 / XScale)) {
					var t1 = parseInt(t / 1000) * 1000;
					var x = calcX(t1) + offset_left;
					var y = calcY(100 * calcPayout(t1)) + canvas.height - offset_bottom;
					
					ctx.lineTo(x, y);
				};
				
				var x_begin = calcX(XTimeBeg) + offset_left;
				var y_begin = calcY(100 * calcPayout(XTimeBeg)) + canvas.height - offset_bottom;
				
				var x_current = calcX(current_time) + offset_left;
				var y_current = calcY(100 * calcPayout(current_time)) + canvas.height - offset_bottom;

				// console.log(`x: ${x_current}`);
				// console.log(`y: ${y_current}`);

				ctx.lineTo(x_current, y_current);

				ctx.stroke();
				ctx.strokeStyle='#12497C';
    		ctx.shadowColor='#12497C';
    		ctx.shadowBlur=5;
        // ctx.strokeRect(x,y,w,h);

        ctx.shadowColor='rgba(0,0,0,0)';


				
				if(current_time > 0){
					ctx.fillStyle = colors[crash_settings.stage];
					
					ctx.beginPath();
					ctx.arc(x_begin, y_begin, line_weight / 2 - 1, 0, 2 * Math.PI, false);
					ctx.arc(x_current, y_current, line_weight / 2 - 1, 0, 2 * Math.PI, false);
					ctx.fill();
				}

				// var angle = Math.atan2(y_begin - y_current, x_begin - x_current) * 180 / Math.PI;
				// angle = (180 - angle);
				// var angle = Math.atan2(y_begin - y_current, x_begin - x_current);
				// ctx.save();
				// console.log(angle);
				// ctx.rotate(angle);
  			// ctx.drawImage(img2, x_current - 90, y_current - 15);
  			// ctx.restore();
				var x_current2 = x_current;
				var y_current2 = y_current;

				// x_current2 = 790; // 850
				// y_current2 = 50;
				if(x_current2 >= (canvas.width - 60)) x_current2 = (canvas.width - 60);
				if(y_current2 <= 50) y_current2 = 50;

				// if(x_current2 >= )

  			var img2 = document.getElementById("crash_rocket");
	  		ctx.save();
		    // var pos = {x: 400, y: 200};
		    ctx.translate(parseInt(x_current2), parseInt(y_current2));
		    // ctx.rotate(Math.PI / 180 * (ang += 5));
		    ctx.rotate(Math.PI / 180 * (ang >= 10 ? ang -= 0.01 : 10));
		    ctx.drawImage(img2, -img2.width / 2, -img2.height / 2, img2.width, img2.height);
		    ctx.restore();
			}
			
			// ctx.rotate(0);
			ctx.closePath();

			var img = document.getElementById("crash_bg");
  		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  		// var img2 = document.getElementById("crash_rocket");
  		// ctx.save();
	   //  var pos = {x: 400, y: 200};
	   //  ctx.translate(pos.x ,pos.y);
	   //  ctx.rotate(Math.PI / 180 * (ang += 5));
	   //  ctx.drawImage(img2, -img2.width / 2, -img2.height / 2, img2.width, img2.height);
	   //  ctx.restore();
  		// console.log(`x: ${prev_x_current} -> ${x_current}`);

  		prev_x_current = x_current;
  		prev_y_current = y_current;
		}, 1);
	}
});

function calcX(time) {
	return XScale * (time - XTimeBeg);
};

function calcY(payout) {
	return -(YScale * (payout - YPayoutBeg));
};

function getTime(){
	if(crash_settings.stage == 'progress') {
		var time = new Date().getTime() - crash_settings.start_time + crash_settings.difference_time;
		crash_settings.current_progress_time = time;
		
		return time;
	}
	
	if(crash_settings.stage == 'crashed') return crash_settings.current_progress_time;
	return 0;
}

function calcPayout(ms) {
	var gamePayout = Math.floor(100 * growthFunc(ms)) / 100;
	return gamePayout;
}

function growthFunc(ms) {
	var r = 0.00006;
	return Math.pow(Math.E, r * ms);
}

function tickSeparation(s) {
	var r = 1;
	while (true) {
		if (r > s) return r;
		r *= 2;
		
		if (r > s) return r;
		r *= 5
	}
}