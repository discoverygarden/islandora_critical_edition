function Relations(config) {
	
	var w = config.writer;
	
	jQuery(config.parentId).append('<div id="relations" class="tabWithLayout">'+
			'<div class="ui-layout-center"><ul class="relationsList"></ul></div>'+
			'<div class="ui-layout-south tabButtons">'+
			'<button>Add Relation</button><button>Remove Relation</button>'+
			'</div>'+
		'</div>');
	jQuery(document.body).append(''+
		'<div id="relationsMenu" class="contextMenu" style="display: none;"><ul>'+
		'<li id="removeRelation"><ins style="background:url(img/cross.png) center center no-repeat;" />Remove Relation</li>'+
		'</ul></div>'
	);
	
	jQuery('#relations div.ui-layout-south button:eq(0)').button().click(function() {
		w.dialogs.show('triple');
	});
	jQuery('#relations div.ui-layout-south button:eq(1)').button().click(function() {
		var selected = jQuery('#relations ul li.selected');
		if (selected.length == 1) {
			var i = selected.data('index');
			w.triples.splice(i, 1);
			pm.update();
		} else {
			w.dialogs.show('message', {
				title: 'No Relation Selected',
				msg: 'You must first select a relation to remove.',
				type: 'error'
			});
		}
	});
	
	var pm = {
		currentlySelectedNode: null
	};
	
	pm.layout = jQuery('#relations').layout({
		defaults: {
			resizable: false,
			slidable: false,
			closable: false
		},
		south: {
			size: 'auto',
			spacing_open: 0
		}
	});
	
	/**
	 * @memberOf pm
	 */
	pm.update = function() {
		jQuery('#relations ul').empty();
		var relationsString = '';
		for (var i = 0; i < w.triples.length; i++) {
			var triple = w.triples[i];
			relationsString += '<li>'+triple.subject.text+' '+triple.predicate.text+' '+triple.object.text+'</li>';
		}
		
		jQuery('#relations ul').html(relationsString);
		
		jQuery('#relations ul li').each(function(index, el) {
			jQuery(this).data('index', index);
		}).click(function() {
			jQuery(this).addClass('selected').siblings().removeClass('selected');
		}).contextMenu('relationsMenu', {
			bindings: {
				'removeRelation': function(r) {
					var i = jQuery(r).data('index');
					w.triples.splice(i, 1);
					pm.update();
				}
			},
			shadow: false,
			menuStyle: {
			    backgroundColor: '#FFFFFF',
			    border: '1px solid #D4D0C8',
			    boxShadow: '1px 1px 2px #CCCCCC',
			    padding: '0px',
			    width: '105px'
			},
			itemStyle: {
				fontFamily: 'Tahoma,Verdana,Arial,Helvetica',
				fontSize: '11px',
				color: '#000',
				lineHeight: '20px',
				padding: '0px',
				cursor: 'pointer',
				textDecoration: 'none',
				border: 'none'
			},
			itemHoverStyle: {
				color: '#000',
				backgroundColor: '#DBECF3',
				border: 'none'
			}
		});
	};
	
	return pm;
};