jQuery(function($) {

var Reflexes = {
	startTime: 0,
	queue: null,
	button: null,
	timer: null,
	timerIndex: 0,
	average: null,
	init: function(nodes) {
		var self = this;
		$.each(['button', 'timer', 'average'], function(i, name) {
			if (!(name in nodes)) {
				return alert('Node is required "button" "timer" "average"');
			}
			self[name] = nodes[name];
		});
		this.button.click(function() {
			var method = $(this).attr('class');
			if (method in self) self[method]();
		});
	},
	start: function() {
		this.button.attr('class', 'wait').text('');
		this.reset();
		this.ready();
	},
	wait: function() {
		clearTimeout(this.queue);
		this.timer.eq(this.timerIndex).val(1);
		this.button.attr('class', 'penalty').text('Too fast! Penalty!');
		var self = this;
		setTimeout(function() { self.next(); }, 1000);
	},
	active: function() {
		this.timer.eq(this.timerIndex).val(((+new Date) - this.startTime) / 1000);
		this.next();
	},
	next: function() {
		if (++this.timerIndex >= this.timer.size()) {
			var average = 0;
			this.timer.each(function() {
				average += +$(this).val();
			});
			this.average.val(Math.round(average / this.timer.size() * 1000) / 1000);
			this.button.attr('class', 'start').text('Retry');
			return;
		}
		this.button.attr('class', 'wait').text('');
		this.ready();
	},
	ready: function() {
		var self = this;
		this.queue = setTimeout(function() {
			self.button.attr('class', 'active').text('');
			self.startTime = +new Date;
		}, Math.floor(Math.random() * 4000) + 1500);
	},
	reset: function() {
		this.timer.val('');
		this.average.val('');
		this.timerIndex = 0;
	}
}

Reflexes.init({
	button: $('#action a'),
	timer: $('#timer ol input'),
	average: $('#timer div.average input')
});

})