<?php

/**
 * @file
 * Holds functionality to show the critical editions available for an object.
 */

/**
 * Display links to all the critical editions for an object.
 *
 * @return array
 *   A render array containing a list of links to the Critical Editions.
 */
function islandora_critical_edition_view_edition_form($editions) {
  module_load_include('inc', 'islandora_critical_edition', 'includes/utilities');
  $path = drupal_get_path('module', 'islandora_critical_edition');
  drupal_add_css("$path/css/islandora_critical_edition.css");
  $links = array();

  foreach ($editions as $pid => $title) {
    $links[] = l($title, "islandora/object/$pid");
  }

  $links_theme_variables = array(
    'title' => t("TEI-RDF Editors"),
    'type' => 'ul',
    'items' => $links,
    'attributes' => array('class' => array('islandora_crited_list')),
  );

  return array(
    '#title' => t('Content'),
    '#access' => user_access(ISLANDORA_CRITICAL_EDITION_VIEW_CRITICAL_EDITION),
    '#description' => t('View'),
    '#type' => 'markup',
    '#markup' => theme_item_list($links_theme_variables),
  );
}
