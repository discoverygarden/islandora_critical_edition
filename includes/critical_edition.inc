<?php

function islandora_critical_edition_management(FedoraObject $object) {
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  module_load_include('inc', 'islandora_critical_edition', 'includes/critical_edition_creation');
  module_load_include('inc', 'islandora_critical_edition', 'includes/critical_edition_view');
  module_load_include('inc', 'islandora_critical_edition', 'includes/critical_edition_delete');

  $editions = islandora_paged_content_get_pages($object);
  $has_editions = count($editions);

  drupal_set_title($object->label);
  $items = array();
  $items['manage_book'] = array(
    '#type' => 'vertical_tabs',
    '#weight' => 0,
    '#prefix' => '',
  );
  $items['manage_book']['create'] = array(
    '#access' => user_access(FEDORA_ADD_DS),
    '#title' => t('Create Critical Edition'),
    '#type' => 'fieldset',
    'form' => drupal_get_form('islandora_create_edition_form', $object),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
  );
  if ($has_editions) {
    $items['manage_book']['view'] = array(
      '#access' => user_access(FEDORA_ADD_DS),
      '#title' => t('View Critical Editions'),
      '#type' => 'fieldset',
      'form' => drupal_get_form('islandora_view_edition_form', $object),
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
    );

    $items['manage_book']['delete'] = array(
      '#access' => user_access(FEDORA_ADD_DS),
      '#title' => t('Delete Critical Editions'),
      '#type' => 'fieldset',
      'form' => drupal_get_form('islandora_delete_edition_form', $object),
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
    );
  }
  return $items;
}