<?php
/**
 * @file
 * Holds the code for deleting critical editions.
 */

/**
 * Generates a form that lets one delete the critical editions of an object.
 *
 * @param array $form
 *   The form.
 * @param array $form_state
 *   The form state.
 * @param AbstractObject $object
 *   The object to create a delete tei-rdf form for.
 *
 * @return array
 *   The form.
 */
function islandora_critical_edition_delete_edition_form(array $form, array &$form_state, AbstractObject $object) {
  module_load_include('inc', 'islandora_critical_edition', 'includes/utilities');
  global $user;
  $form = array();

  if (!user_access(ISLANDORA_CRITICAL_EDITION_DELETE_CRITICAL_EDITION)) {
    return $form;
  }

  $editions = islandora_critical_edition_get_critical_editions($object);
  foreach ($editions as $pid => $label) {
    $options[$pid] = array(
      'pid' => $pid,
      'label' => $label,
    );
  }

  $header = array(
    'pid' => t("PID"),
    'label' => t("Label"),
  );
  $form['fedora_object'] = array(
    '#type' => 'hidden',
    '#value' => $object->id,
  );
  if (count($editions)) {
    $form['editions']['table'] = array(
      '#header' => $header,
      '#type' => 'tableselect',
      '#options' => $options,
      '#empty' => t('No critical editions have been created.'),
      '#weight' => -2,
    );
  }
  else {
    $form['bookmarks']['fieldset']['table'] = array(
      '#markup' => t('No critical editions have been created.'),
    );
  }
  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Delete selected TEI-RDF Editors'),
  );

  return $form;
}

/**
 * Submit handler for critical edition deletion.
 *
 * This will destroy children objects of aggregate objects.
 * It will use a batch.
 *
 * @param array $form
 *   The form.
 * @param array $form_state
 *   The form state.
 */
function islandora_critical_edition_delete_edition_form_submit($form, &$form_state) {
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  $parent_pids_to_delete = array_filter($form_state['values']['table']);

  $victims = $parent_pids_to_delete;
  // Add the children of each critical edition to the purge pile.
  foreach ($parent_pids_to_delete as $candidate) {
    $candidate_object = islandora_object_load($candidate);
    $pages = islandora_paged_content_get_pages($candidate_object);
    $victims = array_merge($victims, array_keys($pages));
  }

  islandora_critical_edition_batch_purge_pids($victims);
}

/**
 * This function will kick off a batch process to purge an array of PIDs.
 *
 * @param array $pids_to_purge
 *   The list of PIDs to purge.
 */
function islandora_critical_edition_batch_purge_pids(array $pids_to_purge) {

  $batch = array(
    'title' => t('Deleting Objects'),
    'operations' => array(),
    'file' => drupal_get_path('module', 'islandora_critical_edition') . '/includes/delete.inc',
    'progress_message' => t('@current of @total objects purged.'),
  );

  foreach ($pids_to_purge as $pid) {
    $batch['operations'][] = array('islandora_critical_edition_delete_pid',
      array('pid' => $pid));
  }

  batch_set($batch);
  batch_process();
}

/**
 * This function will purge an object from the repository specified by a PID.
 *
 * @param string $pid
 *   The PID of the object to purge.
 */
function islandora_critical_edition_delete_pid($pid) {
  $connection = islandora_get_tuque_connection();
  $connection->repository->purgeObject($pid);
}
