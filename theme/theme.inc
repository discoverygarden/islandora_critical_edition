<?php

/**
 * @file
 * This file contains all theme and preprocess functions
 */

/**
 *
 * @global type $base_url
 * @param array $variables
 *   an array of variables that will be passed to the theme function
 */
function islandora_critical_edition_preprocess_islandora_critical_edition(&$variables) {
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  $islandora_object = $variables['islandora_object'];
  $repository = $islandora_object->repository;
  module_load_include('inc', 'islandora', 'includes/datastream');
  module_load_include('inc', 'islandora', 'includes/utilities');
  $pages = islandora_paged_content_get_pages($islandora_object);
  $pids = array_keys($pages);
  try {
    $dc = $islandora_object['DC']->content;
    $dc_object = DublinCore::importFromXMLString($dc);
  } catch (Exception $e) {
    drupal_set_message(t('Error retrieving object %s %t', array('%s' => $islandora_object->id, '%t' => $e->getMessage())), 'error', FALSE);
  }
  $variables['islandora_dublin_core'] = isset($dc_object) ? $dc_object : NULL;
  $variables['dc_array'] = isset($dc_object) ? $dc_object->asArray() : array();
  $variables['islandora_object_label'] = $islandora_object->label;
  global $base_url;
  $variables['viewer_url'] = "$base_url/" . drupal_get_path('module', 'islandora_critical_edition') . "/cwrcwriter/resources/index.php?PID=". $pids[0];
  $path = drupal_get_path('module', 'islandora_critical_edition');
  drupal_add_js($path . '/cwrcwriter/js/critical_edition.js');
  drupal_add_css($path . '/cwrcwriter/css/crited.css');
 
}
