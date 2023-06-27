window.VSD_CONVERT_URL = null;
window.ICONSEARCH_PATH = null;
EditorUi.enableLogging = false; //Disable logging
var plugins = mxSettings.getPlugins();
if (!plugins.includes("plugins/attackgraphs.js")) {
  plugins.push("plugins/attackgraphs.js");
  mxSettings.setPlugins(plugins);
}
window.EMF_CONVERT_URL = null;
EditorUi.enablePlantUml = true; //Enables PlantUML
App.prototype.isDriveDomain = function() { return true; }
