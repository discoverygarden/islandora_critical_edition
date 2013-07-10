<?php
/**
 * @file
 * This is the template file for the critical edition object
 *
 * Available variables:
 * - $anno_list_pane (html): The annotation list page, as themed by image annotation.
 * - $anno_img_pane (html): The image annotation pane, as themed by image annotation.
 */

?>

<div class="islandora-crited-wrapper">
  <div id="iframe_replacement">

    <input id="full-window-button" type="button" value="<?php print t('Full Window'); ?>" />
    <input id="bookview_button" type="button" value="<?php print t('Return to Book View'); ?>" />

     <div class="islandora-crited-iframe-wrapper">
      <!-- Header -->
        <div id="header">
          <div id="page_selector">Loading....</div>
          <div id="header-inner">
            <div class="header-nav">
              <a href="" id="page-prev"></a>
              <a href="" id="page-next"></a>
            </div>
            <h1>DHSI CWRCWriter</h1>
          </div>
          <div id ="pageChange">
          </div>
          <div id="helpLink">
             <img title="Help" src="<?php print $images_path; ?>/imgs/help.png">
             <h2>Help</h2>
          </div>
          <div id="settingsLink">
            <h2>Settings</h2>
          </div>
        </div>
        <!-- Body -->
        <div class="colmask threecol">
          <div class="colleft">
            <div class="col2">
              <!-- Tabs -->
              <div id="tabs">
                <ul>
                  <li><a href="#entities">Entities</a></li>
                  <li><a href="#structure">Structure</a></li>
                  <li><a href="#relations">Relations</a></li>
                  <li id="annotation_tab"><a href="#image-annotations">Image Annotations</a></li>
                </ul>
                <!-- Entities Panel -->
                <div id="entities">
                  <div id="sortBy">
                    <span>Sort By</span>
                    <input type="radio" id="sequence" name="sortBy" checked="checked"><label for="sequence">Sequence</label></input>
                    <input type="radio" id="category" name="sortBy"><label for="category">Category</label></input>
                  </div>
                  <ul class="entitiesList"></ul>
                </div>
                <!-- Structure Panel -->
                <div id="structure">
                  <div id="tree"></div>
                </div>
                <div id="relations">
                  <ul class="relationsList"></ul>
                </div>
                <!-- Image Annotations Panel -->
                <?php print $anno_list_pane; ?>
              </div>
            </div>
          </div>
          <div id="colright" class="colright">
            <div class="col1">
              <!-- Text Annotation -->
              <div class="text-annotation-wrapper">
                <form method="post" action="">
                  <textarea id="editor" name="editor" class="tinymce"></textarea>
                </form>
              </div>
            </div>
            <!-- Column Separator -->
            <div id="column-separator"></div>
            <div class="col3">
              <!-- Image annotation -->
              <button id="create_annotation" class="menu_button">Annotate</button>
              <div class="image-annotation-wrapper">

                <!-- Persist a single player and build new interface to it -->
                <div id="canvas-body-wrapper" style="width: 100%; height: 800px;"><div id="canvas-body">
                    <?php print $anno_img_pane; ?>
                    <!--  At least one visible image needed for GData transport -->
                    <div class="shared-canvas-logo" style="font-size:8pt">
                      <img height="25" src="<?php print $images_path; ?>/imgs/small-logo.png" style="padding: 0px; margin: 0px; border: 0px; border-top: 2px;" />
                      Powered by SharedCanvas
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!--@todo: enable once css flows
        <div id="islandora_critical_edition_footer">
          <p>Brought to you by <a href="http://editingmodernism.ca/" title="Editing Modernism in Canada" target="_blank">EMiC</a></p>
        </div>
        -->

    </div>
  </div>
</div>
