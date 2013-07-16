/**
 * (C) 2013 Thanh Tran <trongthanh AT gmail DOT com>
 * MIT License
 */
//namespace
var app = app || {};

(function(exports, $, doc) {

	//static private
	var instancePool = {};

	var template = '<div class="adv-select-wrapper">' +
		'<a class="value-box" href="javascript:void(0);">' +
			'<span class="value placeholder">{{ placeholder }}</span>' +
			'<span class="btn"><b></b></span>' +
		'</a>' +
		'<div class="search-box-outer">' +
			'<div class="search-box">' +
				'<input type="search" class="search-input">' +
				'<div class="prompt">{{ prompt }}</div>' +
				'<div class="select-list-outer">' +
					'<ul class="select-list">' +
					'</ul>' +
					'<div class="scroll-bottom">Loading more...</div>' +
				'</div>' +
			'</div>' +
		'</div>' +
	'</div>';

	var defaults = {
		searchURL: '', //required
		pageParam: 'page',
		queryParam: 'query',
		dataType: 'jsonp',
		resultAdapter: function(rawData) {
			return {
				items: rawData.results,
				page: rawData.page,
				totalPages: rawData.total_pages
			};
		},

		maxListRows: 4,
		minCharaters: 2,
		placeholder: 'Search...',
		idField: 'id',
		itemClass: '',
		itemRenderer: function(item) {
			return (item.label || item.title);
		},
		change: null //change callback
	};

	//constructor
	function AdvancedSelect ($select, opt) {
		var self = this;

		this.options = $.extend({}, defaults, opt);

		if (!this.options.searchURL) throw new Error('searchURL option is required');

		if (! $select instanceof $) {
			$select = $($select);
		}

		//empty the select element and fill it with 1 option (for compatibility's sake)
		$select.empty();

		//wrap the select el with adv select template
		var $el = this._wrap($select),
			$value = $el.find('.value'),
			$scroller = $el.find('.select-list-outer'),
			$list = $el.find('.select-list');

		//init events

		//click on label box
		$el.on('click', '.value-box', function() {
			self.toggleExpand();
		});

		//input on search
		var lastText = '';
		$el.on('keyup', '.search-input', function() {
			var curText = $.trim(this.value);
			if (lastText !== curText) {
				//if text is changed
				self._textInput(this);
			}
			lastText = curText;
		});

		//click on items
		$el.on('click', '.item', function() {
			self._doSelection(this);
		});

		//list scroll
		$scroller.on('scroll', function() {
			// $el.find('.scroll-bottom').text($scroller.scrollTop());
			var scrollTop = $scroller.scrollTop();

			//scroll almost reach the bottom (half of the list's height),
			//start another request cicle
			if (scrollTop > $list.height() - ($scroller.height() * 1.5) &&
				self._page < self._totalPages)
			{
				self.search(lastText, self._page + 1);
			}
		});

		//instance properties
		this.$el = $el;
		this.$select = $select;
		this.$value = $value;
		this.$list = $list;
		this.$scroller = $scroller;

		//assign ref id so that this instance can be retrieve later
		var instanceId = 'instance' + AdvancedSelect.count;
		$el.attr('data-instance-id', instanceId);
		$select.attr('data-advanced-select-id', instanceId);
		instancePool[instanceId] = this;
		this.id = instanceId;
		AdvancedSelect.count ++;
	}

	AdvancedSelect.prototype = {
		//properties
		id: '',
		_page: 1,
		_totalPages: 1,
		_queryBlocked: false,
		_inputTimeout: 0,
		_jqXHR: null,
		_data: null,
		_selectedItem: null,
		$el: null,
		$select: null,
		$value: null,
		$list: null,
		expanded: false,
		options: null,

		//private methods
		_textInput: function(input) {
			var q = input.value,
				self = this,
				$el = this.$el,
				moreChars = this.options.minCharaters - q.length;
			// $value.text(this.value);
			$el.find('.scroll-bottom').hide();
			this.$list.empty();
			this.$scroller.css('height', 0);
			if (moreChars <= 0) {
				$el.find('.prompt').show().html('Searching...').animateLoadingDotDot();

				//throttle search requests
				if (this._inputTimeout) {
					clearTimeout(this._inputTimeout);
					this._inputTimeout = 0;
					// console.log('timeout cleared');
				}
				this._queryBlocked = false;

				this._inputTimeout = setTimeout(function() {

					self._inputTimeout = 0;
					self.search(q, 1);
				}, 500);

			} else {
				$el.find('.prompt')
						.html('Please enter ' + moreChars + ' more ' + ((moreChars === 1) ? 'character' : 'characters'))
						.show();
			}

		},
		/**
		 * Commit selection and assign item value to original select element
		 */
		_doSelection: function(itemEl) {
			var $select = this.$select,
				value = itemEl.getAttribute('data-value'),
				label = itemEl.innerText;

			this.$value.html(label).removeClass('placeholder');

			this.$list.find('.item').each(function (/*index, elem*/) {
				if (this === itemEl) {
					$(this).addClass('selected');
				} else {
					this.className = this.className.replace('selected', '');
				}
			});

			if (value !== $select.val()) {
				this._selectedItem = {value: value, label: label};
				$select.html('<option value="' + value +'" selected>' + label +'</option>')
					.change(); //trigger change event mannually
				//if change callback is defined:
				if (typeof this.options.change === 'function') {
					this.options.change(this._selectedItem);
				}
			}
			this.toggleExpand(false);
		},

		//TODO: abstract the item's data to a
		_render: function(items) {
			var html = '',
				height = this.options.itemHeight,
				itemRenderer = this.options.itemRenderer,
				itemClass = this.options.itemClass,
				idField = this.options.idField,
				maxRows = this.options.maxListRows;

			if (items && items.length) {
				this._data = this._data.concat(items);

				for (var i = 0, il = items.length; i < il; i++) {
					html += '<li class="item ' + itemClass + '" style="height:' + height + 'px" data-value="' + items[i][idField] +'">';
					html += itemRenderer(items[i]);
					html += '</li>';
				}
			}


			if (this._page > 1) {
				this.$list.append(html);
			} else {
				this.$list.html(html);
				if (items.length) {
					this.$el.find('.prompt').empty().hide();
				} else {
					this.$el.find('.prompt').html('No results').show();
				}
				//decide list height:
				if (maxRows > items.length) {
					this.$scroller.css('height', this.$list.height());
				} else {
					this.$scroller.css('height', this.$list.find('.item').first().height() * maxRows);
				}
			}

			if (this._page >= this._totalPages) {
				this.$el.find('.scroll-bottom').hide();
			} else {
				this.$el.find('.scroll-bottom').show();
			}

			this._queryBlocked = false;
		},

		_wrap: function($select) {
			var $el, cusTemplate,
				minChars = this.options.minCharaters,
				prompt = 'Please enter ' + minChars + ' more ' + ((minChars === 1) ? 'character' : 'characters');

			//modify template, can be done
			cusTemplate = template.replace(/\{\{\s*placeholder\s*\}\}/ig, this.options.placeholder);
			cusTemplate = cusTemplate.replace(/\{\{\s*prompt\s*\}\}/ig, prompt);

			$el = $(cusTemplate);
			$select.after($el).addClass('adv-select');
			$el.prepend($select);
			return $el;
		},

		//public methods
		toggleExpand: function(expanded) {
			var self = this,
				$doc = $(doc);

			if (expanded === undefined) {
				this.expanded = !this.expanded;
			} else {
				this.expanded = expanded;
			}

			this.$el.toggleClass('opened', this.expanded);

			if (this.expanded) {
				//focus on the search input
				this.$el.find('.search-input').focus()[0].select();

				//listen to document click to close it
				$doc.on('click.advancedSelect.' + this.id, function(e) {
					if ($(e.target).closest(self.$el).length === 0) {
						//if user click outside of this dropdown box
						self.toggleExpand(false); //close it
						//remove the handler on document
						$doc.off('click.advancedSelect.' + this.id);
					}
				});
			} else {
				//remove the handler on document (if any)
				$doc.off('click.advancedSelect.' + this.id);
			}
		},

		search: function(q, page) {
			if (this._queryBlocked) return;
			var self = this;

			if (isNaN(page)) page = 1;
			if (page === 1) this._data = []; //new set of data

			console.log('Start searching for', q, '- page:', page);

			this._jqXHR = $.ajax({
				url: this.options.searchURL,
				timeout: 5000,
				method: 'GET',
				data: this.options.queryParam + '=' + encodeURIComponent(q) + '&' + this.options.pageParam + '=' + page,
				dataType: this.options.dataType,
				//jsonp: 'callback', //enable if need to override the param name for callback=?
				//jsonpCallback: 'weatherJsonpCallback',
				success: function(data) {
					var results = self.options.resultAdapter(data);

					self._page = results.page || page;
					self._totalPages = results.totalPages;
					self._render(results.items);

					if (self._jqXHR) self._jqXHR = null;
				},
				error: function(jqXHR, textStatus) {
					console.log('Service error:', textStatus);
					self.$el.find('.prompt').show().html('Error: ' + textStatus);
				}
			});
			this._queryBlocked = true;
		},

		getSelectedItem: function() {
			return this._selectedItem;
		},

		/**
		 *
		 */
		destroy: function() {
			//TODO: destroy and release all references to avoid memory leak
		}

	};

	//static
	AdvancedSelect.getInstance = function(instanceId) {
		return instancePool[instanceId];
	};

	AdvancedSelect.count = 0;

	//jQuery plugin
	$.fn.advancedSelect = function(opt) {
		return this.each(function () {

			new AdvancedSelect($(this), opt);
		});
	};

	//exports
	exports.AdvancedSelect = AdvancedSelect;
})(app, jQuery, document);