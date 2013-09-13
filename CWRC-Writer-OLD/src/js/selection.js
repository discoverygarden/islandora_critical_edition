function Selection(config) {
	
	var w = config.writer;
	
	jQuery(config.parentId).append('<div id="selection" style="margin-left: 10px;"></div>');
	jQuery(document.body).append('<div id="selectionContents" style="display: none;"></div>');
	
	var selection = {};
	
	function updateSelection(ed, evt) {
		var range = ed.selection.getRng(true);
		var contents = range.cloneContents();
		jQuery('#selectionContents').html(contents);
		var escapedContents = w.u.escapeHTMLString(jQuery('#selectionContents')[0].innerHTML);
		if (escapedContents.length < 100000) {
			jQuery('#selection').html('<pre>'+escapedContents+'</pre>');
			jQuery('#selection > pre').snippet('html', {
				style: 'typical',
				transparent: true,
				showNum: false,
				menu: false
			});
		} else {
			jQuery('#selection').html('<pre>The selection is too large to display.</pre>');
		}
	}
	
	selection.init = function() {
		w.editor.onNodeChange.add(updateSelection);
	};
	
	return selection;
}