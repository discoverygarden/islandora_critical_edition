<?php

/**
 * @file
 * Utilitie functions for manageing collection
 * level locks in the islandora_object_lock_length_locks
 * table created during install.
 */

/**
 * Create a user prefered TEI Schema.
 * 
 * @param string $name
 * @param string $page_pid
 * @param string $schema_pid
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
 * @param string $page_pid
 * @param string $schema_pid
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
 * @param string $name
 * @param string $page_pid
 */
function islandora_critical_edition_remove_user_selected_schema($name, $page_pid) {
  db_delete('islandora_critical_edition_user_schema')
  ->condition('name', $name, '=')
  ->condition('page_pid', $page_pid, '=')
  ->execute();
}

/**
 * Get a user prefered TEI Schema.
 *
 * @param string $name
 * @param string $page_pid
 * @return array
 */
function islandora_critical_edition_get_user_selected_schema($name, $page_pid) {
  $schema = db_select('islandora_critical_edition_user_schema', 'n')
  ->fields('n', array('name','page_pid','schema_pid', 'valid'))
  ->condition('name', $name, '=')
  ->condition('page_pid', $page_pid, '=')
  ->execute();
  $data = $schema->fetchObject();
  return $data;
}