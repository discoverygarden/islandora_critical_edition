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
<div id="cwrc_wrapper" class="cwrc_wrapper" style="width: 100%; height:600px">
    <div id="header" class="ui-layout-north">
    <!-- TODO: We need new full page buttons. So much going on in the header right now -->
		 <div id="page_selector">Loading....</div>
			<div id="header-inner">
				<div class="header-nav">
					<a href="" id="page-prev"></a>
					<a href="" id="page-next"></a>
					
				</div>
			</div>
			<div id ="pageChange"></div>
		<h1>CWRCWriter</h1>
		<div id="headerButtons"></div>
	</div>
	<div class="ui-layout-west">
		<div id="westTabs" class="tabs">
			<ul>
				<li><a href="#entities">Entities</a></li>
				<li><a href="#structure">Structure</a></li>
				<li><a href="#relations">Relations</a></li>
				<li id="annotation_tab"><a href="#image-annotations">Image Annotations</a></li>
			</ul>
			<div id="westTabsContent" class="ui-layout-content">
				<?php print $anno_list_pane; ?>
			</div>
		</div>
	</div>
	<div id="main" class="ui-layout-center">
		<div class="ui-layout-center">
			<form method="post" action="">
				<textarea id="editor" name="editor" class="tinymce"></textarea>
			</form>
		</div>
		<div class="ui-layout-south">
			<div id="southTabs" class="tabs">
				<ul>
					<li><a href="#validation">Validation</a></li>
					<li><a href="#selection">Selection</a></li>
				</ul>
				<div id="southTabsContent" class="ui-layout-content"></div>
			</div>
		</div>
	</div>
	<div id="east_div" class="ui-layout-east">
		<!-- Image annotation -->
		<button id="create_annotation" class="menu_button">Annotate</button>
		<div class="image-annotation-wrapper">
	
			<!-- Persist a single player and build new interface to it -->
			<div id="canvas-body-wrapper" style="width: 100%; height: 800px;">
				<?php print $anno_img_pane; ?>
					<!--  At least one visible image needed for GData transport -->
					<div class="shared-canvas-logo" style="font-size: 8pt">
						<img height="25" src="../imgs/small-logo.png"
							style="padding: 0px; margin: 0px; border: 0px; border-top: 2px;" />
						Powered by SharedCanvas
					</div>
			</div>
		</div>
	</div>
</div>

