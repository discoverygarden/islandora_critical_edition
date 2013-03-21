<?php

function islandora_view_edition_form(array $form, array &$form_state, FedoraObject $object) {
  module_load_include('inc', 'islandora_critical_edition', 'includes/utilities');
  global $user;
  $editions = islandora_get_critical_editions($object);
  foreach ($editions as $pid => $title) {
    $links[] = l($title, "islandora/object/$pid");
  }
  $variables = array(
    'title' => t("Critical Editions"),
    'type' => 'ul',
    'items' => $links,
    'attributes' => array(),
  );
  $markup = theme_item_list($variables);
  $form = array();
  $form['fedora_object'] = array(
    '#type' => 'hidden',
    '#value' => $object->id,
  );
  $form['title'] = array(
    '#title' => t('Content'),
    '#description' => t('View '),
    '#type' => 'markup',
    '#markup' => $markup,
    '#id' => "edition_title"
  );

  return $form;
}