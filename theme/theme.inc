<?php
/**
 * @file
 * This file contains themeing functions for islandora_critical_edition.
 */

/**
 * Implements hook_preprocess_islandora_critical_edition().
 *
 * Prepares variables for the CWRC viewer.
 * $variables['islandora_object']
 */
function islandora_critical_edition_preprocess_islandora_critical_edition(&$variables) {
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  module_load_include('inc', 'islandora_critical_edition', 'includes/utilities');
  $module_path = drupal_get_path('module', 'islandora_critical_edition');

  $pages = islandora_paged_content_get_pages($variables['islandora_object']);
  $pids = array_keys($pages);

  $variables['images_path'] = url($module_path . '/cwrcwriter/resources', array('absolute' => TRUE));
  $variables['viewer_url'] = url($module_path .
                                 "/cwrcwriter/resources/index.php", array(
                                   'query' => array(
                                     'PID' => $pids[0])));
  drupal_add_js(array(
      'islandora_critical_edition' => array(
        'book_pid' => islandora_critical_edition_get_object_of_critical_edition(
          $variables['islandora_object']))), 'setting');

  drupal_add_js(array(
      'islandora_critical_edition' => array(
        'images_path' => $variables['images_path'])), 'setting');
  // Passing the page pid, instead of getting if from the
  // URL on the javascript side.
  drupal_add_js(array(
      'islandora_critical_edition' => array(
        'page_pid' => $pids[0])), 'setting');

  // To avoid hard coded values in js, this is the best option.
  drupal_add_js(array(
      'islandora_critical_edition' => array(
        'module_base' => $module_path)), 'setting');

  drupal_add_css($module_path . '/cwrcwriter/css/critical_edition.css');
  drupal_add_css($module_path . '/cwrcwriter/resources/css/style_2.css');
  drupal_add_css($module_path . '/cwrcwriter/resources/smoothness/jquery-ui-1.8.13.custom.css');
  drupal_add_css($module_path . '/cwrcwriter/resources/js/snippet/jquery.snippet.css');
  drupal_add_css($module_path . '/cwrcwriter/resources/impl/js/ContextMenu/src/jquery.contextMenu.css');
  drupal_add_css($module_path . '/cwrcwriter/resources/impl/css/jquery.miniColors.css');

  drupal_add_css($module_path . '/cwrcwriter/resources/impl/css/sc.css');
  drupal_add_css($module_path . '/cwrcwriter/resources/impl/css/emic_canvas.css');
  drupal_add_css($module_path . '/cwrcwriter/resources/css/screen.css');
  drupal_add_css($module_path . '/cwrcwriter/resources/css/style.css');

  // Add dependent javascript.
  drupal_add_js($module_path . '/cwrcwriter/js/critical_edition.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/impl/js/jquery/jquery.svg.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/jquery/jquery-1.7.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/jquery/jquery-ui-1.8.13.custom.min.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/jquery/jquery.contextmenu.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/jquery/jquery.watermark.min.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/tinymce/jscripts/tiny_mce/jquery.tinymce.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/jstree/jquery.hotkeys.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/jstree/jquery.jstree.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/snippet/jquery.snippet.min.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/dialogs/dialog_settings.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/editor.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/dialog.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/filemanager.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/structuretree.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/entitieslist.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/relations.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/js/resize-columns.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/Islandora/js/startup.js');

  drupal_add_js($module_path . '/cwrcwriter/resources/Islandora/js/dialog_annotate.js');

  drupal_add_js($module_path . '/cwrcwriter/resources/impl/js/jquery.rdfquery.rdfa.min-1.1.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/impl/js/jquery.rdf.turtle.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/impl/js/jquery.touchSwipe-1.2.4.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/impl/js/raphael.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/impl/js/scale.raphael.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/impl/js/uuid.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/impl/js/ContextMenu/src/jquery.contextMenu.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/impl/stable/islandora_emic_init.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/impl/stable/sc_ui.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/impl/stable/sc_utils.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/impl/stable/sc_rdf.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/impl/stable/sc_rdfjson.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/impl/stable/sc_create.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/impl/stable/sc_pastebin.js');
  drupal_add_js($module_path . '/cwrcwriter/resources/impl/js/jquery/jquery.miniColors.js');
}
