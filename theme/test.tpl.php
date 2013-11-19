<?php
/**
 * @file
 * This is the template file for the critical edition object
 *
 * Available variables:
 * - $anno_list_pane (html):
 *   The annotation list page, as themed by image annotation.
 * - $anno_img_pane (html):
 *   The image annotation pane, as themed by image annotation.
 */

?>
<div class="ui-layout-center">Outer-Center Pane</div>
<div class="ui-layout-north">Outer-North Pane</div>
<div class="ui-layout-east right-layout">
   <div class="right-top">East Pane-> Inner-North Pane</div>
   <div class="right-center">East Pane-> Inner-Center Pane</div>
</div>
<div class="ui-layout-west left-layout">
   <div class="left-top">West Pane-> Inner-North Pane</div>
   <div class="left-center">West Pane-> Inner-Center Pane</div>
</div>
