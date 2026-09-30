const TARGET_DOMAINS = [
  "google.com",
  "facebook.com",
  "paypal.com",
  "amazon.com",
  "netflix.com",
  "instagram.com",
  "github.com",
  "microsoft.com",
  "bradesco.com.br",
  "itau.com.br",
  "caixa.gov.br",
  "nubank.com.br",
  "santander.com.br",
  "bb.com.br",
  "whatsapp.com",
  "linkedin.com",
];

function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
}

function calculateEntropy(str) {
  const len = str.length;
  if (!len) return 0;
  const frequencies = {};
  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  return Object.values(frequencies).reduce((sum, count) => {
    const p = count / len;
    return sum - p * Math.log2(p);
  }, 0);
}

export function evaluateURLHeuristics(urlString) {
  let riskScore = 0;
  const flags = [];

  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();

    // 1. Uso de IP direto em vez de nome de domínio
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(hostname)) {
      riskScore += 45;
      flags.push("Uso de endereço IP bruto em vez de nome de domínio.");
    }

    // 2. Quantidade excessiva de subdomínios
    const domainParts = hostname.split(".");
    if (domainParts.length > 4) {
      riskScore += 20;
      flags.push("Quantidade anormalmente alta de subdomínios.");
    }

    // 3. Palavras de gatilho sensíveis em domínios não oficiais
    const keywords = [
      "login",
      "verify",
      "secure",
      "account",
      "update",
      "banking",
      "senha",
      "conta",
      "recuperar",
    ];
    const matchedKeywords = keywords.filter((kw) => hostname.includes(kw));
    const isTarget = TARGET_DOMAINS.some((td) => hostname.endsWith(td));

    if (matchedKeywords.length > 0 && !isTarget) {
      riskScore += 25;
      flags.push(
        `Termos de alta sensibilidade (${matchedKeywords.join(", ")}) em domínio não verificado.`,
      );
    }

    // 4. Detecção de Typosquatting (Levenshtein)
    const mainDomain = domainParts.slice(-2).join(".");
    for (const target of TARGET_DOMAINS) {
      const distance = levenshteinDistance(mainDomain, target);
      if (distance > 0 && distance <= 2) {
        riskScore += 50;
        flags.push(
          `Possível imitação maliciosa (Typosquatting) de '${target}'.`,
        );
        break;
      }
    }

    // 5. Entropia do Hostname (Caracteres aleatórios)
    const entropy = calculateEntropy(hostname);
    if (entropy > 4.2) {
      riskScore += 15;
      flags.push(
        "Alta entropia no nome do host (caracteres aleatórios ou gerados por algoritmo).",
      );
    }

    // 6. Ausência de HTTPS em portas padrão
    if (url.protocol === "http:") {
      riskScore += 20;
      flags.push("Conexão sem criptografia SSL/TLS (HTTP).");
    }
  } catch (err) {
    flags.push("URL inválida ou malformada.");
  }

  return {
    score: Math.min(riskScore, 100),
    flags,
  };
}
