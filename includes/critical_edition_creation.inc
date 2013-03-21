<?php

define('ISLANDORA_CRITICAL_EDITION', 'isCriticalEditionOf');

function islandora_create_edition_form(array $form, array &$form_state, FedoraObject $object) {
  global $user;

  $label = t('Critical Edition of') . " " . $object->label . ' - ' . $user->name;
  $form = array();
  $form['fedora_object'] = array(
    '#type' => 'hidden',
    '#value' => $object->id,
  );
  $form['title'] = array(
    '#title' => t('Edition Title'),
    '#description' => t('Enter title for this critical edition'),
    '#type' => 'textfield',
    '#default_value' => $label,
    '#id' => "edition_title"
  );
  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Create Critical Edition'),
  );
  return $form;
}

/**
 * Creates Critical Edition and associcated page objects
 *
 * @global user $user
 * @param array $form
 * @param array $form_state
 */
function islandora_create_edition_form_submit($form, &$form_state) {
  module_load_include('inc', 'islandora', '/includes/ingest.form');
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  module_load_include('inc', 'islandora', 'includes/utilities');
  global $user;
  $book_pid = $form_state['values']['fedora_object'];
  $book_object = islandora_object_load($book_pid);
  $namespace = islandora_get_namespace($book_pid);
  $label = $form_state['values']['title'];

  // create Critical edition Fedora Object
  $content_models = array(array('pid' => 'islandora:criticalEditionCModel'));

  $config = array(
    'namespace' => $namespace,
    'label' => $label,
    'models' => $content_models,
    'owner' => $user->name,
  );

  $fedora_object = islandora_ingest_form_prepare_new_object($config);
  $fedora_object->relationships->add(ISLANDORA_RELS_EXT_URI, ISLANDORA_CRITICAL_EDITION, $book_pid, RELS_TYPE_PLAIN_LITERAL);
  $fedora_object->relationships->add(FEDORA_MODEL_URI, 'hasModel', 'islandora:criticalEditionCModel');
  $edition_object = islandora_add_object($fedora_object);

  $pages = islandora_paged_content_get_pages($book_object);

  $batch = array(
    'title' => t('Creating New Critical Edition'),
    'operations' => array(),
    'file' => drupal_get_path('module', 'islandora_critical_edition') . '/includes/critical_edition_creation.inc',
    'progress_message' => t('@current of @total pages created.'),
  );

  foreach ($pages as $page) {
    $batch['operations'][] = array('islandora_create_edition_page', array('page' => $page, 'parent_book' => $edition_object->id));
  }
  batch_set($batch);
  //todo - add address of cwrcwrtier when its ready
  batch_process();
}

/**
 * Created individual page objects for new Critical Edition
 * @global user $user
 * @global URL $base_url
 * @param pid $page
 * @param int $sequence_number
 * @param pid $edition_pid
 * @param pid $nextPid
 *
 *
 */
function islandora_create_edition_page($page, $parent) {
  module_load_include('inc', 'islandora', '/includes/ingest.form');
  global $base_url;
  $namespace = substr($page['pid'], 0, strpos($page['pid'], ":"));
  $config = array(
    'namespace' => $namespace,
    'label' => $page['label'],
    'owner' => $user->name,
  );


  $fedora_object = islandora_ingest_form_prepare_new_object($config);
  // add all relationships
  $fedora_object->relationships->add(FEDORA_MODEL_URI, 'hasModel', 'islandora:criticalEditionCModelPage');
  $fedora_object->relationships->add(FEDORA_RELS_EXT_URI, 'isPageOf', $parent);
  $fedora_object->relationships->add(FEDORA_RELS_EXT_URI, 'isEditionOf', $page['pid']);
  $fedora_object->relationships->add(FEDORA_RELS_EXT_URI, 'isMemberOf', $parent);
  $fedora_object->relationships->add(ISLANDORA_RELS_EXT_URI, 'isSequenceNumber', $page['page'], RELS_TYPE_PLAIN_LITERAL);
  $fedora_object->relationships->add(ISLANDORA_RELS_EXT_URI, 'isPageNumber', $page['page'], RELS_TYPE_PLAIN_LITERAL);
  $fedora_object->relationships->add(ISLANDORA_RELS_EXT_URI, 'isSection', '1', RELS_TYPE_PLAIN_LITERAL);
  //create object
  $new_page_object = islandora_add_object($fedora_object);
  $original_page_object = islandora_object_load($page['pid']);
// add datastreams from original page object

  $DSIDS = array('OCR', 'TN', 'CWRC');
  foreach ($DSIDS as $DSID) {
    if ($original_page_object[$DSID]) {
      $new_page_object->ingestDatastream($original_page_object[$DSID]);
    }
  }
}

