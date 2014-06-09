<?php

/**
 * @file
 * Utility functions for managing collection
 * level locks in the islandora_object_lock_length_locks
 * table created during install.
 */

/**
 * Create a user prefered TEI Schema.
 *
 * @param string $name
 *   The name of the current user.
 * @param string $page_pid
 *   The pid of the page.
 * @param string $schema_pid
 *   The pid of the schema.
 */
function islandora_critical_edition_add_user_selected_schema($name, $page_pid, $schema_pid, $valid) {
  db_insert('islandora_critical_edition_user_schema')
      ->fields(array(
        'name' => $name,
        'page_pid' => $page_pid,
        'schema_pid' => $schema_pid,
        'valid' => $valid,
      ))
      ->execute();
}

/**
 * Edit a user prefered TEI Schema.
 *
 * @param string $name
 *   The name of the current user.
 * @param string $page_pid
 *   The pid of the page.
 * @param string $schema_pid
 *   The pid of the schema.
 */
function islandora_critical_edition_edit_user_selected_schema($name, $page_pid, $schema_pid) {
  db_update('islandora_critical_edition_user_schema')
      ->fields(array('schema_pid' => $schema_pid))
      ->condition('name', $name, '=')
      ->condition('page_pid', $page_pid, '=')
      ->execute();
}

/**
 * Remove a user prefered TEI Schema.
 *
 * @param string $lid
 *   The id of the row to remove.
 */
function islandora_critical_edition_remove_user_selected_schema($lid) {
  db_delete('islandora_critical_edition_user_schema')
      ->condition('lid', $lid, '=')
      ->execute();
}

/**
 * Get a user prefered TEI Schema.
 *
 * @param string $name
 *   The name of the current user.
 * @param string $page_pid
 *   The pid of the page.
 *
 * @return object
 *   The queried object returned.
 */
function islandora_critical_edition_get_user_selected_schema($name, $page_pid) {
  $schema = db_select('islandora_critical_edition_user_schema', 'n')
      ->fields('n', array('lid', 'name', 'page_pid', 'schema_pid', 'valid'))
      ->condition('name', $name, '=')
      ->condition('page_pid', $page_pid, '=')
      ->execute();
  $data = $schema->fetchObject();
  if (!$data) {
    $data = islandora_critical_edition_get_default_schema();
  }
  return $data;
}

/**
 * Returns default TEI Schema.
 *
 * @return object
 *   The queried object returned.
 */
function islandora_critical_edition_get_default_schema() {
  $schema = db_select('islandora_critical_edition_user_schema', 'n')
      ->fields('n', array('name', 'page_pid', 'schema_pid', 'valid'))
      ->condition('schema_pid', variable_get('islandora_critical_edition_default_schema', "islandora:tei_sample_schema"), '=')
      ->execute();
  $data = $schema->fetchObject();
  return $data;
}
