define([ 'jquery', 'underscore', 'backbone', 'form', 'text!templates/reviewTextUploadView.html' ], function($, _,
		Backbone, Form, template) {

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
		return person.lastname + ', ' + person.firstname + ' [' + person.id + '] (' + person.alternate + ') - ' + person.name;
	};

	var bibJsonSchema = {

		type : {
			type : 'Select',
			options : [ 'article', 'book', 'booklet', 'conference', 'inbook', 'incollection', 'inproceedings',
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
		address : {
			type : 'Text'
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
		journal : {
			type : 'Object',
			subSchema : {
				name : {
					type : 'Text'
				},
				shortcode : {
					type : 'Text'
				},
				id : {
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

	};

	var bibJsonSchemaOld = {

		type : {
			type : 'Select',
			options : [ 'article', 'book', 'booklet', 'conference', 'inbook', 'incollection', 'inproceedings',
					'manual', 'mastersthesis', 'misc', 'phdthesis', 'proceedings', 'techreport', 'unpublished' ]
		},
		title : {
			type : 'Text'
		},
		journal : {
			type : 'Object',
			subSchema : {
				name : {
					type : 'Text'
				},
				shortcode : {
					type : 'Text'
				},
				id : {
					type : 'Text'
				}
			}
		},
		identifier : {
			type : 'List',
			itemType : 'Object',
			subSchema : {
				a : {
					type : 'Text'
				}
			}
		}

	};

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);

		},

		render : function() {
			$(this.el).html(template);
			var bibJsonForm = new Form({
				schema : bibJsonSchema
			}).render();
			console.log(bibJsonForm.el);
			$('#form', this.el).html(bibJsonForm.el);
			// console.log($(this.el)('#form'));
			return this;
		}
	});

});