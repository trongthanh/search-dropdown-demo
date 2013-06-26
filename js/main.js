//namespace:
var app = app || {};




//Starting point, on document ready
jQuery(function() {
	//import
	var AdvancedSelect = app.AdvancedSelect;

	$('#movie-title-select').on('change', function() {
		$('#output').append('New value selected: ' + this.value + ' - ' + $(this).find('option:selected').text() + '<br>');
	});

	var advSelectInstance = new AdvancedSelect($('#movie-title-select'));

	console.log(advSelectInstance === AdvancedSelect.getInstance('instance0'));
	console.log(advSelectInstance.$el.data('instanceId'));
});