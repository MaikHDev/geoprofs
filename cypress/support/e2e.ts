// Import commands.js using ES2015 syntax:
import "./commands";

// Hide fetch/XHR requests from command log (optional, cleaner logs)
const app = window.top;
if (
  app &&
  !app.document.head.querySelector("[data-hide-command-log-request]")
) {
  const style = app.document.createElement("style");
  style.innerHTML =
    ".command-name-request, .command-name-xhr { display: none }";
  style.setAttribute("data-hide-command-log-request", "");
  app.document.head.appendChild(style);
}
