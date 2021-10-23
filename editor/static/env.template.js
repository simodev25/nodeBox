(function(window) {
  window.env = window.env || {};

  // Environment variables
  window["env"]["apiUrl"] = "${NODE_HOST}";
  window["env"]["endpoint"] = "${ENDPOINT}";
})(this);
