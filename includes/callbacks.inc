<?php

/**
 * @file
 * Holds the ajax callbacks for the cwrcwriter.
 */

/**
 * Provides all the parameters necessary for CWRCWriter to operate with Fedora.
 *
 * @global User $user
 *
 * @param AbstractObject $fedora_object
 *   The object to get the info on for the CWRC writer.
 */
function islandora_critical_edition_setup(AbstractObject $fedora_object) {
  module_load_include('inc', 'islandora_basic_collection', 'includes/utilities');
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  global $user;
  $stroke_width = variable_get('image_annotation_annotation_stroke_width', '1%');
  $critical_edition_relationships = $fedora_object->relationships->get(ISLANDORA_RELS_EXT_URI, 'isPageOf');
  $critical_edition = $critical_edition_relationships[0]['object']['value'];
  $critical_edition_object = islandora_object_load($critical_edition);
  $title = $critical_edition_object->label;
  $page_results = islandora_paged_content_get_pages($critical_edition_object);
  $pages = array();
  foreach ($page_results as $result) {
    $pages[$result['page']] = $result['pid'];
  }
  $position = array_search($fedora_object->id, $pages);
  $results = array();
  $results['uid'] = $user->uid;
  $results['position'] = $position;
  $results['pages'] = $pages;
  $results['title'] = $title;
  $results['no_edit'] = !islandora_critical_edition_edit_cwrc_access($fedora_object);
  $results['page_count'] = count($pages);
  $results['islandora_anno_stroke_width'] = $stroke_width;
  $entity_collection = variable_get('islandora_entities_ingest_collection', 'islandora:entity_collection');
  $results['create_entity_callback'] = url('islandora/object/' . $entity_collection . '/manage/overview/ingest');
  $results['entities_search_callback'] = url('islandora/entities/search');

  drupal_json_output($results);
}

/**
 * Persists CWRC datastream to a Critical Edition object.
 *
 * @post text
 *   The contents of the CWRC datastream.
 *
 * @param AbstractObject $fedora_object
 *   The fedora object to upload the CWRC datastream to.
 */
function islandora_critical_edition_savedata(AbstractObject $fedora_object) {

  $data = html_entity_decode(stripslashes($_POST['text']), ENT_QUOTES, 'UTF-8');
  // @codingStandardsIgnoreStart
  $cwrc = str_replace('<br>', '<br />', $data);
  // @codingStandardsIgnoreEnd
  $cwrc = str_replace('&', '&amp;', $cwrc);

  $fedora_object["CWRC"]->content = $cwrc;

  echo "Success";
}

/**
 * Ajax callback for Shared Canvas.
 *
 * Supplies the basic data, including manifest URI.
 *
 * @param AbstractObject $fedora_object
 *   The Fedora object to supply the data for
 */
function islandora_critical_edition_canvas_setup(AbstractObject $fedora_object) {
  module_load_include('inc', 'islandora_image_annotation', 'includes/utils');
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  $stroke_width = variable_get('image_annotation_annotation_stroke_width', '1%');
  $relationships = $fedora_object->relationships->get();
  foreach ($relationships as $relationship) {
    if ($relationship['predicate']['value'] == 'isEditionOf') {
      $page_object = islandora_object_load($relationship['object']['value']);
    }
  }

  $page_object_of_relationship = $page_object->relationships->get(ISLANDORA_RELS_EXT_URI, 'isPageOf');
  $book_object = islandora_object_load($page_object_of_relationship[0]['object']['value']);
  $pages = array_keys(islandora_paged_content_get_pages($book_object));
  $position = array_search($page_object->id, $pages);

  $results = islandora_image_annotation_canvas_init($page_object->id);
  $results['islandora_anno_stroke_width'] = $stroke_width;
  $results['position'] = $position;
  $results['pages'] = $pages;
  $results['no_edit'] = !islandora_critical_edition_edit_cwrc_access($fedora_object);

  drupal_json_output($results);
}
