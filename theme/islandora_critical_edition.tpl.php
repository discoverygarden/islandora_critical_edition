<?php
/**
 * @file
 * This is the template file for the critical edition object
 *
 * Available variables:
 * - $viewer_url (string): The url to the cwrc viewer.
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
             <img title="Help" src="/sites/all/modules/islandora_critical_edition/cwrcwriter/resources/img/help.png">
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
                <div id="image-annotations">
                  <div id="comment_annos_block"></div>
                </div>
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

                    <ul class="menu_body" id="show_body">
                      <li class="show_sort" id="li_comment">
                        <span class="ui-icon ui-icon-arrowthick-2-n-s"></span>
                        <span style="margin-left:10px">Commentary:</span>
                        <span style="float:right"><input id="check_show_comment" type="checkbox" checked="true"></input> </span>
                      </li>

                      <li class="show_sort" id="li_audio">
                        <span class="ui-icon ui-icon-arrowthick-2-n-s"></span>
                        <span style="margin-left:10px">Audio: </span>
                        <span style="float:right"><input id="check_show_audio" type="checkbox" checked="true"></input></span>
                        <br/>
                        <span>Volume:</span>
                        <div id="slider_volume" style="height:8px;"></div>
                      </li>
                      <li class="show_sort" id="li_text">
                        <span class="ui-icon ui-icon-arrowthick-2-n-s"></span>
                        <span style="margin-left:10px">Texts: </span>
                        <span style="float:right"><input id="check_show_text" type="checkbox" checked="true"></input></span>
                      </li>
                      <li class="show_sort" id="li_detailImg">
                        <span class="ui-icon ui-icon-arrowthick-2-n-s"></span>
                        <span style="margin-left:10px">Detail Images: </span>
                        <span style="float:right"><input id="check_show_detailImg" type="checkbox" checked="true"></input></span>
                      </li>
                      <li class="show_sort" id="li_baseImg">
                        <span class="ui-icon ui-icon-arrowthick-2-n-s"></span>
                        <span style="margin-left:10px">Base Images:</span>
                        <span style="float:right"><input id="check_show_baseImg" type="checkbox" checked="true"></input>
                      </li>
                    </ul>



                    <ul class="menu_body" id="view_body">
                      <li>Show Image Selection: <span style="float:right"><input id="check_view_imgSel" type="checkbox"></input></li>
                      <li>Number of Folios: <span style="float:right" id="viewNumCanvas">1</span>
                        <div id="slider_folios" style="height:8px;"></div></li>
                      <li>Show Zoom Button: <span style="float:right"><input id="check_view_zpr" type="checkbox"></input></li>
                      <li>Show Canvas URI: <span style="float:right"><input id="check_view_uri" type="checkbox"></input></li>
                    </ul>

                    <!--  Wrapper to create Canvas divs in -->
                    <div id="canvases"></div>

                    <!--  Wrapper to create SVG divs in -->
                    <div id="svg_wrapper"></div>

                    <!--  Wrapper to create annotations in, then reposition -->
                    <div id="annotations"></div>

                    <!-- Progress bar -->
                    <!-- div id="loadprogress"></div-->

                    <!--  At least one visible image needed for GData transport -->
                    <div class="shared-canvas-logo" style="font-size:8pt">
                      <img height="25" src="/sites/all/modules/islandora_critical_edition/cwrcwriter/resources/impl/imgs/small-logo.png" style="padding: 0px; margin: 0px; border: 0px; border-top: 2px;" />
                      Powered by SharedCanvas
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- div id="dialogs" width="500"-->

          <!-- Image annotation box -->

          <!-- Footer -->

        <!-- /div-->


    </div>
  <!--   <div id="ele_footer"> -->
  <!--     <p>Brought to you by <a href="http://editingmodernism.ca/" title="Editing Modernism in Canada" target="_blank">EMiC</a></p> -->
  <!--   </div> -->
  </div>
</div>
