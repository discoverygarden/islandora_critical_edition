<?php

function islandora_delete_edition_form(array $form, array &$form_state, FedoraObject $object) {
  module_load_include('inc', 'islandora_critical_edition', 'includes/utilities');
  global $user;
  $editions = islandora_get_critical_editions($object);
  foreach ($editions as $pid => $label) {
    $options[$pid] = array(
      'pid' => $pid,
      'label' => $label,
    );
  }

  $header = array(
    'pid' => t("PID"),
    'label' => t("Label")
  );
  $form = array();
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
      '#markup' => t('No critical editions have been created.')
    );
  }
  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Delete selected Critical editions')
  );

  return $form;
}

function islandora_delete_edition_form_submit($form, &$form_state) {
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  $pids_to_delete = array_filter($form_state['values']['table']);

  foreach ($pids_to_delete as $candidate) {
    $candidate_object = islandora_object_load($candidate);
    $pages = islandora_paged_content_get_pages($candidate_object);
    $victims = array_keys($pages);
    $victims[] = $candidate;
    foreach ($victims as $victim) {
      $fedora_object = islandora_object_load($victim);
      $fedora_object->delete();
    }
  }
}