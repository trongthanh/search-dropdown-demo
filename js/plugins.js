// Avoid `console` errors in browsers that lack a console.
(function() {
	var method;
	var noop = function () {};
	var methods = [
		'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
		'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
		'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
		'timeStamp', 'trace', 'warn'
	];
	var length = methods.length;
	var console = (window.console = window.console || {});

	while (length--) {
		method = methods[length];

		// Only stub undefined methods.
		if (!console[method]) {
			console[method] = noop;
		}
	}
}());

// Place any jQuery/helper plugins in here.

/**
 * (c) 2012 int3ractive.com
 * jQuery's Animate Loading... Plugin
 * MIT license
 * Note: To stop the animation, just set the
 * container with new content
 * Usage & Demo: http://codepen.io/trongthanh/pen/avinK
 *
 * @author: Thanh Tran <trongthanh(at)gmail(dot)com>
 * @example: see below
 */
(function ($){
	$.fn.animateLoadingDotDot = function (str) {

		return this.each(function () {
			var $this = $(this),
				dotReg = /([\.\+\-\#\=])/g,
				html,
				$dots,
				idx = -1,
				len,
				intervalid;

			if (!str) {
				//use existing text if no text is passed
				str = $this.text();
			}

			//clear last interval
			if ($this.data('intervalid')) {
				clearInterval($this.data('intervalid'));
				$this.data('intervalid', undefined);
			}

			if (dotReg.test(str)) {
				html = str.replace(dotReg, '<span class="dot" style="display: none">$1</span>');
			} else {
				console.log('no dot to animate');
				$this.html(str);
				return;
			}

			$this.html(html);
			$dots = $this.find('.dot');
			len = $dots.length;

			intervalid = setInterval(function () {
				if (idx >= len) {
					idx = -1;
					//after a cycle, check if the dots are still there
					if ($dots.parent().length <= 0) {
						clearInterval(intervalid);
						$this.data('intervalid', undefined);
						return;
					}
					//console.log($dots.parent());
				}

				for (var i = 0; i < len; i++) {
					if (i <= idx) {
						$dots.eq(i).css('display', 'inline');
					} else {
						$dots.eq(i).css('display', 'none');
					}
				}

				idx ++;
			}, 200);

			$this.data('intervalid', intervalid);
		});
	};

})(jQuery);

/**************
 * USAGE & DEMO
 **************/

/*jQuery(document).ready(function () {
	$('#loading1').animateLoadingDotDot();
	$('#loading2').animateLoadingDotDot('Loading++++');

	$('#end').click(function (){
		//to stop the animation, do
		$('#loading1').html('Completed');
	});
});*/