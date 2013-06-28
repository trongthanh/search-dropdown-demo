//namespace:
var app = app || {};

//Starting point, on document ready
jQuery(function() {
	//import
	var AdvancedSelect = app.AdvancedSelect;

	var imgRootURL = 'http://d3gtl9l2a4fn1j.cloudfront.net/t/p/w154/',
		movieSearchURL = 'http://api.themoviedb.org/3/search/movie?api_key=93f2a2a313f2627ee85ec237b34eee4d&search_type=ngram',
		personSearchURL = 'http://api.themoviedb.org/3/search/person?api_key=93f2a2a313f2627ee85ec237b34eee4d&search_type=ngram';


	$('#movie-select').on('change', function() {
		$('#output').append('New value selected: ' + this.value + ' - ' + $(this).find('option:selected').text() + '<br>');
	});

	var advSelectInstance = new AdvancedSelect(
		$('#movie-select'), {
			searchURL: movieSearchURL,
			minCharaters: 2,
			placeholder: 'Search for a movie',
			itemClass: 'movie-item',
			itemRenderer: function(item) {
				var html = '',
					poster = item.backdrop_path || item.poster_path;
				if (poster) {
					html += '<img src="' + imgRootURL +  poster + '"> ';
				}
				html += item.title;
				return html;
			}
		});

	console.log(advSelectInstance === AdvancedSelect.getInstance('instance0'));
	console.log(advSelectInstance.$el.data('instanceId'));

	//another instance, try using jQuery plugin
	$('#person-select').advancedSelect({
		searchURL: personSearchURL,
		minCharaters: 4,
		maxListRows: 8,
		placeholder: 'Search for a movie star',
		itemClass: 'custom-item',
		itemRenderer: function(item) {
			return item.name;
		}
	});

	//retrieve instance from pool
	var advancedSelect2 = AdvancedSelect.getInstance( $('#person-select').data('advancedSelectId') );

	//use callback to listen to change
	advancedSelect2.options.change = function(item) {
		$('#output2').append('New value selected: ' + item.value + ' - ' + item.label + '<br>');
	};
});