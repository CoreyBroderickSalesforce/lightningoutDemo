(function () {
  var config = window.LightningOutPOCConfig || {};
  var storageKey = config.storageKey || "sf-session-id";
  var sessionId = sessionStorage.getItem(storageKey);
  var sessionState = document.getElementById("session-state");
  var root = document.getElementById("lightning-out-root");
  var clearButton = document.getElementById("clear-session");

  function setState(message, isError) {
    if (!sessionState) {
      return;
    }
    sessionState.textContent = message;
    sessionState.classList.toggle("is-error", Boolean(isError));
  }

  function clearSession() {
    sessionStorage.removeItem(storageKey);
    window.location.href = "index.html";
  }

  function maskSession(value) {
    if (!value || value.length < 12) {
      return "Session detected";
    }
    return value.slice(0, 6) + "..." + value.slice(-4);
  }

  function loadScript(src, onLoad, onError) {
    var script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = onLoad;
    script.onerror = onError;
    document.head.appendChild(script);
  }

  function initializeLightning() {
    try {
      window.$Lightning.use(
        config.lightningApp,
        function () {
          window.$Lightning.createComponent(
            config.componentName,
            config.componentAttributes || {},
            "lightning-component-slot",
            function () {
              setState("Lightning Out component loaded successfully.", false);
            }
          );
        },
        config.lightningEndPoint,
        sessionId
      );
    } catch (error) {
      setState("Lightning Out init failed: " + error.message, true);
    }
  }

  if (clearButton) {
    clearButton.addEventListener("click", clearSession);
  }

  if (!sessionId) {
    setState("No Session ID found. Return to the support page and enter one.", true);
    root.innerHTML =
      '<div class="placeholder-empty"><p>Session missing for Lightning Out initialization.</p><a class="btn-primary" href="index.html">Back to support page</a></div>';
    return;
  }

  setState("Session loaded: " + maskSession(sessionId), false);

  var hasRequiredConfig =
    config.lightningEndPoint && config.lightningApp && config.componentName;

  if (!hasRequiredConfig) {
    root.innerHTML =
      '<div class="placeholder-ready"><h3>Lightning Out placeholder ready</h3><p>Set <code>lightningEndPoint</code>, <code>lightningApp</code>, and <code>componentName</code> in <code>assets/js/lightning-config.js</code> to initialize a real component.</p></div>';
    return;
  }

  root.innerHTML =
    '<div class="placeholder-ready"><h3>Attempting Lightning Out initialization...</h3><p>If your Salesforce endpoint allows access and the app/component are valid, content will load below.</p><div id="lightning-component-slot"></div></div>';

  if (window.$Lightning && typeof window.$Lightning.use === "function") {
    initializeLightning();
    return;
  }

  if (!config.lightningOutScriptUrl) {
    setState(
      "Lightning Out script missing. Set lightningOutScriptUrl in lightning-config.js.",
      true
    );
    return;
  }

  setState("Loading Lightning Out script...", false);
  loadScript(
    config.lightningOutScriptUrl,
    function () {
      if (!window.$Lightning || typeof window.$Lightning.use !== "function") {
        setState("Lightning Out script loaded, but $Lightning is unavailable.", true);
        return;
      }
      initializeLightning();
    },
    function () {
      setState("Failed to load Lightning Out script URL.", true);
    }
  );
})();
