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
      $.ajax({
        url: Drupal.settings.basePath + 'islandora/cwrcwriter/setup/' + PID,
        async: false,
        success: function(data, status, xhr) {
          cwrc_params = data;
          // Hack to work with unfinished API.
          // In the API, '-X_X_X-' is replaced with the 
          // documents current id, for us, a PID.
          // This and other endpoints needs to be exposed
          // in the API via a Delegator callback.
          cwrc_params.BASE_PATH = Drupal.settings.basePath + 'islandora/object/-X_X_X-/datastream/CWRC/view';
          writer = new Writer({
            project: data,
            delegator: Delegator
          });
          Islandora.Writer.init();
          
          // Located in 'startup.js'
          init_ui();
          Islandora.Writer.setup_canvas(cwrc_params.pages[cwrc_params.position],
                                        init_canvas_div);
        },
        error: function() {
          alert("Please log in to host site.");
        },
        dataType: 'json'
      });
  },
  Writer : {
    Document : {
      load: function(docContent, schemaURI) {
        writer.loadDocument(docContent, schemaURI);
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
      writer.init();
    },
    load_next_anno_page: function() {
    	writer.entitiesList.update();
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