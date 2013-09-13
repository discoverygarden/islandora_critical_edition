/**
 * Delegator class, called by editor to outside js.
 * 
 * This class is ment to act as a wrapper object full of callbacks,
 * called from the editor. However, it is incomplete, and data is not
 * being persisted.
 *
 * @param config
 * @returns {___anonymous74_75}
 */
function Delegator(config) {
	var w = config.writer;
	
	var del = {};
	
	del.lookupEntity = function(params, callback) {
		Islandora.Writer.Delegate.lookupEntity(params,callback);
	};
	del.validate = function(callback) {
		Islandora.Writer.Delegate.validate(callback);
	};
	
	del.getHelp = function(tagName) {
		return w.u.getDocumentationForTag(tagName);
	};
	
	del.annoAdded = function(rdf) {
		console.log("rdf in del.annoAdded: " + JSON.stringify(rdf));
		// Islandora.Writer.Document.Annotations.add(rdf);
	};
	
	del.annoUpdated = function(rdf) {
		console.log("rdf in del.annoUpdated: " + JSON.stringify(rdf));
		// Islandora.Writer.Document.Annotations.update(rdf);
	};
	
	return del;
};