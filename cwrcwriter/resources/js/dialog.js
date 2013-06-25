var DialogManager = function(config) {
	var w = config.writer;
	
	var currentType = null;
	
	var dialogs = null;
	
	// Added a property to 'cofig' called enpoint, why not?
	var scripts = [config.endpoint + 'dialogs/dialog_addevent.js', 
	               config.endpoint + 'dialogs/dialog_addorg.js', 
	               config.endpoint + 'dialogs/dialog_addperson.js', 
	               config.endpoint + 'dialogs/dialog_addplace.js',
	               config.endpoint + 'dialogs/dialog_annotate.js',
	               config.endpoint + 'dialogs/dialog_date.js', 
	               config.endpoint + 'dialogs/dialog_message.js', 
	               config.endpoint + 'dialogs/dialog_note.js', 
	               config.endpoint + 'dialogs/dialog_search.js',
	               config.endpoint + 'dialogs/dialog_title.js', 
	               config.endpoint + 'dialogs/dialog_triple.js', 
	               config.endpoint + 'dialogs/dialog_teiheader.js'];
	var loadCount = 0;
	for (var i = 0; i < scripts.length; i++) {
		var url = scripts[i];
		$.getScript(url, function(data, status) {
			loadCount++;
			console.log("loadcount: " + loadCount);
			if (loadCount == scripts.length) {
				init();
			}
		});
	}
	
	var init = function() {
		//console.log("init config for dialogs: " + JSON.stringify(config));
		dialogs = {
			message: new MessageDialog(config),
			search: new SearchDialog(config),
			note: new NoteDialog(config),
			title: new TitleDialog(config),
			date: new DateDialog(config),
			addperson: new AddPersonDialog(config),
			addplace: new AddPlaceDialog(config),
			addevent: new AddEventDialog(config),
			addorg: new AddOrganizationDialog(config),
			triple: new TripleDialog(config),
			annotate: new AnnotationDialog(),
			//teiheader: new TeiHeaderDialog(config)
		};
		console.log("Created dialogs ");
		dialogs.person = dialogs.search;
		dialogs.place = dialogs.search;
		dialogs.event = dialogs.search;
		dialogs.org = dialogs.search;
		dialogs.citation = dialogs.note;
	};
	
	return {
		getCurrentType: function() {
               
			return currentType;
		},
		show: function(type, config) {
			console.log("dialog config: " + JSON.stringify(config));
			console.log("type: " + type);
			if (dialogs[type]) {
				currentType = type;
				dialogs[type].show(config);
			}
		},
		confirm: function(config) {
			currentType = 'message';
			dialogs.message.confirm(config);
		},
		hideAll: function() {
			for (var key in dialogs) {
				dialogs[key].hide();
			}
		}
	};
};