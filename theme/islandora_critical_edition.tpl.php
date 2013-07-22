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

<div id="header" class="ui-layout-north">
	<h1>CWRCWriter</h1>
	<div id="headerButtons">
	</div>
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
			<div id="image-annotations">
				<div id="comment_annos_block"></div>
			</div>
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
<div class="ui-layout-east">
	<!-- Image annotation -->
	<button id="create_annotation" class="menu_button">Annotate</button>
	<div class="image-annotation-wrapper">

		<!-- Persist a single player and build new interface to it -->
		<div id="canvas-body-wrapper" style="width: 100%; height: 800px;">
			<div id="canvas-body">

				<ul class="menu_body" id="show_body">
					<li class="show_sort" id="li_comment"><span
						class="ui-icon ui-icon-arrowthick-2-n-s"></span> <span
						style="margin-left: 10px">Commentary:</span> <span
						style="float: right"><input id="check_show_comment"
							type="checkbox" checked="checked"></input> </span></li>

					<li class="show_sort" id="li_audio"><span
						class="ui-icon ui-icon-arrowthick-2-n-s"></span> <span
						style="margin-left: 10px">Audio: </span> <span
						style="float: right"><input id="check_show_audio"
							type="checkbox" checked="checked"></input></span> <br /> <span>Volume:</span>
						<div id="slider_volume" style="height: 8px;"></div></li>
					<li class="show_sort" id="li_text"><span
						class="ui-icon ui-icon-arrowthick-2-n-s"></span> <span
						style="margin-left: 10px">Texts: </span> <span
						style="float: right"><input id="check_show_text"
							type="checkbox" checked="checked"></input></span></li>
					<li class="show_sort" id="li_detailImg"><span
						class="ui-icon ui-icon-arrowthick-2-n-s"></span> <span
						style="margin-left: 10px">Detail Images: </span> <span
						style="float: right"><input id="check_show_detailImg"
							type="checkbox" checked="checked"></input></span></li>
					<li class="show_sort" id="li_baseImg"><span
						class="ui-icon ui-icon-arrowthick-2-n-s"></span> <span
						style="margin-left: 10px">Base Images:</span> <span
						style="float: right"><input id="check_show_baseImg"
							type="checkbox" checked="checked"></input></span></li>
				</ul>

				<ul class="menu_body" id="view_body">
					<li>Show Image Selection: <span style="float: right"><input
							id="check_view_imgSel" type="checkbox"></input></span></li>
					<li>Number of Folios: <span style="float: right"
						id="viewNumCanvas">1</span>
						<div id="slider_folios" style="height: 8px;"></div></li>
					<li>Show Zoom Button: <span style="float: right"><input
							id="check_view_zpr" type="checkbox"></input></span></li>
					<li>Show Canvas URI: <span style="float: right"><input
							id="check_view_uri" type="checkbox"></input></span></li>
				</ul>

				<!--  Wrapper to create Canvas divs in -->
				<div id="canvases"></div>

				<!--  Wrapper to create SVG divs in -->
				<div id="svg_wrapper"></div>

				<!--  Wrapper to create annotations in, then reposition -->
				<div id="annotations"></div>

				<!-- Progress bar -->
				<div id="loadprogress"></div>

				<!--  At least one visible image needed for GData transport -->
				<div class="shared-canvas-logo" style="font-size: 8pt">
					<img height="25" src="http://192.168.168.56/sites/all/modules/islandora_image_annotation/shared_canvas/imgs/small-logo.png"
						style="padding: 0px; margin: 0px; border: 0px; border-top: 2px;" />
					Powered by SharedCanvas
				</div>

			</div>
		</div>
	</div>
</div>