function emic_cwrc_manage_editions($form_state, $book_pid) {
  module_load_include('inc', 'islandora_book', 'book_pack_utils');

  $table = emic_editions_table($book_pid);
  $form = array();
  $form['link'] = array(
    '#type' => 'item',
    '#value' => l(t('Return to book view'), "fedora/repository/$book_pid"),
  );
  $form['intro'] = array(
    '#type' => 'item',
    '#title' => t('Manage Critical Editions'),
    '#description' => t("Select")
  );
  $form['book_pid'] = array(
    '#type' => 'hidden',
    '#value' => $book_pid
  );
  $form['editions_table'] = array(
    'table' => $table,
  );
  $form['submit']['delete'] = array(
    '#type' => 'submit',
    '#value' => t('Delete Selected Critical Editions'),
    '#id' => 'delete_edition',
  );
  $form['submit']['clone'] = array(
    '#type' => 'submit',
    '#value' => t('Clone Selected Critical Editions'),
    '#id' => 'clone_edition'
  );
  return $form;
}

function emic_cwrc_manage_editions_submit($form, &$form_state) {
  //setup common values
  module_load_include('inc', 'emic_cwrc', 'emic_cwrc_utils');
  $book_pid = $form_state['values']['book_pid'];
  $to_process = @array_filter($form_state['values']['table']['selections']);
  $edition_count = count($to_process);
  if ($edition_count < 1) {
    return;
  }
  $edition_text = $edition_count > 1 ? t('Critical Editions') : t('Critical Edition');
  $page_count = 0;
  $pids_to_process = array();
  foreach ($to_process as $candidate) {
    $new_pids['edition'] = $candidate;
    $new_pids['pages'] = emic_cwrc_get_critical_edition_pages($candidate);
    $page_count += count($new_pids['pages']);
    $pids_to_process[] = $new_pids;
  }

  $page_text = $page_count > 1 ? t('pages') : t('page');

  // delete selected
  if ($form_state['clicked_button']['#id'] == 'delete_edition') {
    $batch = array(
      'title' => t("Deleting !edition_count $edition_text with a total of !page_count $page_text", array('!page_count' => $page_count, '!edition_count' => $edition_count)),
      'operations' => array(),
      'file' => drupal_get_path('module', 'emic_cwrc') . '/emic_cwrc_edition.inc',
      'progress_message' => t('@current of @total objects deleted.'),
    );

    foreach ($pids_to_process as $pid) {

      $batch['operations'][] = array('emic_cwrc_delete_pid', array($pid['edition']));
      foreach ($pid['pages'] as $page) {
        $batch['operations'][] = array('emic_cwrc_delete_pid', array($page));
      }
    }
    batch_set($batch);
    batch_process("fedora/repository/$book_pid");
  }

  //clone selected
  if ($form_state['clicked_button']['#id'] == 'clone_edition') {
    $batch = array(
      'title' => t("Cloning !edition_count $edition_text with a total of !page_count $page_text", array('!page_count' => $page_count, '!edition_count' => $edition_count)),
      'operations' => array(),
      'file' => drupal_get_path('module', 'emic_cwrc') . '/emic_cwrc_edition.inc',
      'progress_message' => t('@current of @total objects cloned.'),
    );
    foreach ($pids_to_process as $pid) {
      $batch['operations'][] = array('emic_cwrc_clone_pid', array($pid));
    }
    batch_set($batch);
    batch_process("fedora/repository/$book_pid");
  }
}

/**
 * Build table
 * @param PID $pid
 * @return array
 */
function emic_editions_table($pid) {
  module_load_include('inc', 'emic_cwrc', 'emic_cwrc_utils');
  // returns associative array of critical editons in PID=> LABEL format
  $editions = emic_cwrc_get_critical_editions($pid);
  if (empty($editions)) {
    return;
  }
  // build array for checkboxes by extracting the pids from the $editions array
  // these pids will identify the individual checkboxes
  $keys = array_keys($editions);
  // options for clickable PID
  $alink_options = array(
    'attributes' => array('target' => '_blank', 'class' => 'fedora_image', 'title' => t('Edit !label', array('!label' => $pid))),
    'html' => TRUE,
  );
  // set up table
  // theme table_select_header_cell provides click-all functionality

  $table = array(
    '#header' => array(theme('table_select_header_cell'), t('Edition'), t('Label')),
    '#theme' => 'emic_editions_table',
    '#tree' => TRUE,
    'rows' => array(),
    'selections' => array(
      '#type' => 'checkboxes',
      '#options' => array_fill_keys($keys, ''),
    ),
  );
  // $rows array must be passed by reference
  $rows = &$table['rows'];
  // each row of $ediitons table is added to the table $rows array
  // #pid must be included for checkboxe theming to work
  foreach ($editions as $pid => $label) {
    $rows[] = array(
      '#pid' => $pid,
      'pid' => array('#value' => l($pid, 'fedora/repository/' . $pid, $alink_options)),
      'label' => array('#value' => $label),
    );
  }

  return $table;
}

