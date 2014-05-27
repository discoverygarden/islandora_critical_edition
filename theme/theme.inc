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
 * $variables['anno_list_pane']
 * $variables['anno_img_pane']
 * $variables['images_path']
 * $variables['custom_js']
 */
function islandora_critical_edition_preprocess_islandora_critical_edition(&$variables) {
  // To the markup editor!!!
  $islandora_markup_editor_path = drupal_get_path('module', 'islandora_markup_editor');
  // Use this flag to include your own init .js scripts.
  $variables['custom_js'] = TRUE;
  theme('islandora_markup_editor', $variables);
  // Custom JS for critical edition.
  $variables['cwrc_lib_path'] = $islandora_markup_editor_path;
  islandora_critical_edition_add_js($variables);
}

/**
 * Abstraction of preprocessing functions.
 *
 * @global String $base_url
 * @global User $user
 *
 * @param array $variables
 *   Display variables
 */
function islandora_critical_edition_add_js(&$variables, $media = FALSE) {
  global $base_url;
  global $user;

  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  module_load_include('inc', 'islandora_markup_editor', 'includes/utilities');
  module_load_include('inc', 'islandora_critical_edition', 'includes/utilities');
  module_load_include('inc', 'islandora_image_annotation', 'includes/utils');
  module_load_include('inc', 'islandora_critical_edition', 'includes/schema_table_utils');
  module_load_include('inc', 'php_lib', 'DOMHelpers');
  // Islandora Image Annotation base path, required module.
  $image_annotation_module_path = drupal_get_path('module', 'islandora_image_annotation');
  $islandora_markup_editor_module_path = drupal_get_path('module', 'islandora_markup_editor');
  $pages = islandora_paged_content_get_pages($variables['islandora_object']);
  $pids = array_keys($pages);

  $schema_object = islandora_critical_edition_construct_schema_config_object();
  $page_obj = islandora_object_load($pids[0]);
  $doc_process_instructions = islandora_markup_editor_fetch_tei_processing_instruction($page_obj, 'CWRC');

  // Supports legacy tei datastreams.
  $schema = file_create_url("$islandora_markup_editor_module_path/CWRC-Writer/src/schema/CWRC-TEIBasic.rng");
  $schema_url = isset($doc_process_instructions['href']) ? $doc_process_instructions['href'] : $schema;
  // This is silly. We need to override the default tei schema with our own.
  $schema_object['schemas']['tei'] = array(
    'cssUrl' => file_create_url("$islandora_markup_editor_module_path/CWRC-Writer/src/css/tei_converted.css"),
    'name' => 'tei',
    'url' => $schema_url,
  );
  $schema_pref = islandora_critical_edition_get_user_selected_schema($user->name, $pids[0]);

  dom_document_pretty_print_include_files();
  // Local Critical Editions module path.
  $critical_edition_module_path = drupal_get_path('module', 'islandora_critical_edition');

  // Get the schema for the first page.
  drupal_add_js(array(
    'islandora_critical_edition' => array(
      'page_schema' => islandora_critical_edition_get_user_selected_schema($user->name, $pids[0]))), 'setting');

  $validate_path = variable_get('islandora_critical_edition_validate_url', '/validator/validate.html');
  // Use the theme files from image annotation for annotation list
  // and image annotation pane's.
  $variables['anno_list_pane'] = theme('islandora_anno_list_pane');
  $variables['anno_img_pane'] = theme('islandora_anno_image_pane');

  // Fill additional session variables.
  $variables['images_path'] = url($variables['cwrc_lib_path'] . '/CWRC-Writer/src/img/', array('absolute' => TRUE));
  $image_anno_images = $image_annotation_module_path . '/shared_canvas/imgs/';
  drupal_add_js(array('islandora_critical_edition' => array('image_anno_img' => $image_anno_images)), 'setting');
  drupal_add_js(array(
    'islandora_critical_edition' => array(
      'book_pid' => islandora_critical_edition_get_object_of_critical_edition(
          $variables['islandora_object']))), 'setting');

  // To avoid hard coded values in js, this is the best option.
  drupal_add_js(array('islandora_critical_edition' => array('module_base' => $variables['cwrc_lib_path'])), 'setting');
  drupal_add_js(array('islandora_critical_edition' => array('schema_object' => $schema_object)), 'setting');
  drupal_add_js(array('islandora_critical_edition' => array('schema_pref' => $schema_pref)), 'setting');
  drupal_add_js(array('islandora_critical_edition' => array('images_path' => $variables['images_path'])), 'setting');
  drupal_add_js(array('islandora_critical_edition' => array('base_url' => $base_url)), 'setting');
  drupal_add_js(array('islandora_critical_edition' => array('validate_path' => $validate_path)), 'setting');
  drupal_add_js(array('islandora_critical_edition' => array('page_pid' => $pids[0])), 'setting');

  // Include common js/css for shared canvas.
  islandora_image_annotation_include_common_js();
  islandora_image_annotation_include_common_css();

  drupal_add_js($critical_edition_module_path . "/js/writer_backend_delegate.js");
  drupal_add_js($critical_edition_module_path . '/js/writer_wrapper.js');
  drupal_add_js($critical_edition_module_path . "/js/dialog_text_image_anno.js");
  drupal_add_js($critical_edition_module_path . "/js/startup.js");
  drupal_add_js($critical_edition_module_path . "/js/init.js");

  drupal_add_css($critical_edition_module_path . "/css/islandora_critical_edition_editor.css");
  drupal_add_css($critical_edition_module_path . "/css/islandora_critical_edition.css");
}
