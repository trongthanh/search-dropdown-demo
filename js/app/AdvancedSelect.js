//namespace
var app = app || {};
/*
 * Below is a boilerplate to make this an AMD module with a fallback to IIFE
 */
(function(moduleFn){
	// Support module loading scenarios
	if (typeof define === 'function' && define['amd']){
		// AMD Anonymous Module
		define(['jquery'], moduleFn);
	} else {
		// No module loader (plain <script> tag) - put directly in app namespace
		app.AdvancedSelect = moduleFn.call(window, jQuery);
	}
})(function($) {

	//static private
	var instancePool = {},
		template = '<div class="adv-select-wrapper">' +
		'<div class="value-box">' +
			'<span class="value"></span>' +
		'</div>' +
		'<div class="search-box">' +
			'<input type="search" class="search-input">' +
		'</div>' +
		'<div class="select-list-outer">' +
			'<ul class="select-list">' +
			'</ul>' +
		'</div>' +
	'</div>';

	//temp
	var searchURL = 'http://api.themoviedb.org/3/search/movie?api_key=93f2a2a313f2627ee85ec237b34eee4d&search_type=ngram',
		imgRootURL = 'http://d3gtl9l2a4fn1j.cloudfront.net/t/p/w154/';

	//constructor
	function AdvancedSelect ($select) {
		var self = this;
		if (! $select instanceof $) {
			$select = $($select);
		}

		//empty the select element and fill it with 1 option (for compatibility's sake)
		$select.empty();

		//wrap the select el with adv select template
		var $el = this.wrap($select),
			$value = $el.find('.value');

		$el.on('click', '.value-box', function() {
			self.toggleExpand();
		});

		$el.on('keyup', '.search-input', function() {
			var q = this.value;
			// $value.text(this.value);
			if (q.length >= 4) {
				//TODO: throttle search requests
				console.log('Start searching for', q);
				self.search(q);
			}
		});

		$el.on('click', '.item', function() {
			self._select(this.getAttribute('data-value'), this.innerText);
		});

		//init events
		this.$el = $el;
		this.$select = $select;
		this.$value = $value;
		this.$list = $el.find('.select-list');

		//assign ref id so that this instance can be retrieve later
		var instanceId = 'instance' + AdvancedSelect.count;
		$el.attr('data-instance-id', instanceId);
		instancePool[instanceId] = this;
		this._id = instanceId;
		AdvancedSelect.count ++;
	}

	AdvancedSelect.prototype = {
		//properties
		_id: '',
		$el: null,
		$select: null,
		$value: null,
		$list: null,
		expanded: false,

		//private methods
		/**
		 * Commit selection and assign item value to original select element
		 */
		_select: function(value, text) {
			var $select = this.$select;

			this.$value.html(text);

			if (value !== $select.val()) {
				$select.html('<option value="' + value +'" selected>' + text +'</option>')
					.change(); //trigger change event mannually
			}
			this.toggleExpand(false);
		},

		//TODO: abstract the item's data to a
		_render: function(items) {
			var html = '';
			for (var i = 0, il = items.length; i < il; i++) {
				html += '<li class="item" data-value="' + items[i].id +'">';
				if (items[i].backdrop_path) {
					html += '<img src="' + imgRootURL +  items[i].backdrop_path + '">';
				}
				html += items[i].title + '</li>';
			}

			this.$list.html(html);
		},

		//methods
		wrap: function($select) {
			var $el = $(template);
			$select.after($el).addClass('adv-select');
			$el.prepend($select);
			return $el;
		},

		toggleExpand: function(expanded) {
			var self = this,
				$doc = $(document);

			if (expanded === undefined) {
				this.expanded = !this.expanded;
			} else {
				this.expanded = expanded;
			}

			this.$el.toggleClass('opened', this.expanded);

			if (this.expanded) {
				//listen to document click to close it
				$doc.on('click.advancedSelect', function(e) {
					if ($(e.target).closest(self.$el).length === 0) {
						//if user click outside of this dropdown box
						self.toggleExpand(false); //close it
						//remove the handler on document
						$doc.off('click.advancedSelect');
					}
				});
			} else {
				//remove the handler on document (if any)
				$doc.off('click.advancedSelect');
			}
		},

		search: function(q) {
			var self = this;

			$.ajax({
				url: searchURL,
				timeout: 2000,
				method: 'GET',
				data: 'query=' + q,
				dataType: 'jsonp',
				//jsonp: 'callback', //enable if need to override the param name for callback=?
				//jsonpCallback: 'weatherJsonpCallback',
				success: function(data) {
					var page = data.page,
						results = data.results;

					self._render(results);

				},
				error: function(jqXHR, textStatus) {
					console.log('Service error:', textStatus);
				}
			});
		},

		getSelectedItem: function() {
			//return an item object of {label: '', value: 123}
		}
	};

	//static
	AdvancedSelect.getInstance = function(instanceId) {
		return instancePool[instanceId];
	};

	AdvancedSelect.count = 0;

	//exports
	return AdvancedSelect;
});