/**
 * themes the form table.
 *
 * @param array $element Drupal Form Element.
 * @return string
 */
function theme_emic_editions_table(array $element) {
  $rows = array();
  // style each row of output table
  foreach (element_children($element['rows']) as $iterator) {
    $setting = $element['rows'][$iterator];
    $pid = $setting['#pid'];
    $fields = array(
      drupal_render($element['selections'][$pid]) // First field is a checkbox
    );
    // each property will create a cell in the table
    foreach (element_children($setting) as $property) {
      $field = $setting[$property];
      $fields[] = drupal_render($field);
    }
    $rows[] = array(
      'data' => $fields,
      'class' => isset($setting['#attributes']['class']) ? $setting['#attributes']['class'] : NULL
    );
  }
  $attributes = isset($element['#id']) ? array('id' => $element['#id']) : NULL;
  return theme_table($element['#header'], $rows, $attributes);
}

function emic_cwrc_delete_pid($pid) {
  module_load_include('inc', 'fedora_repository', 'api/fedora_item');
  $item = new Fedora_Item($pid);
  $item->purge('Deleted by batch process');
}

function emic_cwrc_clone_pid($pids) {
  global $user;
  global $base_url;
  module_load_include('inc', 'fedora_repository', 'api/fedora_item');
  $pid = $pids['edition'];
  $original = new Fedora_Item($pid);
  $rels = $original->get_rdf_relationships();
  $isCriticalEditionOf = $rels['isCriticalEditionOf'][0];
  $label = $original->objectProfile->objLabel;
  $namespace = substr($pid, 0, strpos($pid, ":"));
  $new_edition_pid = FEDORA_ITEM::get_next_PID_in_namespace($namespace);
  $item = fedora_item::ingest_new_item($new_edition_pid, 'A', $label . ' (Cloned)', $user->name);
  $item->add_relationship('hasModel', 'islandora:criticalEditionCModel', FEDORA_MODEL_URI);
  $item->add_relationship('isCriticalEditionOf', $isCriticalEditionOf, 'http://islandora.ca/ontology/relsext#', RELS_TYPE_PLAIN_LITERAL);
  $sequence_number = 0;
  foreach ($pids['pages'] as $page) {
    $original_page = new Fedora_Item($page);
    $rels = $original_page->get_rdf_relationships();
    $isEditionOf = $rels['isEditionOf'][0];
    $label = $original_page->objectProfile->objLabel;
    $sequence_number++;
    $nextPid = FEDORA_ITEM::get_next_PID_in_namespace($namespace);
    $page_item = fedora_item::ingest_new_item($nextPid, 'A', $label, $user->name);
    $page_item->add_relationship('hasModel', 'islandora:criticalEditionCModelPage', FEDORA_MODEL_URI);
    $page_item->add_relationship('isSequenceNumber', $sequence_number, 'http://islandora.ca/ontology/relsext#', 3);
    $page_item->add_relationship('isPageNumber', $sequence_number, 'http://islandora.ca/ontology/relsext#', 3);
    $page_item->add_relationship('isSection', '1', 'http://islandora.ca/ontology/relsext#', 3);
    $page_item->add_relationship('isPageOf', $new_edition_pid, 'http://islandora.ca/ontology/relsext#');
    $page_item->add_relationship('isEditionOf', $isEditionOf, 'http://islandora.ca/ontology/relsext#');
    $page_item->add_relationship('isMemberOf', $new_edition_pid, RELS_EXT_URI);
    $page_item->add_datastream_from_url("$base_url/fedora/repository/$page/OCR", 'OCR', 'Scanned Text', 'text/plain', 'M', NULL);
    if (array_key_exists('CWRC', $original_page->datastreams)) {
      $page_item->add_datastream_from_url("$base_url/fedora/repository/$page/CWRC", 'CWRC', 'CWRC', 'text/plain', 'M', NULL);
    }
    $page_item->add_datastream_from_url("$base_url/fedora/repository/$page/TN", 'TN', 'Thumbnail Image', 'image/png', 'M', NULL);
  }
}