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

  function toKebabCaseName(value) {
    if (!value) {
      return "";
    }
    if (value.indexOf("-") >= 0) {
      return value.toLowerCase();
    }
    return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  }

  function normalizeComponentNames(rawComponents) {
    if (!rawComponents) {
      return [];
    }

    var list = Array.isArray(rawComponents) ? rawComponents : String(rawComponents).split(",");
    return list
      .map(function (name) {
        return toKebabCaseName(String(name || "").trim());
      })
      .filter(function (name) {
        return name.length > 0;
      });
  }

  function buildFrontdoorUrl(endpoint, sid) {
    var base = String(endpoint || "").replace(/\/+$/, "");
    return base + "/secur/frontdoor.jsp?sid=" + encodeURIComponent(sid);
  }

  function applyAttributes(element, attributes) {
    if (!attributes || typeof attributes !== "object") {
      return;
    }

    Object.keys(attributes).forEach(function (key) {
      var value = attributes[key];
      if (value === undefined || value === null) {
        return;
      }
      if (typeof value === "object") {
        element[key] = value;
        return;
      }
      element.setAttribute(key, String(value));
    });
  }

  function initializeLightningOut2() {
    var components = normalizeComponentNames(config.components);
    var mount = document.getElementById("lightning-component-slot");

    if (!mount) {
      setState("Lightning Out mount element is missing.", true);
      return;
    }

    if (!config.lightningEndPoint || !config.appId || components.length === 0) {
      setState(
        "Missing LO2 config. Set lightningEndPoint, appId, and components in lightning-config.js.",
        true
      );
      return;
    }

    var loApp = document.createElement("lightning-out-application");
    loApp.setAttribute("app-id", config.appId);
    loApp.setAttribute("components", components.join(","));
    loApp.setAttribute("frontdoor-url", buildFrontdoorUrl(config.lightningEndPoint, sessionId));

    var renderComponents = function () {
      mount.innerHTML = "";
      components.forEach(function (componentTag) {
        var componentEl = document.createElement(componentTag);
        var perComponentAttrs = Object.assign(
          {},
          (config.componentAttributes && config.componentAttributes[componentTag]) || {}
        );

        // For this POC, always pass the manually entered Session ID to components.
        perComponentAttrs.sessionId = sessionId;
        if (perComponentAttrs.requireSessionId === undefined) {
          perComponentAttrs.requireSessionId = true;
        }

        applyAttributes(componentEl, perComponentAttrs);
        componentEl.style.display = componentEl.style.display || "block";
        componentEl.style.width = componentEl.style.width || "100%";
        componentEl.style.maxWidth = componentEl.style.maxWidth || "100%";
        mount.appendChild(componentEl);
      });
    };

    loApp.addEventListener("lo.application.ready", function () {
      setState("Lightning Out 2.0 session established.", false);
      renderComponents();
    });

    loApp.addEventListener("lo.application.error", function (event) {
      var message = event && event.detail && event.detail.message
        ? event.detail.message
        : "Unable to establish Lightning Out 2.0 session.";
      setState(message, true);
    });

    loApp.addEventListener("lo.component.ready", function () {
      setState("Lightning Out 2.0 component loaded successfully.", false);
    });

    loApp.addEventListener("lo.component.error", function (event) {
      var message = event && event.detail && event.detail.message
        ? event.detail.message
        : "Lightning Out 2.0 component failed to render.";
      setState(message, true);
    });

    root.appendChild(loApp);
    setState("Initializing Lightning Out 2.0 application...", false);
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
    config.lightningEndPoint && config.appId && normalizeComponentNames(config.components).length;

  if (!hasRequiredConfig) {
    root.innerHTML =
      '<div class="placeholder-ready"><h3>Lightning Out 2.0 placeholder ready</h3><p>Set <code>lightningEndPoint</code>, <code>appId</code>, and <code>components</code> in <code>assets/js/lightning-config.js</code> to initialize a real component.</p></div>';
    return;
  }

  root.innerHTML =
    '<div class="placeholder-ready"><h3>Attempting Lightning Out 2.0 initialization...</h3><p>If your Salesforce endpoint allows access and the app/component are valid, content will load below.</p><div id="lightning-component-slot"></div></div>';

  if (!config.lightningOutScriptUrl) {
    setState(
      "Lightning Out script missing. Set lightningOutScriptUrl in lightning-config.js.",
      true
    );
    return;
  }

  if (customElements.get("lightning-out-application")) {
    initializeLightningOut2();
    return;
  }

  setState("Loading Lightning Out script...", false);
  loadScript(
    config.lightningOutScriptUrl,
    function () {
      if (!customElements.get("lightning-out-application")) {
        setState("Lightning Out 2.0 script loaded, but web components are unavailable.", true);
        return;
      }
      initializeLightningOut2();
    },
    function () {
      setState("Failed to load Lightning Out script URL.", true);
    }
  );
})();
