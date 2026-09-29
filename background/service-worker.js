import { evaluateURLHeuristics } from "../scripts/heuristics.js";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Horas

async function getCachedAnalysis(domain) {
  const result = await chrome.storage.local.get(domain);
  if (result[domain]) {
    const { timestamp, data } = result[domain];
    if (Date.now() - timestamp < CACHE_TTL_MS) {
      return data;
    }
  }
  return null;
}

async function setCachedAnalysis(domain, data) {
  await chrome.storage.local.set({
    [domain]: {
      timestamp: Date.now(),
      data,
    },
  });
}

function updateExtensionIcon(tabId, score) {
  let badgeText = "";
  let badgeColor = "#388E3C";

  if (score >= 70) {
    badgeText = "PERIGO";
    badgeColor = "#D32F2F";
  } else if (score >= 40) {
    badgeText = "ALERT";
    badgeColor = "#F57C00";
  }

  chrome.action.setBadgeText({ tabId, text: badgeText });
  chrome.action.setBadgeBackgroundColor({ tabId, color: badgeColor });
}

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Apenas o frame principal

  const url = details.url;
  if (
    !url ||
    url.startsWith("chrome://") ||
    url.startsWith("about:") ||
    url.startsWith("chrome-extension://")
  )
    return;

  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;

    let analysis = await getCachedAnalysis(domain);

    if (!analysis) {
      analysis = evaluateURLHeuristics(url);
      await setCachedAnalysis(domain, analysis);
    }

    updateExtensionIcon(details.tabId, analysis.score);
  } catch (e) {
    console.error("Erro na navegação do Service Worker:", e);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "ANALYZE_CURRENT_PAGE") {
    const heuristics = evaluateURLHeuristics(request.url);
    sendResponse({ heuristics });
  }
  return true;
});
