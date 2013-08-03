
// Gets setup information from Islandora.

$('document').ready(function() {

  // Add the annotation dialog box early, so
  // the click handlers can be attached.
  var anno_d = annotation_dialog();
  anno_d.dialog('close');

  // Grab the pid, passed from the theme.inc file
  PID = Drupal.settings.islandora_critical_edition.page_pid;
  $.ajax({
    url: Drupal.settings.basePath + 'islandora/cwrcwriter/setup/' + PID,
    async: false,
    success: function(data, status, xhr) {
      cwrc_params = data;
    },
    error: function() {
      alert("Please log in to host site.");
    },
    dataType: 'json'
  });

  // Get initial positions of the text annotation div and separator.
  setReturnParams();
  $(this).attr("title", cwrc_params.title);
  setHeader();

  // Instantiate and initialize writer object.
  // Updated with schemaUrl
  writer = new Writer({
    'project': 'local',
    'schemaUrl': Drupal.settings.basePath + Drupal.settings.islandora_critical_edition.module_base
  });
  writer.init();
  init_canvas_div();
  openColumn();
  if (cwrc_params.position == 1) {
    $('#page-prev').css('opacity', '.6').addClass('disabled');
  }
  if (cwrc_params.position == cwrc_params.pages_count) {
    $('#page-next').css('opacity', '.6').addClass('disabled');
  }
  // build and populate page choice dropdown
  $('#page_selector').html('<select id="page_choose"></select>');
  $.each(cwrc_params.pages, function(key, value) {
    $('#page_choose').append('<option  value="' + key + '">Seq# ' + key + '</option>');
  });

  // Synchronize displayed page with dropdown.
  var selector = "#page_choose option[value='" + cwrc_params.position + "']";
  $(selector).attr('selected', 'selected');

  // add page choice behavior to dropdown
  $('#page_choose').change(function(e) {
    if (!writer.editor.isNotDirty) {
      answer = confirm("You have unsaved changes.  Click Cancel to stay on page, OK to leave page");
      if (!answer) {
        selector = "#page_choose option[value='" + cwrc_params.position + "']";
        $(selector).removeAttr('selected');
        w.editor.isNotDirty = 1;
        $('#page_choose').val('10');
        return;
      }
    }
    selector = "#page_choose option[value='" + cwrc_params.position + "']";

    setReturnParams();
    cwrc_params.position = $('#page_choose :selected').attr('value');
    openColumn();
    PID = cwrc_params.pages[ cwrc_params.position];
    writer.fm.loadEMICDocument();
    init_canvas_div();
    setHeader();
    $('#page-prev').css('opacity', '1').removeClass('disabled');
    $('#page-next').css('opacity', '1').removeClass('disabled');

    if (cwrc_params.position == 1) {
      $('#page-prev').css('opacity', '.6').addClass('disabled');
    }
    if (cwrc_params.position == cwrc_params.page_count) {
      $('#page-next').css('opacity', '.2').addClass('disabled');
    }
    selector = "#page_choose option[value='" + cwrc_params.position + "']";
    $(selector).attr('selected', 'selected');
  });

  $('#page-prev').click(function(e) {
    e.preventDefault();
    if (!writer.editor.isNotDirty) {
      answer = confirm("You have unsaved changes.  Click Cancel to stay on page, OK to leave.");
      if (!answer) {

        return;
      }
    }
    if (cwrc_params.position > 1) {
      $('#page-next').css('opacity', '1').removeClass('disabled');

      var selector = "#page_choose option[value='" + cwrc_params.position + "']";
      $(selector).removeAttr('selected');
      setReturnParams()
      cwrc_params.position--;
      openColumn();
      selector = "#page_choose option[value='" + cwrc_params.position + "']";
      $(selector).attr('selected', 'selected');
      PID = cwrc_params.pages[ cwrc_params.position];
      writer.fm.loadEMICDocument();
      init_canvas_div();
      setHeader();
      if (cwrc_params.position == 0) {
        $('#page-prev').css('opacity', '.6').addClass('disabled');
      }
    }
  });
  $('#page-next').click(function(e) {
    e.preventDefault();
    if (!writer.editor.isNotDirty) {
      answer = confirm("You have unsaved changes.  Click Cancel to stay on page, OK to leave");
      if (!answer) {
        return;
      }
    }

    if (cwrc_params.position < cwrc_params.page_count) {
      $('#page-prev').css('opacity', '1').removeClass('disabled');

      var selector = "#page_choose option[value='" + cwrc_params.position + "']";
      $(selector).removeAttr('selected');
      setReturnParams();
      cwrc_params.position++;
      openColumn();
      selector = "#page_choose option[value='" + cwrc_params.position + "']";
      $(selector).attr('selected', 'selected');
      PID = cwrc_params.pages[ cwrc_params.position];

      writer.fm.loadEMICDocument();
      init_canvas_div();
      setHeader();
      if (cwrc_params.position == cwrc_params.page_count) {
        $('#page-next').css('opacity', '.2').addClass('disabled');
      }
    }
  });
  $(function() {
    $.contextMenu({
      selector: '.comment_title',
      callback: function(key, options) {

        var urn = $(this).parent('div').attr('urn');
        var title = $(this).text().substring(2, 100);
        title = title.trim();

        var comment_text = $(this).next('.comment_text');
        var anno_type = comment_text.find('.comment_type').text();

        if (key == 'delete') {
          if (confirm("Permananently Delete Annotation '" + title + "'")) {
            islandora_deleteAnno(urn);
          }

        }

        if (key == 'edit') {
          $(this).addClass('annotation-opened').next().show();
          var annotation = comment_text.find('.comment_content').text();
          var pm = $(this).find('.comment_showhide');
          if (pm.text() == '+ ') {
            pm.empty().append('- ');
            var id = $(this).attr('id').substring(5, 100);
            var canvas = $(this).attr('canvas');
            paint_commentAnnoTargets(this, canvas, id);
          }
          startEditting(title, annotation, anno_type, urn)
        }
      },
      items: {
        "edit": {
          name: "Edit",
          icon: "edit",
          accesskey: "e"
        },
        "delete": {
          name: "Delete annotation",
          icon: "delete"
        }
      }
    });
  });

  if (islandora_canvas_params.use_dropdown == 1) {
    $('#islandora_classification').empty();
    var sel = $('<select  id="anno_classification">').appendTo('#islandora_classification');
    $(islandora_canvas_params.categories).each(function() {
      value = this.toString();
      sel.append($("<option>").attr('value', value).text(value));
    });
  } else {
    $("#anno_classification").autocomplete({
      source: islandora_canvas_params.categories
    });
  }
});

