(function ($) {
  Drupal.behaviors.CwrcFullWindow = {
    attach: function (context, settings){
      $('#full-window-button').click(function() {
        $('.islandora-crited-wrapper').toggleClass('islandora-crited-fullwindow');
        if ($(this).val() == Drupal.t('Full Window')) {
            $('#admin-menu-wrapper').hide();
            $(this).val(Drupal.t('Exit Full Window'));
            $('#cwrc_wrapper').css({
              height: '100%',
            });
        }
        else {
            $(this).val(Drupal.t('Full Window'));
            $('#admin-menu-wrapper').show();
            $('#cwrc_wrapper').css({
                height: '600',
              });
        }
        $('#cwrc_wrapper').layout().resizeAll();
      });
      $("#bookview_button").click(function(){
          location.href = Drupal.settings.basePath + 'islandora/object/' + Drupal.settings.islandora_critical_edition.book_pid;
      });
    }
  };
  // Listen for the 'esc' key.
  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
      if($('#full-window-button').val() == Drupal.t('Exit Full Window')) {
        $('.islandora-crited-wrapper').toggleClass('islandora-crited-fullwindow');
        $('#cwrc_wrapper').css({
            height: '600',
          });
        $('#cwrc_wrapper').layout().resizeAll();
        $('#full-window-button').val(Drupal.t('Full Window'));
      }
    }
  });
  
      // call resize function
})(jQuery);
//adapted from sc_init
var toid = null;
var startDate = 0;

var topinfo = {
  'canvasWidth' : 0, // scaled width of canvas in pixels
  'numCanvases' : 0, // number of canvases to display
  'current' : 0, // current idx in sequence
  'done': [], // URLs already processed
  'query' : null, // top level databank
  'sequence' : [], // Sequence list
  'sequenceInfo' : {}, // uri to [h,w,title]

  'annotations' : {
    'image':{},
    'text':{},
    'audio':{},
    'zone':{},
    'comment':{}
  },
  'lists' : {
    'image':{},
    'text':{},
    'audio':{},
    'zone':{},
    'comment':{}
  },
  'raphaels' : {
    'image':{},
    'text':{},
    'audio':{},
    'zone':{},
    'comment':{}
  },

  'zOrders' : {
    'image':1,
    'detailImage':1000,
    'text':2000,
    'audio':3000,
    'zone':4000,
    'comment':5000
  },
  'canvasDivHash' : {},
  'builtAnnos' : [],
  'paintedAnnos' : [],
  'audioAnno' : null,
  'waitingXHR' : 0
};


var SVG_NS = "http://www.w3.org/2000/svg";
var XLINK_NS = "http://www.w3.org/1999/xlink";

var opts = {
  base:'http://localhost/EmicShared/impl/',
  namespaces: {
    dc:'http://purl.org/dc/elements/1.1/',
    dcterms:'http://purl.org/dc/terms/',
    dctype:'http://purl.org/dc/dcmitype/',
    oa:'http://www.w3.org/ns/openannotation/core/',
    cnt:'http://www.w3.org/2008/content#',
    dms:'http://dms.stanford.edu/ns/',
    rdf:'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    ore:'http://www.openarchives.org/ore/terms/',
    exif:'http://www.w3.org/2003/12/exif/ns#'
  }
};


function initCanvas(nCanvas) {
  var w = $('#canvas-body').width();
  topinfo['origBodyWidth'] = w;
  $('#top_menu_bar').width(w-5);


  // Make n canvases. Multiple row logic:
  // 1: 1x1 2: 1x2 3: 1x3
  // 4: 2x2 5: 1x3+1x2 6: 2x3
  // 7: 1x4+1x3 8: 2x4 9: 3x3 (etc)

  var rows = Math.floor(Math.sqrt(nCanvas));
  var perrow = Math.ceil(nCanvas/rows);

  // Not sure what these lines were doing but broke scaling by breaking width.
  //var w = w/perrow - (5*perrow);
  var h = $(window).height() - 50;
  h = h/rows;
  for (var x=0;x<nCanvas;x++) {
    $('#canvases').append('<div id="canvas_' + x + '" class="canvas"></div>')
    $('#canvas_'+x).width(w);
    $('#canvas_'+x).height(h);
    if (x != 0) {
      if (x % perrow == 0) {
        // below previous first in row
        $('#canvas_'+x).position({
          'of':'#canvas_' + (x-perrow),
          'my':'left top',
          'at':'left bottom',
          'collision':'none',
          'offset': '0 10'
        });
      } else {
        $('#canvas_' +x).position({
          'of':'#canvas_' + (x-1),
          'my':'left top',
          'at':'right top',
          'collision':'none',
          'offset': '10 0'
        });
      }
    }
  }
  topinfo['canvasWidth'] = w;
  topinfo['numCanvases'] = nCanvas;
  if (nCanvas > 2) {
    // Default text off if lots of canvases
    $('#check_show_text').attr('checked',false);
  }
};

var timeout = false;
var delta = 200;
function resizeCanvas() {
  // Updated fix to prevent needless server calls
  var w = $('#canvas-body').width();
  topinfo['bodyWidth'] = w;
  if(timeout === false) {
    timeout = true;
    closeAndEndAnnotating();
    window.setTimeout(maybeResize, delta);
  }
}

function maybeResize() {
    if(w == topinfo['bodyWidth'] && Math.abs(topinfo['origBodyWidth']-w) > 20) {
      initCanvas(topinfo['numCanvases']);
    } else {
      timeout = false;
      var w = $('#canvas-body').width();
      var b = topinfo['origBodyWidth'];
      topinfo['bodyWidth'] = 0;
      if (w != b) {
        initCanvas(topinfo['numCanvases']);
        $('.base_img').children(":first").width(w);
        $('.base_img').children(":first").css("height", "auto");
        $('.base_img').css("height", $('.base_img').children(":first").height());
        $('#canvas_0').css("width", (w));
        $('#canvas_0').css("height", $('.base_img').children(":first").height());
      }
    }
  }
////Refresh Canvas if browser is resized
$(window).resize(function() {
    // call resize function
    resizeCanvas();
});
