# PhishShield 🛡️

> Extensão de navegador em **Manifest V3** para detecção e análise de ataques de phishing em tempo real via análise heurística de URL, inspeção contextual de DOM e utilitário de geração de ativos.

![Chrome Extension Manifest V3](https://img.shields.io/badge/Chrome-Manifest_V3-blue?style=for-the-badge&logo=googlechrome)
![JavaScript ES6+](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![Python 3.x](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python)
![License MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📂 Estrutura do Repositório

```text
phish-shield/
├── manifest.json
├── .gitignore
├── README.md
├── generate_icons.py
├── background/
│   └── service-worker.js
├── scripts/
│   ├── heuristics.js
│   └── content.js
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Visão Geral

O PhishShield monitora e analisa a segurança da navegação do usuário sem depender exclusivamente de blacklists estáticas ou APIs de terceiros. A extensão combina processamento assíncrono com inspeção no contexto da página para gerar um Score de Risco (0-100) em tempo real.

O repositório inclui também o utilitário generate_icons.py, que automatiza a criação dos ativos visuais e ícones PNG necessários para o funcionamento do Manifest V3 no Chrome.

## Funcionalidades Principais

⚡ **Análise Heurística em Milissegundos**: Avalia URLs no momento do carregamento da aba via Service Worker.

🎯 **Detecção de Typosquatting**: Utiliza o algoritmo de Distância de Levenshtein para identificar domínios falsos que imitam serviços conhecidos (ex: paypa1.com).

🧮 **Cálculo de Entropia de Shannon**: Identifica subdomínios aleatórios gerados por algoritmos maliciosos (DGA).

🔍 **Inspeção de DOM Contextual**: Detecta formulários de captura de senha rodando sob HTTP e desalinhamentos de atributo action no HTML.

🚨 **Alerta Visual com Injeção Dinâmica**: Exibe um banner de alerta no topo da página quando o nível de risco excede o seguro.

🖼️ **Gerador Automático de Ícones (Python)**: Script integrado usando Pillow para criar ícones PNG placeholder nas dimensões de 16px, 48px e 128px.

💾 **Cache Local com TTL**: Evita reprocessamento desnecessário usando chrome.storage.local.

## Arquitetura do Sistema

```
[ Navegador ] ──(Navigation Event)──► [ Background Service Worker ]
                                                │
                                                ├── Cache Match? ──► Retorna Score
                                                │
                                                └── Heuristics Engine
                                                        ├── Levenshtein Distance
                                                        ├── Entropy Calculation
                                                        └── IP & Subdomain Rules
                                                                │
[ Page Context ] ──► [ Content Script ] ◄────────────────────────┘
                           │
                   Inspeção de DOM (Forms / Passwords)
                           │
                   Score Final >= 70 ? ──► Injeta Banner de Alerta

```

## Como instalar e rodar o projeto

```
git clone https://github.com/laurabgularte/phish-shield.git
cd phish-shield
```

## Gerando os ícones (se a pasta /icons estiver vazia)

```
Instale a dependência de manipulação de imagem

pip install pillow

Execute o gerador de ícones

python generate_icons.py
```

## Carregar no navegador

Abra o Google Chrome (ou navegador baseado em Chromium).

Acesse a página de gerenciamento de extensões: chrome://extensions/.

Ative a chave "Modo do desenvolvedor" no canto superior direito.

Clique no botão "Carregar sem compactação" (Load unpacked).

Selecione a pasta raiz phish-shield do projeto.
