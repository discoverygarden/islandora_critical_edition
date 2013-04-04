<?php
/**
 * @file
 *   This is the template file for the critical edition object
 *
 * Available variables:
 * - $viewer_url (string): The url to the cwrc viewer.
 */

?>

<div class="islandora-crited-wrapper">
  <input id="full-window-button" type="button" value="<?php print t('Full Window'); ?>" />
  <input id="bookview_button" type="button" value="<?php print t('Return to Book View'); ?>" />
  <div class="islandora-crited-iframe-wrapper">
    <!-- @todo nuke scrolling and frameborder for CSS they're depricated -->
    <iframe id="islandora-crited-iframe" src="<?php print $viewer_url; ?>" scrolling="0" frameborder="0" style="width: 100%; height: 800px;"><?php print t('Errors: unable to load SharedCanavas'); ?></iframe>
  </div>
</div>
