(function() {
  try {
	    var s = document.createElement('meta');
	    s.setAttribute('content', 'default-src \'self\'; script-src \'self\' https://storage.googleapis.com https://apis.google.com https://docs.google.com https://code.jquery.com \'unsafe-inline\'; connect-src \'self\' https://*.dropboxapi.com https://api.trello.com https://api.github.com https://raw.githubusercontent.com https://*.googleapis.com https://*.googleusercontent.com https://graph.microsoft.com https://*.1drv.com https://*.sharepoint.com https://gitlab.com https://*.google.com https://fonts.gstatic.com https://fonts.googleapis.com; img-src * data:; media-src * data:; font-src * about:; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com;');
	    s.setAttribute('http-equiv', 'Content-Security-Policy');
 	    var t = document.getElementsByTagName('meta')[0];
      t.parentNode.insertBefore(s, t);
  } catch (e) {} // ignore
})();
window.DRAWIO_BASE_URL = 'https://drawio-plugin-attackgraphs.github.io/app';
window.DRAWIO_VIEWER_URL = '';
window.DRAW_MATH_URL = 'math';
window.DRAWIO_CONFIG = {"plugins": ["https://drawio-plugin-attackgraphs.github.io/app/plugins/attackgraphs.js"]};
urlParams['sync'] = 'manual'; //Disable Real-Time
urlParams['db'] = '0'; //dropbox
urlParams['gh'] = '0'; //github
urlParams['tr'] = '0'; //trello
urlParams['gapi'] = '0'; //Google Drive
urlParams['od'] = '0'; //OneDrive
urlParams['gl'] = '0'; //Gitlab
