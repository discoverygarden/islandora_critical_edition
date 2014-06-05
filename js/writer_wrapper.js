/**
 * A wrapper sudo class that is ment to encapsulate islandora functionality
 * as it pertains to the CWRCWriter. This allows us to treat it more like a
 * library. With the API unfinished, i have added function stubs to be called
 * from the writers 'Delegate'.
 */
var islandoraCWRCWriter = {
  // Initilize the writer, and get basic parameters for cwrc fedora integration.
  init_writer: function() {
	  // This funcitonality needed to be moved to starup.js. This wrapper class
	  // in general will need to be refactored to fit the new CWRC-Writer library.
  },
  Writer: {
    writer_valid_doc: 0,
    set_is_doc_valid: function(is_valid) {
      this.writer_valid_doc = is_valid;
    },
    get_is_doc_valid: function() {
      return this.writer_valid_doc;
    },
    set_user_schema: function() {
      $.ajax({
        dataType: 'json',
        dataType: 'text',
            data: {
          "valid": islandoraCWRCWriter.Writer.get_is_doc_valid(),
        },
        url: Drupal.settings.basePath + 'islandora/cwrc/' + PID + '/schema/' + writer.schemas[writer.schemaId]['pid'],
        success: function(data, status, xhr) {
          console.log(data);
        },
        error: function(xhRequest, ErrorText, thrownError) {
          console.log(ErrorText);
        },
      });
    },
    Document: {
      load: function() {
    	  console.log(PID);
    	  console.log(writer);
        // Calling load doc, which assigns a doc id (the page pid) and
        // calls the delegate function loadDocument().
        writer.fileManager.loadDocument(PID);
      },
      get: function() {
        return writer.getDocument();
      },
    },
    load_next_anno_page: function() {
      islandoraCWRCWriter.Writer.setup_canvas(cwrc_params.pages[cwrc_params.position],
          init_canvas_div);
      // Initilize shared canvas image annotation canvas processing.
      islandoraCWRCWriter.Writer.Document.load();
      writer.entitiesList.update();
    },
    setup_canvas: function(pagePid, callback) {
      $.ajax({
        url: Drupal.settings.basePath + 'islandora/cwrcwriter/setup_canvas/' + pagePid,
        async: false,
        success: function(data, status, xhr) {
          islandora_canvas_params = data;
          callback(data);
          // Callback for text image linking.
          $('.canvas_annotation').mouseup(function() {
            var anno_urn = $(this).attr('urn');
            var entities = $('#entities > ul > li').find('div[class="info"]');
            for (var i = 0; i < entities.length; i++) {
              var arr = $(entities[i]).children().first().children();
              var innerText = $(arr[3]).text();
              var uuid = innerText.replace("uuid: ", "");
              if (anno_urn == uuid) {
                $('#anno_' + uuid).unbind('click');
                $('#anno_' + uuid).click(function() {
                  var entity_id = get_tag_id($(this).parent().attr('urn'));
                  writer.highlightEntity(entity_id[0]);
                }).next().hide();
              }
            }
          });
        },
        error: function() {
          //alert("Please log in to host site.");
        },
        dataType: 'json'
      });
    },
    Extensions: {
      text_image_linking: function() {
        var img_local = Drupal.settings.basePath +
            Drupal.settings.islandora_critical_edition.module_base;
        if ($('#editor_addtxtimglnk').length == 0) {
          // Hack to add the image text linking to the tinymce toolbar.
          $('#editor_toolbar1 tr td:first').after('<td style="position: relative">' +
              '<a id="editor_addtxtimglnk" class="mceButton wideButton mceButtonEnabled addtextimganno" title="Tag Text Annotation" aria-labelledby="editor_addperson_voice" onmousedown="return false;" href="javascript:;" role="button" tabindex="-1">' +
              '<span class="mceIcon wideButton">' +
              '<img class="mceIcon" alt="Tag Person" src="' + img_local + '/img/img_text.png">' +
              '</span></a><td>');
          $('#editor_addtxtimglnk').click(function() {
            
            islandoraCWRCWriter.Writer.Extensions.textImageAnnotation();
          });
        }
      },
      text_image_linking_show_highlight: function(tag) {
        var arr = $(tag).find('div[class="info"]').children().first().children();
        var innerText = $(arr[3]).text();
        var uuid = innerText.replace("uuid: ", "");
        var canvas = $('#canvas_0').attr('canvas');
        var annos = topinfo['annotations']['comment'][canvas];
        // Condition and loop are required to account for a
        // timing issue in ajax.
        if (annos) {
          for (var a = 0, anno; anno = annos[a]; a++) {
            if (anno.id == 'urn:uuid:' + uuid) {
              //$('#anno_' + uuid)
              var pm = $('#anno_' + uuid).find('.comment_showhide');
              if (pm.text() == '+ ') {
                $('#anno_' + uuid).toggleClass('annotation-opened').next().toggle();
                pm.empty().append('- ');
                var id = $('#anno_' + uuid).attr('id').substring(5, 100);
                var canvas = $('#anno_' + uuid).attr('canvas');
              }
              paint_commentAnnoTargets($('#anno_' + uuid), 'canvas_0', uuid, "TextImageLink");
            }
          }
        }
      },
      text_image_linking_hide_highlight: function(tag) {
        var arr = $(tag).find('div[class="info"]').children().first().children();
        var innerText = $(arr[3]).text();
        var uuid = innerText.replace("uuid: ", "");
        var pm = $('#anno_' + uuid).find('.comment_showhide');
        if (pm.text() == '- ') {
          $('#anno_' + uuid).toggleClass('annotation-opened').next().toggle();
          $('.svg_' + uuid).remove();
          var c = $('#anno_' + uuid).find('.mycolor');
          svgAreaColors.push(c.attr('color'));
          c.remove();
          pm.empty().append('+ ');
        }
      },
      textImageAnnotation: function() {
        var result = writer.utilities.isSelectionValid();
        if (result == writer.VALID) {
          writer.editor.currentBookmark = writer.editor.selection.getBookmark(1);
          // 'query' represents the selected text.
          var query = writer.editor.currentBookmark.rng.toString();
          // create the dialog, and show it.
          var data = {
            title: writer.entitiesModel.getTitle('person'),
            pos: writer.editor.contextMenuPos,
            query: query
          };
          text_image_anno_dialog(data);
        }
        else {
          console.log("waaa??");
          writer.showError(result);
        }
      },
    },
  }
}

/**
 * Get the schema name for the given schema id.
 *
 * @param schema_pid
 * @returns string
 */
function get_schema_id_for_pid(schema_pid, writer) {
  if (schema_pid) {
    for (var key in writer.schemas) {
      // if we find the right pid, and the schema is valid, use that schema. && Drupal.settings.islandora_critical_edition.schema_pref['valid'] == 1
      if (writer.schemas[key]['pid'] == schema_pid) {
        return writer.schemas[key];
      }
    }
  }

  // Return the basic TEI by default.
  return 'CWRC-TEIBasicSchema';
}

/**
 * Get the Tag id for the given image entity's uuid.
 *
 * @param uuid
 * @returns {Array}
 */
function get_tag_id(uuid) {
  var arr = new Array();
  var name = "";
  $('.entitiesList').children().each(function() {
    //this is the entity name
    name = $(this).attr('name');
    if ($(this).find('div[class="info"]')) {
      var inner_data = $(this).find('div[class="info"]').children().last().children().last().text();
      if (inner_data.indexOf(uuid) > -1) {
        arr.push(name);
      }
    }
  });
  return arr;
}
