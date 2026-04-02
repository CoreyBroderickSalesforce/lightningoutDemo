(function () {
  var form = document.getElementById("session-form");
  if (!form) {
    return;
  }

  var sessionInput = document.getElementById("session-id");
  var errorMessage = document.getElementById("session-error");
  var storageKey = "sf-session-id";

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var value = sessionInput.value.trim();
    if (!value) {
      errorMessage.hidden = false;
      sessionInput.setAttribute("aria-invalid", "true");
      sessionInput.focus();
      return;
    }

    errorMessage.hidden = true;
    sessionInput.removeAttribute("aria-invalid");
    sessionStorage.setItem(storageKey, value);
    window.location.href = "host.html";
  });
})();
