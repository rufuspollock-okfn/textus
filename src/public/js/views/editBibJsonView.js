/**
 * Backbone View used when acquiring a bibJSON object, whether through manual entry or search over a
 * BibServer or BibServers
 */
define([ 'text!templates/editBibJsonView.html' ], function(template) {

	var personSchema = {
		name : {
			type : 'Text'
		},
		alternate : {
			type : 'Text'
		},
		firstname : {
			type : 'Text'
		},
		lastname : {
			type : 'Text'
		},
		id : {
			type : 'Text'
		}
	};

	var personToString = function(person) {
		return person.lastname + ', ' + person.firstname;
	};

	/**
	 * Define the model class for a bibJSON reference, specifically the schema used by
	 * backbone-forms to render the editor. This is intentionally not all of the BibJSON spec, just
	 * the fields we're likely to actually want to edit - we can easily add more in here and when a
	 * reference is pulled from an external source we don't lose the information even when we don't
	 * actually display it.
	 */
	var BibJsonModel = Backbone.Model.extend({
		defaults : {
			title : 'Untitled Text',
			year : '2012',
			author : [ {
				name : '',
				alternate : '',
				firstname : 'firstname',
				lastname : 'lastname',
				id : ''
			} ]
		},
		schema : {
			type : {
				type : 'Select',
				options : [ '', 'article', 'book', 'booklet', 'conference', 'inbook', 'incollection', 'inproceedings',
						'manual', 'mastersthesis', 'misc', 'phdthesis', 'proceedings', 'techreport', 'unpublished' ]
			},
			title : {
				type : 'Text'
			},
			author : {
				type : 'List',
				itemType : 'Object',
				itemToString : personToString,
				subSchema : personSchema
			},
			year : {
				type : 'Text'
			},
			editor : {
				type : 'List',
				itemType : 'Object',
				itemToString : personToString,
				subSchema : personSchema
			},
			booktitle : {
				type : 'Text'
			},
			chapter : {
				type : 'Text'
			},
			pages : {
				type : 'Text'
			},
			series : {
				type : 'Text'
			},
			link : {
				type : 'List',
				itemType : 'Object',
				itemToString : function(link) {
					return link.url + ' ' + link.anchor;
				},
				subSchema : {
					url : {
						type : 'Text'
					},
					anchor : {
						type : 'Text'
					}
				}
			},
			identifier : {
				type : 'List',
				itemType : 'Object',
				itemToString : function(identifier) {
					return identifier.type + ' : ' + identifier.id + ' - ' + identifier.url;
				},
				subSchema : {
					id : {
						type : 'Text'
					},
					type : {
						type : 'Text'
					},
					url : {
						type : 'Text'
					}
				}
			}
		}
	});

	var trimBibJson = function(bib) {
		var result = {};
		$.each(bib, function(name, value) {
			if ($.isArray(value) && value.length === 0) {
				// Don't use this value
			} else if (typeof value === 'string' && value === '') {
				// Don't use this one either
			} else {
				result[name] = value;
			}
		});
		return result;
	};

	return Backbone.View.extend({

		initialize : function() {
			_.bindAll(this);
		},

		render : function() {
			var bibJsonModel = new BibJsonModel();
			$(this.el).html(template);
			/* Create and insert BibJSON editor */
			var bibJsonForm = new Form({
				model : bibJsonModel
			}).render();
			$('#form', this.el).html(bibJsonForm.el);

			/* Activate tabs */
			$('#myTab a', this.el).click(function(e) {
				e.preventDefault();
				$(this).tab('show');
				if ($('#facetTab', this.el).children().length == 0) {
					/* Create and insert facet browser */
					$('#facetTab', this.el).facetview({
						// search_url : '/api/texts-es?',
						search_url : 'http://bibsoup.net/query?',
						search_index : 'elasticsearch',
						facets : [ {
							'field' : 'year.exact',
							'display' : 'year'
						}, {
							'field' : 'publisher.exact',
							'display' : 'publisher'
						} ],
						paging : {
							from : 0,
							size : 10
						}
					});
				}
			});
			this.getBibJson = function() {
				bibJsonForm.commit();
				return trimBibJson(bibJsonModel.attributes);
			};
			return this;
		}
	});

});
