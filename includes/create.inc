<?php
/**
 * @file
 * Holds code for creating new critical editions.
 */

/**
 * This function will create the critical edition creation form.
 *
 * @param array $form
 *   The form.
 * @param array $form_state
 *   The form state.
 * @param AbstractObject $object
 *   The object to create the critical edition creation form for.
 *
 * @return array
 *   The form.
 */
function islandora_create_edition_form(array $form, array &$form_state, AbstractObject $object) {
  global $user;
  $form = array();

  if (!user_access(ISLANDORA_CRITICAL_EDITION_CREATE_CRITICAL_EDITION)) {
    return $form;
  }

  $label = $object->label . ' - ' . $user->name;
  $form['fedora_object'] = array(
    '#type' => 'hidden',
    '#value' => $object->id,
  );
  $form['title'] = array(
    '#title' => t('Editor Title'),
    '#description' => t('Enter title for this TEI-RDF Editor'),
    '#type' => 'textfield',
    '#default_value' => $label,
    '#id' => "edition_title",
  );
  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Create TEI-RDF Editor'),
  );
  return $form;
}

/**
 * Creates Critical Edition and associated objects.
 *
 * @param array $form
 *   The form.
 * @param array $form_state
 *   The form state.
 */
function islandora_create_edition_form_submit($form, &$form_state) {
  module_load_include('inc', 'islandora', '/includes/ingest.form');
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  module_load_include('inc', 'islandora', 'includes/utilities');

  $book_pid = $form_state['values']['fedora_object'];
  $book_object = islandora_object_load($book_pid);

  // Create Critical edition Fedora Object.
  $fedora_object = islandora_critical_edition_create_object(islandora_get_namespace($book_pid),
                                                            $form_state['values']['title']);

  $fedora_object->relationships->add(ISLANDORA_RELS_EXT_URI, ISLANDORA_CRITICAL_EDITION_IS_CRITICAL_EDITION_OF, $book_pid, RELS_TYPE_PLAIN_LITERAL);
  $fedora_object->relationships->add(FEDORA_MODEL_URI, 'hasModel', 'islandora:criticalEditionCModel');
  $edition_object = islandora_add_object($fedora_object);

  $pages = islandora_paged_content_get_pages($book_object);

  $batch = array(
    'title' => t('Creating New TEI-RDF Editor'),
    'operations' => array(),
    'file' => drupal_get_path('module', 'islandora_critical_edition') . '/includes/create.inc',
    'progress_message' => t('@current of @total pages created.'),
  );

  foreach ($pages as $page) {
    $batch['operations'][] = array('islandora_create_edition_page', array(
        'page' => $page,
        'parent_book' => $edition_object->id));
  }

  batch_set($batch);
  batch_process();
}

/**
 * Created individual page objects for new Critical Edition.
 *
 *
 * @see islandora_paged_content_get_pages()
 *
 * @param array $page
 *   A page from an array create by islandora_paged_content_get_pages.
 * @param string $parent
 *   The Fedora PID of the paged parent.
 */
function islandora_create_edition_page($page, $parent) {
  module_load_include('inc', 'islandora', '/includes/ingest.form');
  module_load_include('inc', 'islandora_critical_edition', 'includes/utilities');

  $namespace = substr($page['pid'], 0, strpos($page['pid'], ":"));
  $fedora_object = islandora_critical_edition_create_object($namespace, $page['label']);

  // Add all relationships.
  $fedora_object->relationships->add(FEDORA_MODEL_URI, 'hasModel', 'islandora:criticalEditionCModelPage');
  $fedora_object->relationships->add(FEDORA_RELS_EXT_URI, 'isMemberOf', $parent);
  $fedora_object->relationships->add(ISLANDORA_RELS_EXT_URI, 'isPageOf', $parent);
  $fedora_object->relationships->add(ISLANDORA_RELS_EXT_URI, 'isEditionOf', $page['pid']);
  $fedora_object->relationships->add(ISLANDORA_RELS_EXT_URI, 'isSequenceNumber', $page['page'], RELS_TYPE_PLAIN_LITERAL);
  $fedora_object->relationships->add(ISLANDORA_RELS_EXT_URI, 'isPageNumber', $page['page'], RELS_TYPE_PLAIN_LITERAL);
  $fedora_object->relationships->add(ISLANDORA_RELS_EXT_URI, 'isSection', '1', RELS_TYPE_PLAIN_LITERAL);
  // Create object.
  $new_page_object = islandora_add_object($fedora_object);
  $original_page_object = islandora_object_load($page['pid']);

  // Add a minimal set of datastreams from original page object.
  $dsids = array('OCR', 'TN', 'CWRC');
  foreach ($dsids as $dsid) {
    if (isset($original_page_object[$dsid])) {
      $new_page_object->ingestDatastream($original_page_object[$dsid]);
    }
  }
  // Create new CWRC datastream if there is none.
  if (!isset($new_page_object['CWRC']) && isset($new_page_object['OCR'])) {
    islandora_critical_edition_add_cwrc_datastream($new_page_object);
  }
}

/**
 * This function holds code for constructing an object's attributes.
 *
 * It respects UUIDs.
 *
 * @see islandora_prepare_new_object()
 *
 * @param string $namespace
 *   The namespace to create the object's PID in.
 * @param string $label
 *   The object's label.
 * @param array $content_models
 *   Content models that the object will have.
 *
 * @return AbstractObject
 *   An object created by islandora_prepare_new_object.
 */
function islandora_critical_edition_create_object($namespace, $label = '', $content_models = array()) {
  module_load_include('inc', 'islandora', 'includes/utilities');
  global $user;
  $id_or_namespace = '';

  // Choose between 'id' and 'namespace'.
  $make_uuid = variable_get('islandora_basic_collection_generate_uuid', FALSE);
  if (module_exists('islandora_basic_collection') && $make_uuid) {
    $connection = islandora_get_tuque_connection();
    $id_or_namespace = $connection->repository->getNextIdentifier($namespace, $make_uuid);
  }
  else {
    $id_or_namespace = $namespace;
  }

  return islandora_prepare_new_object($id_or_namespace, $label, array(), $content_models);
}
