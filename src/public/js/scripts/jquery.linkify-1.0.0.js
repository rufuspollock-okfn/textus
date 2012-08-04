// Linkify: A jQuery plugin that takes a section and turns it into a link. Version 1.00, 2008 December, 21 by Dave Smith, www.dave-smith.info.
(function($)
{
	$.fn.linkify = function(options)
	{
		var defaults = {
			
			// Set whether to linkify using other section classes in addition to the linkify class.
			linkify: true,
						
			// Set the class name to be applied to the target, for example <div class="linkify">
			linkify_class: 'linkify',
			
			// Set whether a focus class is added.
			focus: true,
						
			// Set the focus class, for example <div class="linkify linkify-focus">
			focus_class: 'focus',
			
			// Set whether a focus sub class is added.
			focus_sub: true,
						
			// Set the sub focus class, for example <div class="linkify linkify-focus-sub">
			focus_sub_class: 'focus-sub',
			
			// Set whether a visited class is added.
			visited: true,
						
			// Set the visited class, for example 'visited' would produce <div class="linkify linkify-visited">
			visited_class: 'visited',
						
			// Set the default nth link to use.
			link_index: 0
		};
		// Get the settings.
		var settings = $.extend({}, defaults, options);

		// Check if options is a number.
		if (typeof options == 'number')
		{
			// Overwrite the link index to use.
			settings.link_index = options;
		}
		// Check if a focus class is wanted but no class is given.
		if (settings.focus && settings.focus_class == '')
		{
			// Reset the class to the default.
			settings.focus_class = defaults.focus_class;
		}
		// Check if a focus_sub class is wanted but no class is given.
		if (settings.focus_sub && settings.focus_sub_class == '')
		{
			// Reset the class to the default.
			settings.focus_sub_class = defaults.focus_sub_class;
		}
		// Check if a visited class is wanted but no class is given.
		if (settings.visited && settings.visited_class == '')
		{
			// Reset the class to the default.
			settings.visited_class = defaults.visited_class;
		}
		// Class that aids the checking for a visited link. CSS applied temporarily by Linkify: a.linkify-check-visited:visited {overflow:auto;}
		settings.check_visited = 'linkify-check-visited';
		
		// Set the data store name to save the state.
		settings.store_name = 'linkify_state';
		
		// Check if style#linkify-style-element does not exist.
		if ($('head style#linkify-style-element').length == 0)
		{
			// Append some css to later check for a visited link.
			$('head').append('<style id="linkify-style-element" type="text/css">a.' + settings.check_visited + ':visited {overflow:auto;color:#f00;}</style>');
		}
		// Go through each section.
		return this.each(function()
		{
			// Save the section element for later use and prepare to capture the link uri.
			var section = this, uri = '', title = '', section_classes = [];
			
			// Check whether to linkify the section classes.
			if (settings.linkify)
			{
				// Check that section classes is not empty.
				if ((section_classes = $(this).attr('class').replace( /^\s+|\s+$/g, '').replace( /\s+/g,' ')))
				{
					// Get a section classes array.
					section_classes = section_classes.split(' ');
					
					for (var i = section_classes.length; --i > -1;)
					{
						if (section_classes[i] != settings.linkify_class)
						{
							section_classes[i] = section_classes[i] + '-' + settings.linkify_class;
						}
					}
				}
				else
				{
					section_classes = [];
				}
			}
			// Add the linkify class as none exists on the section.
			section_classes[section_classes.length] = settings.linkify_class;
			
			// Go through and add each section class to a section.
			for (var i = section_classes.length; --i > -1;)
			{
				$(this).addClass(section_classes[i]);
			}
			// With the nth section link, get its title, check for visited links and get the uri.
			$('a', this).eq(settings.link_index).each(function()
			{
				// Check if the link has a title. The script assumes that the section had no title attribute set.
				if ((title = $.trim($(this).attr('title'))))
				{
					// The link has a title, apply it to the section.
					$(section).attr('title', title);
				}
				// Check if the visited option class is wanted.
				if (settings.visited)
				{
					// Prepare the check to see if the link has been visited.
					$(this).addClass(settings.check_visited);
					
					// Check if the link has been visited.
					if ($(this).css('overflow') == 'auto')
					{
						// Go through each section class and add a visited class based on each.
						for (var i = section_classes.length; --i > -1;)
						{
							$(section).addClass(section_classes[i] + '-' + settings.visited_class);
						}
					}
					// Remove the visited class checker.
					$(this).removeClass(settings.check_visited);
				}
				// Get the uri of the link.
				uri = $(this).attr('href');
			});
			// Check if the focus option class is wanted.
			if (settings.focus)
			{
				// Section mouseover/focus function.
				function mouseoverFocus()
				{
					$(section).data(settings.store_name, $(section).data(settings.store_name) + 1);
	
					// Go through each section class and add a visited class based on each.
					for (var i = section_classes.length; --i > -1;)
					{
						$(section).addClass(section_classes[i] + '-' + settings.focus_class);
						
						// Check if a visited class is wanted.
						if (settings.visited && $(section).hasClass(section_classes[i] + '-' + settings.visited_class))
						{
							$(section).addClass(section_classes[i] + '-' + settings.visited_class + '-' + settings.focus_class);
						}
					}
					window.status = uri;
				};
				// Section mouseout/blur function.
				function mouseoutBlur()
				{
					$(section).data(settings.store_name, $(section).data(settings.store_name) - 1);
					
					// Check if the store equals 0.
					if ($(section).data(settings.store_name) == 0)
					{
						// Go through each section class and add a focus class based on each.
						for (var i = section_classes.length; --i > -1;)
						{
							$(section).removeClass(section_classes[i] + '-' + settings.focus_class);
							$(section).removeClass(section_classes[i] + '-' + settings.visited_class + '-' + settings.focus_class);
						}
						window.status = '';
					}
				}
				// Prepare some data for the section events. Assume that at initiation the section had neither focus nor mouseover.
				// Apply the section mouseover/focus and mouseout/blur functions.
				$(this).data(settings.store_name, 0).mouseover(mouseoverFocus).mouseout(mouseoutBlur);
				$('a', this).filter(
					function()
					{
						return $(this).attr('href') == uri;
					}
				).focus(mouseoverFocus).blur(mouseoutBlur);
			}
			// Check if the focus sub option class is wanted.
			if (settings.focus_sub)
			{
				// Sub section mouseover/focus function.
				function subMouseoverFocus()
				{
					$(this).data(settings.store_name, $(this).data(settings.store_name) + 1);
		
					// Go through each section class and add a focus sub class based on each.
					for (var i = section_classes.length; --i > -1;)
					{
						$(section).addClass(section_classes[i] + '-' + settings.focus_sub_class);
					}
					// Check if the link had a title.
					if (title)
					{
						// Remove the section title.
						$(section).attr('title', '');
					}
				}
				// Sub section mouseout/blur function.
				function subMouseoutBlur()
				{
					$(this).data(settings.store_name, $(this).data(settings.store_name) - 1);
					
					// Check if the store equals 0.
					if ($(this).data(settings.store_name) == 0)
					{
						// Go through each section class and remove a focus sub class based on each.
						for (var i = section_classes.length; --i > -1;)
						{
							$(section).removeClass(section_classes[i] + '-' + settings.focus_sub_class);
						}
						// Check if the link had a title.
						if (title)
						{
							// Set the section title.
							$(section).attr('title', title);
						}
					}
				}
				// Prepare some data for the links within a section. Assume that at initiation the section had neither focus nor mouseover.
				// Apply the sub section mouseover/focus and mouseout/blur functions, applies to the links within the section where the uri is not the indexed link uri.
				$('a', this).filter(
					function()
					{
						return $(this).attr('href') != uri;
					}
				).data(settings.store_name, 0).mouseover(subMouseoverFocus).focus(subMouseoverFocus).mouseout(subMouseoutBlur).blur(subMouseoutBlur);
			}
			// Apply the section click event.
			$(this).click(function()
			{
				// Check whether a selection was made.
				var check = false;
				if (window.getSelection)
				{
					if (window.getSelection() != '')
					{
						check = true;
					}
				}
				else if (document.selection.createRange().text != '')
				{
					check = true;
				}
				// Check whether a selection was made.
				if (!check)
				{
					window.location = uri;
				}
			});
		});
	}
})(jQuery);
