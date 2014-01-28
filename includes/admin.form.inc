<?php

/**
 * @file
 * Handles the display/submission of the admin settings form for this module.
 */

/**
 * Defines the admin settings form.
 *
 * @param array $form
 *   The Drupal form definition.
 * @param array $form_state
 *   The Drupal form state.
 *
 * @return array
 *   The Drupal form definition.
 */
function islandora_critical_edition_admin_settings_form(array $form, array &$form_state) {
  module_load_include('inc', 'islandora_critical_edition', 'includes/utilities');
  $schema_collection = variable_get('islandora_critical_edition_schema_collection', "islandora:tei_schema_collection");
  $chosen_schema = variable_get('islandora_critical_edition_default_schema', "islandora:tei_sample_schema");
  $schema_pids = islandora_critical_edition_get_schema_pids(islandora_object_load($schema_collection));
  $options = array();
  foreach ($schema_pids as $schema_pid) {
    $object = islandora_object_load($schema_pid);
    $options[$schema_pid] = $object->label;
  }
  $form = array();
  $form['islandora_critical_edition_schema_collection'] = array(
    '#type' => 'textfield',
    '#title' => t('PID of schema collection'),
    '#size' => 40,
    '#default_value' => $schema_collection,
  );
  $form['islandora_critical_edition_default_schema'] = array(
    '#type' => 'radios',
    '#title' => t('Default TEI validation schema'),
    '#options' => $options,
    '#default_value' => $chosen_schema,
  );
  return system_settings_form($form);
}