function init_canvas_div() {

  pagePid = cwrc_params.pages[cwrc_params.position];
  $.ajax({
    url: Drupal.settings.basePath + 'islandora/cwrcwriter/setup_canvas/' + pagePid,
    async: false,
    success: function(data, status, xhr) {
      islandora_canvas_params = data;
    },
    error: function() {
      alert("Please log in to host site.");
    },
    dataType: 'json'

  });

  if (islandora_canvas_params.no_edit == true) {
    $('#create_annotation').hide();
  }
  opts.base = islandora_canvas_params.object_base;

  // Build and populate page choice dropdown.
  $('#canvas_page_selector').html('<select id="canvas_page_choose"></select>');
  $.each(islandora_canvas_params.pages, function(key, value) {
    $('#canvas_page_choose').append('<option  value="' + key + '">Page ' + (key + 1) + '</option>');
  });
  // build and populate page choice dropdown
  $('#canvas_page_selector').html('<select id="canvas_page_choose"></select>');
  $.each(islandora_canvas_params.pages, function(key, value) {
    $('#canvas_page_choose').append('<option  value="' + key + '">Page ' + (key + 1) + '</option>');
  });


  // RDF Initializationc
  var rdfbase = $.rdf(opts);
  topinfo['query'] = rdfbase;


  var l = $(location).attr('hash');
  var uriparams = {};
  var nCanvas = 1;
  var start = 0;
  if (l[0] == '#' && l[1] == '!') {
    // Process initialization
    var params = l.substr(2, l.length).split('&');
    for (var p = 0, prm; prm = params[p]; p++) {
      var tup = prm.split('=');
      var key = tup[0];
      var val = tup[1];
      if (key == 's') {
        start = parseInt(val);
        uriparams['s'] = start;
      } else if (key == 'n') {
        nCanvas = parseInt(val);
        uriparams['n'] = nCanvas;
      }
    }
  }
  topinfo['uriParams'] = uriparams

  // Initialize UI
  init_ui();
  // Setup a basic Canvas with explicit width to scale to from browser width
  initCanvas(nCanvas)
  // Manifest initialization.
  fetchTriples(islandora_canvas_params.manifest_url,
      rdfbase,
      cb_process_manifest);

  $('#color-picker-wrapper').click(function() {
    $('#anno_color_activated').attr('value', 'active');
  });
  $('.color-picker').miniColors();
  resizeColumnsDrag();
}

// @XXX openColumn and setReturnParams may not be necessary dependent on theme
//   need more investigation. Noticed different results with Garland and
//   Bartik.
/**
 * This will set the annoation panes' sizes and separator position.
 */
function openColumn() {
  $('.col3').css("display", "block");
  $('.col1').css("width", cwrc_params.text_annotation_width);
  $('#column-separator').css("left", cwrc_params.separator_pos);
}

/**
 * Used to preserve the width of the text annotation pane
 * and the leftedness of the seperator.
 */
function setReturnParams() {
  cwrc_params.text_annotation_width = $('.col1').css("width");
  cwrc_params.separator_pos = $('#column-separator').css("left");
}

/**
 * Sets clickable page header.
 *
 */
function setHeader() {
  var address = Drupal.settings.basePath + 'islandora/object/' + cwrc_params.pages[cwrc_params.position];
  var prolog = cwrc_params.title + ' - Seq# ';
  var epilog = '';
  if (cwrc_params.no_edit === false) {
    prolog = '<a style = "color:white" href = "' + address + '">' + cwrc_params.title + ' - Seq# ';
    epilog = '</a>';
  }
  $('#header h1').html(prolog + cwrc_params.position + epilog);
}
