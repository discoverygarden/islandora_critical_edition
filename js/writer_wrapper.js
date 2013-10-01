/**
 * A wrapper sudo class that is ment to encapsulate islandora functionality
 * as it pertains to the CWRCWriter. This allows us to treat it more like a 
 * library. With the API unfinished, i have added function stubs to be called
 * from the writers 'Delegate'.
 */
Islandora = {
  // Initilize the writer, and get basic parameters for cwrc fedora integration.
  init_writer : function() {
    PID = Drupal.settings.islandora_critical_edition.page_pid;
    cwrc_params = {};
	
	writer = null;
	
	var baseUrl = window.location.protocol+'//'+window.location.host;
	var config = {
		delegator: IslandoraDelegator,
		cwrcRootUrl: baseUrl+'/'+Drupal.settings.islandora_critical_edition.module_base+'/CWRC-Writer/src/',
		schemas: {
			tei: {
				name: 'CWRC Basic TEI Schema',
				url: baseUrl+'/'+Drupal.settings.islandora_critical_edition.module_base+'/CWRC-Writer/src/'+'schema/CWRC-TEIBasic.rng',
				cssUrl: baseUrl+'/'+Drupal.settings.islandora_critical_edition.module_base+'/CWRC-Writer/src/'+'css/tei_converted.css'
			},
			events: {
				name: 'Events Schema',
				url: baseUrl+'/'+Drupal.settings.islandora_critical_edition.module_base+'/CWRC-Writer/src/'+'schema/events.rng',
				cssUrl: baseUrl+'/'+Drupal.settings.islandora_critical_edition.module_base+'/CWRC-Writer/src/'+'css/orlando_converted.css'
			},
			biography: {
				name: 'Biography Schema',
				url: baseUrl+'/'+Drupal.settings.islandora_critical_edition.module_base+'/CWRC-Writer/src/'+'schema/biography.rng',
				cssUrl: baseUrl+'/'+Drupal.settings.islandora_critical_edition.module_base+'/CWRC-Writer/src/'+'css/orlando_converted.css'
			},
			writing: {
				name: 'Writing Schema',
				url: baseUrl+'/'+Drupal.settings.islandora_critical_edition.module_base+'/CWRC-Writer/src/'+'schema/writing.rng',
				cssUrl: baseUrl+'/'+Drupal.settings.islandora_critical_edition.module_base+'/CWRC-Writer/src/'+'css/orlando_converted.css'
			}
		}
	};
	$.ajax({
		url: Drupal.settings.basePath + 'islandora/cwrcwriter/setup/' + PID,
		timeout: 3000,
		async:false,
		dataType: 'json',
		success: function(data, status, xhr) {
			cwrc_params = data;
			config.project = data;
			writer = new Writer(config);
			writer.init();
			// Initilize additional UI Elements
			init_ui();
			// Initilize shared canvas image annotation canvas processing.
			Islandora.Writer.setup_canvas(cwrc_params.pages[cwrc_params.position],
					init_canvas_div);
			Islandora.Writer.Document.load();
		    Islandora.Writer.init();
		    console.log('Pages: ' + JSON.stringify(cwrc_params.pages));
		},
		error: function() {
			console.log("Error");
		}
	});
  },
  Writer : {
    Document : {
      load: function() {
        // Calling load doc, which assigns a doc id (the page pid) and
        // calls the delegate function loadDocument().
        writer.fm.loadDocument(Drupal.settings.islandora_critical_edition.page_pid);
      },
      get: function() {
        return writer.getDocument();
      },
      Entities : {
        get_all: function() {
          // Return all entities.
        },
        get: function(id) {
          // Get the entity by id.
        },
        update: function(id) {
          // Update entity by id.
        },
        destroy: function(id) {
          // Remove entity by id.
        },
      },
      Annotations  : {
        load: function(OA_Annotations) {
          writer.load(OA_Annotations);
        },
        get: function() {
          return writer.getAnnotations();
        },
        add: function(rdf) {
          // Add new annotation.
        },
        update: function(rdf) {
          // Update existing annotation.
        },
        destroy: function(id) {
          // Destroy/delete annotation
        },
      },
    },
    init : function() {
      var anno_d = annotation_dialog();
      anno_d.dialog('close');
      maybe_config_create_annotation();
    },
    load_next_anno_page: function() {
		// Initilize shared canvas image annotation canvas processing.
    	
		Islandora.Writer.setup_canvas(cwrc_params.pages[cwrc_params.position],
				init_canvas_div);
//		console.log(Drupal.settings.islandora_critical_edition.base_url + 
//          '/islandora/object/??' +
//          cwrc_params.pages[cwrc_params.position] + 
//          '??/datastream/JPG/view');
		
      // Pagenation on images/annotations.
//      $('#annotations').children(":first").children(":first").attr('src', Drupal.settings.islandora_critical_edition.base_url + 
//          '/islandora/object/' +
//          cwrc_params.pages[cwrc_params.position] + 
//          '/datastream/JPG/view');
      Islandora.Writer.Document.load();
      writer.entitiesList.update();
    },
    setup_canvas : function(pagePid,callback) {
    	console.log("setup canvas page: " + pagePid);
      $.ajax({
            url: Drupal.settings.basePath + 'islandora/cwrcwriter/setup_canvas/' + pagePid,
            async: false,
            success: function(data, status, xhr) {
              islandora_canvas_params = data;
              console.log("canvas params: ");
              console.log(islandora_canvas_params);
              // Callback 'init_canvas_div' in startup.js.
              callback(data);
            },
            error: function() {
              alert("Please log in to host site.");
            },
            dataType: 'json'
          });
    },
  },
}
