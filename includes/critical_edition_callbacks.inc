<?php

/**
 * Provides all the parameters necessary for CWRCWriter to operate with fedora
 * @global url $base_url
 * @global User $user
 * @param IslandoraFedoraObject $fedora_object
 */

function islandora_critical_edition_setup($fedora_object) {
  module_load_include('inc', 'islandora_basic_collection', 'includes/utilities');
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  module_load_include('inc', 'islandora_critical_edition', 'includes/utilities');
  global $base_url;
  global $user;

// TODO add permission check
  $cant_edit = user_access('edit CWRC') ? false : true;
  $fedora_url = variable_get('fedora_base_url', 'http://localhost:8080/fedora');
  if (!$fedora_object['CWRC']) {
    islandora_critical_edition_add_cwrc_datastream($fedora_object);
  }

  $critical_edition = $fedora_object->relationships->get('info:fedora/fedora-system:def/relations-external#', 'isPageOf');
  $critical_edition = $critical_edition[0]['object']['value'];
  $critical_edition_object = islandora_object_load($critical_edition);
  $title = $critical_edition_object->label;
  $pages = islandora_paged_content_get_pages($critical_edition_object);
  $pages = array_keys($pages);
  $position = array_search($fedora_object->id, $pages);
  $results = array();
  $results['BASE_PATH'] = $base_url;
  $results['uid'] = $user->uid;
  $results['fedora_url'] = $fedora_url;
  $results['position'] = $position;
  $results['pages'] = $pages;
  $results['title'] = $title;
  $results['authority_url'] = $base_url . '/cwrc/authorities/';
  $results['no_edit'] = $cant_edit;
  $results['page_count'] = count($pages);
  // authority mappings stil to come
  //$results['authority_mappings'] = emic_cwrc_get_authority_mappings();
  $json = json_encode($results);
  echo $json;
}

/**
 * Supplies CWRC datastream to CWRCWriter's ajax callback
 * @param <IslandoraFedoraObject $fedora_object
 */
function islandora_critical_edition_getdata($fedora_object) {
  echo $fedora_object['CWRC']->content;
}

/**
 * Persists CWRC datastream to critical edition page object
 */
function islandora_critical_edition_savedata($fedora_object) {
  $data = html_entity_decode(stripslashes($_POST['text']), ENT_QUOTES, 'UTF-8');
  $cwrc = str_replace('<br>', '<br />', $data);
  $cwrc = str_replace('&', '&amp;', $cwrc);
  $pid = ($_POST['file_pid']);
  $fedora_object = islandora_object_load($pid);
  $fedora_object["CWRC"]->content = $cwrc;
  echo "Success";
}

/**
 * Ajax callback for Shared Canvas
 * Supplies the basic data, including maifest uri
 * @global url $base_url
 * @param string $pid
 */
function islandora_critical_edition_canvas_setup($fedora_object) {
  module_load_include('inc', 'islandora_image_annotation', 'includes/build_streams');
  module_load_include('inc', 'islandora_image_annotation', 'includes/rdf_builder');
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');

  global $base_url;
  global $user;

  $rels = $fedora_object->relationships->get();
  foreach ($rels as $rel) {
    if ($rel['predicate']['value'] == 'hasModel') {
      $cModel = $rel['object']['value'];
    }
    if ($rel['predicate']['value'] == 'isEditionOf') {
      $page_object = islandora_object_load($rel['object']['value']);
    }
  }
  $dropdown = variable_get('emic_enforce_taxonomy', TRUE);
  $vid = variable_get('emic_taxonomy_vid', '');
  $categories = array();
  if ($dropdown) {
    $terms = taxonomy_get_tree($vid, 0, 1);
    $categories = array();
    foreach ($terms as $term) {
      $categories[] = $term->name;
    }
  }
  else {
    $categories = islandora_annotations_get_solr_terms();
  }
  if (empty($categories)) {
    $categories[] = 'unclassified';
  }
  $rels = $page_object->relationships->get('http://islandora.ca/ontology/relsext#', 'isPageOf');
  $book_object = islandora_object_load($rels[0]['object']['value']);
  $pid = $page_object->id;
  $title = $book_object->label;
  $pages = islandora_paged_content_get_pages($book_object);
  $pages = array_keys($pages);
  $position = array_search($page_object->id, $pages);

  $results = array();
  $results['manifest_url'] = "$base_url/islandora/anno/serve/$pid/Manifest/manifest.xml";
  $results['page_title'] = $item->objectProfile->objLabel;
  $results['object_base'] = "$base_url/fedora/repository/$pid";
  $results['islandora_post_url'] = "$base_url/islandora/anno/add_annotation/$pid";
  $results['islandora_get_annotation'] = "$base_url/islandora/anno/get_annotation/";
  $results['islandora_delete_annotation'] = "$base_url/islandora/anno/delete_annotation/";
  $results['get_annotation_list_url'] = "$base_url/islandora/anno/get_urns/$pid";
  $results['islandora_update_annotation'] = "$base_url/islandora/anno/update_annotation/";
  $results['position'] = $position;
  $results['pages'] = $pages;
  $results['no_edit'] = !user_access('edit CWRC');
  $results['categories'] = $categories;
  $results['use_dropdown'] = $dropdown;
  $json = json_encode($results);
  echo $json;
}

