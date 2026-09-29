function analyzeDOMContext() {
  const domFlags = [];
  let domRiskScore = 0;

  const currentOrigin = window.location.origin;
  const isHttps = window.location.protocol === "https:";

  // 1. Campos de senha em HTTP
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  if (passwordInputs.length > 0 && !isHttps) {
    domRiskScore += 40;
    domFlags.push(
      "Formulário de credenciais/senha em página sem criptografia (HTTP).",
    );
  }

  // 2. Redirecionamento de Formulário
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    const action = form.getAttribute("action");
    if (action && action.startsWith("http")) {
      try {
        const actionOrigin = new URL(action).origin;
        if (actionOrigin !== currentOrigin) {
          domRiskScore += 30;
          domFlags.push(
            `Formulário enviando dados para um servidor externo distinto: (${actionOrigin}).`,
          );
        }
      } catch (e) {
        // URL malformada no atributo action
      }
    }
  });

  // 3. Discrepância em textos de links
  const links = document.querySelectorAll("a[href]");
  links.forEach((link) => {
    const text = link.innerText.trim().toLowerCase();
    const href = link.getAttribute("href");

    if (
      href &&
      (text.includes("http://") ||
        text.includes("https://") ||
        text.includes("www."))
    ) {
      try {
        const targetHost = new URL(
          href.startsWith("http") ? href : `https://${href}`,
        ).hostname;
        if (!text.includes(targetHost)) {
          domRiskScore += 25;
          domFlags.push(
            "Link exibe um endereço visual no texto, mas redireciona para outro domínio.",
          );
        }
      } catch (e) {}
    }
  });

  return {
    score: domRiskScore,
    flags: domFlags,
  };
}

function injectWarningBanner(score, flags) {
  if (document.getElementById("phish-shield-alert-banner")) return;

  const banner = document.createElement("div");
  banner.id = "phish-shield-alert-banner";
  banner.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    background-color: #d32f2f !important;
    color: #ffffff !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    padding: 16px !important;
    z-index: 2147483647 !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
    box-sizing: border-box !important;
  `;

  banner.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto;">
      <h2 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
        ⚠️ ALERTA DE SEGURANÇA: Possível Ataque de Phishing (Risco: ${score}/100)
      </h2>
      <p style="margin: 0 0 8px 0; font-size: 13px;">O PhishShield detectou anomalias graves nesta página:</p>
      <ul style="margin: 0 0 12px 0; padding-left: 20px; font-size: 12px;">
        ${flags.map((flag) => `<li style="margin-bottom: 2px;">${flag}</li>`).join("")}
      </ul>
      <button id="phish-shield-dismiss-btn" style="background: #ffffff; color: #d32f2f; border: none; padding: 6px 14px; font-size: 12px; font-weight: bold; cursor: pointer; border-radius: 4px;">
        Ignorar aviso e continuar
      </button>
    </div>
  `;

  document.body.prepend(banner);

  document
    .getElementById("phish-shield-dismiss-btn")
    .addEventListener("click", () => {
      banner.remove();
    });
}

function initDOMAnalysis() {
  const domResult = analyzeDOMContext();

  chrome.runtime.sendMessage(
    { type: "ANALYZE_CURRENT_PAGE", url: window.location.href },
    (response) => {
      if (!response || !response.heuristics) return;

      const totalScore = Math.min(
        response.heuristics.score + domResult.score,
        100,
      );
      const combinedFlags = [...response.heuristics.flags, ...domResult.flags];

      if (totalScore >= 70) {
        injectWarningBanner(totalScore, combinedFlags);
      }
    },
  );
}

initDOMAnalysis();
