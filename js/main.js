//name space:
var t3 = t3 || {};




//Starting point, on document ready
jQuery(function() {
	$('#movie-title-select').on('change', function() {
		$('#output').append('New value slected: ' + this.value + '<br>');
	});


});