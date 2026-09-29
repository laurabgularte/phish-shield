document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return;

  chrome.runtime.sendMessage(
    { type: "ANALYZE_CURRENT_PAGE", url: tab.url },
    (response) => {
      if (!response || !response.heuristics) return;

      const { score, flags } = response.heuristics;

      const scoreEl = document.getElementById("score-value");
      const badgeEl = document.getElementById("status-badge");
      const flagsList = document.getElementById("flags-list");

      scoreEl.innerText = `${score} / 100`;

      if (score >= 70) {
        badgeEl.innerText = "Alto Risco";
        badgeEl.style.backgroundColor = "#ffebee";
        badgeEl.style.color = "#c62828";
        scoreEl.style.color = "#c62828";
      } else if (score >= 40) {
        badgeEl.innerText = "Atenção";
        badgeEl.style.backgroundColor = "#fff3e0";
        badgeEl.style.color = "#ef6c00";
        scoreEl.style.color = "#ef6c00";
      } else {
        badgeEl.innerText = "Seguro";
        badgeEl.style.backgroundColor = "#e8f5e9";
        badgeEl.style.color = "#2e7d32";
        scoreEl.style.color = "#2e7d32";
      }

      flagsList.innerHTML =
        flags.length > 0
          ? flags.map((f) => `<li>${f}</li>`).join("")
          : "<li>Nenhum vetor de risco detectado na URL.</li>";
    },
  );
});
