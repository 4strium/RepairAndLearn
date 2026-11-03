/* Formulaire de contact : pré-remplissage, validation en français, envoi Netlify Forms (AJAX). */
(() => {
  "use strict";

  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const success = document.querySelector("[data-form-success]");
  const errorBox = form.querySelector("[data-form-error]");
  const submitBtn = form.querySelector("[data-submit]");
  const submitLabel = submitBtn.querySelector("span");

  /* ?sujet=guide|intervention|rejoindre|repair-cafe|autre */
  const wanted = new URLSearchParams(location.search).get("sujet");
  if (wanted) {
    const option = form.querySelector(`option[data-key="${CSS.escape(wanted)}"]`);
    if (option) option.selected = true;
  }

  const messages = {
    nom: "Dis-nous comment t'appeler.",
    email: "Indique une adresse e-mail valide pour que l'on puisse te répondre.",
    message: "Écris-nous quelques mots (10 caractères minimum).",
    consentement: "Merci de cocher la case pour pouvoir envoyer ton message.",
  };

  function setError(field, text) {
    const err = form.querySelector(`[data-error-for="${field.id}"]`);
    if (!err) return;
    err.textContent = text ?? "";
    err.hidden = !text;
    if (text) {
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", err.id || (err.id = `${field.id}-error`));
    } else {
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
    }
  }

  function validateField(field) {
    const ok = field.type === "checkbox" ? field.checked : field.checkValidity() && field.value.trim() !== "";
    setError(field, ok ? "" : messages[field.name]);
    return ok;
  }

  const required = [...form.querySelectorAll("[required]")];
  required.forEach((f) => {
    f.addEventListener("blur", () => f.value !== "" && validateField(f));
    f.addEventListener("input", () => f.hasAttribute("aria-invalid") && validateField(f));
    f.addEventListener("change", () => f.hasAttribute("aria-invalid") && validateField(f));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    const invalid = required.filter((f) => !validateField(f));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    // Piège à robots : champ invisible rempli = on fait semblant d'avoir envoyé.
    if (form.elements["bot-field"]?.value) return showSuccess();

    submitBtn.disabled = true;
    submitLabel.textContent = "Envoi en cours…";
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!res.ok) throw new Error(String(res.status));
      showSuccess();
    } catch {
      errorBox.hidden = false;
      errorBox.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } finally {
      submitBtn.disabled = false;
      submitLabel.textContent = "Envoyer le message";
    }
  });

  function showSuccess() {
    form.hidden = true;
    success.hidden = false;
    success.focus();
    success.scrollIntoView({ block: "center", behavior: "smooth" });
    form.reset();
  }

  document.querySelector("[data-form-again]")?.addEventListener("click", () => {
    success.hidden = true;
    form.hidden = false;
    form.elements.nom.focus();
  });
})();
