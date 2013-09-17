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
		delegator: Delegator,
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
		},
		error: function() {
			console.log("Error");
		}
	});
  },
  Writer : {
    Document : {
      load: function() {
    	  console.log('page pid: ' + Drupal.settings.islandora_critical_edition.page_pid);
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
    	// Load the next page document.
    	Islandora.Writer.Document.load();
    	// Update entities list.
        writer.entitiesList.update();
        console.log("page being loaded: " + islandora_canvas_params.pages);
      // Pagenation on images/annotations.
      $('#annotations').children(":first").children(":first").attr('src', Drupal.settings.islandora_critical_edition.base_url + 
          '/islandora/object/' +
          islandora_canvas_params.pages[cwrc_params.position - 1] + 
          '/datastream/JPG/view');
    },
    Delegate : {
      lookupEntity : function(params, callback) {
        var type = params.type;
        var query = params.query;
        var lookupService = params.lookupService;
        if (lookupService == 'project') {
          jQuery.ajax({
            url: cwrc_params.entities_search_callback +'/'+ type + '/' + query,
            data: {"entities_query":query},
            dataType: 'text json',
            success: function(data, status, xhr) {
              if (jQuery.isPlainObject(data)) data = [data];
              if (data != null) {
                callback.call(writer, data);
              } else {
                callback.call(writer, []);
              }
            },
            error: function(xhr, status, error) {
              if (status == 'parsererror') {
                var lines = xhr.responseText.split(/\n/);
                if (lines[lines.length-1] == '') {
                  lines.pop();
                }
                var string = lines.join(',');
                var data = jQuery.parseJSON('['+string+']');
                callback.call(writer, data);
              } else {
                callback.call(writer, null);
              }
            }
          });
        } else if (lookupService == 'viaf') {
          jQuery.ajax({
            url: 'http://viaf.org/viaf/AutoSuggest',
            data: {
              query: query
            },
            dataType: 'jsonp',
            success: function(data, status, xhr) {
              if (data != null && data.result != null) {
                callback.call(w, data.result);
              } else {
                callback.call(w, []);
              }
            },
            error: function() {
              callback.call(w, null);
            }
          });
        }
      },
      validate : function (callback) {
        // TODO: implement a true validator service/html page to hit.
        var docText = writer.fm.getDocumentContent(false);
        jQuery.ajax({
          url: writer.baseUrl+'services/validator/validate.html',
          type: 'POST',
          dataType: 'XML',
          data: {
            sch: 'http://cwrc.ca/'+writer.validationSchema,
            type: 'RNG_XML',
            content: docText
          },
          success: function(data, status, xhr) {
            if (callback) {
              var valid = jQuery('status', data).text() == 'pass';
              callback(valid);
            } else {
              writer.validation.showValidationResult(data, docText);
            }
          },
          error: function() {
            // TODO: come up with a better handler.
            callback(true);
            console.log("invalid callback");
//             jQuery.ajax({
//              url : 'xml/validation.xml',
//              success : function(data, status, xhr) {
//                if (callback) {
//                  var valid = jQuery('status', data).text() == 'pass';
//                  callback(valid);
//                } else {
//                  w.validation.showValidationResult(data, docText);
//                }
//              }
//            }); 
            //console.log("callback: " + callback);
//            w.dialogs.show('message', {
//              title: 'Error',
//              msg: 'An error occurred while trying to validate the document.',
//              type: 'error'
//            });
          },
        });
      },
    },
    setup_canvas : function(pagePid,callback) {
      $.ajax({
            url: Drupal.settings.basePath + 'islandora/cwrcwriter/setup_canvas/' + pagePid,
            async: true,
            success: function(data, status, xhr) {
              islandora_canvas_params = data;
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