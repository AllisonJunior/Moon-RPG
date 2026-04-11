// =========================
// NAV
// =========================
function nav(_page) { 
    window.location.href = _page; 
}

// =========================
// MARKDOWN + TOOLTIP PARSER
// =========================
function parseCustomTooltips(text) {

    // [texto](url){key}
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)\{([^}]+)\}/g,
        (match, content, url, key) => {
            return `<a href="${url}" target="_blank" data_tooltip="${key}">${content}</a>`;
        }
    );

    // [texto]{key}
    text = text.replace(/\[([^\]]+)\]\{([^}]+)\}/g,
        (match, content, key) => {
            return `<span data_tooltip="${key}">${content}</span>`;
        }
    );

    return text;
}

// =========================
// LOAD MARKDOWN
// =========================
function loadMarkdown(path, element) {
    fetch(path)
        .then(response => response.text())
        .then(text => {

            const parsed = parseCustomTooltips(text);
            const html = marked.parse(parsed);

            element.innerHTML = html;
        })
        .catch(error => {
            console.error("Erro ao carregar Markdown:", error);
        });
}

function initMarkdown() {
    const elements = document.querySelectorAll("[mkd-content]");

    elements.forEach(element => {
        const path = element.getAttribute("mkd-content");

        if (path) {
            loadMarkdown(path, element);
        }
    });
}

function changeMarkdown(path) {
    const element = document.querySelector("[mkd-content]");
    if (!element) return;

    loadMarkdown(path, element);
}

// =========================
// BOTÕES DE TROCA DE MARKDOWN
// =========================
function initMarkdownButtons() {
    const buttons = document.querySelectorAll(".nav-right button");

    // 🔹 Se não houver botões → usa comportamento padrão
    if (!buttons.length) {
        initMarkdown();
        return;
    }

    const STORAGE_KEY = "selectedMarkdown";

    function setActiveButton(button) {
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove("active");
        });

        button.disabled = true;
        button.classList.add("active");
    }

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const path = button.getAttribute("data-md");
            if (!path) return;

            changeMarkdown(path);
            setActiveButton(button);

            // 🔹 SALVAR ESCOLHA (OPCIONAL)
            // 👉 DESCOMENTE para reativar memória do último botão clicado
            // localStorage.setItem(STORAGE_KEY, path);
        });
    });

    // =========================
    // DEFINE BOTÃO INICIAL
    // =========================

    let initialButton = null;

    // 🔴 MODO ATUAL: FORÇA SEMPRE O DEFAULT
    // (ignora localStorage)

    // =========================
    // 🔵 PARA REATIVAR O LOCALSTORAGE:
    // descomente o bloco abaixo e remova o modo atual
    /*
    const savedPath = localStorage.getItem(STORAGE_KEY);

    if (savedPath) {
        initialButton = [...buttons].find(btn => btn.getAttribute("data-md") === savedPath);
    }
    */
    // =========================

    // 🔹 Usa botão com data-default
    if (!initialButton) {
        initialButton = [...buttons].find(btn => btn.hasAttribute("data"));
    }

    // 🔹 fallback → primeiro botão
    if (!initialButton) {
        initialButton = buttons[0];
    }

    if (initialButton) {
        const path = initialButton.getAttribute("data-md");

        if (path) {
            changeMarkdown(path);
        }

        setActiveButton(initialButton);
    }
}

// =========================
// TOOLTIP SYSTEM
// =========================

let tooltipData = {};
const TOOLTIP_PATH = "../../bd/info.json";

// 🔹 Carrega JSON
async function loadTooltips() {
    try {
        const response = await fetch(TOOLTIP_PATH);
        tooltipData = await response.json();
    } catch (err) {
        console.error("Erro ao carregar tooltips:", err);
    }
}

// 🔹 Cria tooltip global
const tooltip = document.createElement("div");
tooltip.classList.add("tooltip-box");
document.body.appendChild(tooltip);

// 🔹 Inicializa eventos
function initTooltips() {
    let activeTooltipTarget = null;

    const isTooltipVisible = () => tooltip.classList.contains("is-visible");

    const showTooltip = (target, text) => {
        activeTooltipTarget = target;
        tooltip.innerText = text;
        tooltip.scrollTop = 0;
        tooltip.classList.add("is-visible");
    };

    const hideTooltip = () => {
        activeTooltipTarget = null;
        tooltip.classList.remove("is-visible");
    };

    // 🔹 MOSTRAR TOOLTIP
    document.addEventListener("mouseover", (e) => {
        const target = e.target.closest("[data_tooltip]");
        if (!target) return;

        const key = target.getAttribute("data_tooltip");
        showTooltip(target, tooltipData[key] || "Texto não encontrado");
    });

    // 🔹 POSICIONAMENTO
    document.addEventListener("mousemove", (e) => {

        const target = e.target.closest("[data_tooltip]");

        if (!target && !tooltip.contains(e.target)) return;

        if (tooltip.contains(e.target)) return;

        const padding = 12;
        const offset = 20;

        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;

        let x = e.clientX + offset;
        let y = e.clientY + offset;

        if (x + tooltipWidth > window.innerWidth - padding) {
            x = e.clientX - tooltipWidth - offset;
        }

        if (y + tooltipHeight > window.innerHeight - padding) {
            y = e.clientY - tooltipHeight - offset;
        }

        x = Math.max(padding, Math.min(x, window.innerWidth - tooltipWidth - padding));
        y = Math.max(padding, Math.min(y, window.innerHeight - tooltipHeight - padding));

        tooltip.style.left = x + "px";
        tooltip.style.top = y + "px";
    });

    // 🔹 ESCONDER TOOLTIP
    document.addEventListener("mouseout", (e) => {
        const from = e.target.closest("[data_tooltip]");
        const to = e.relatedTarget;

        if (from && (to?.closest("[data_tooltip]") || tooltip.contains(to))) {
            return;
        }

        if (from) {
            hideTooltip();
        }
    });

    // 🔹 SCROLL CONTROLADO
    document.addEventListener("wheel", (e) => {
        if (!isTooltipVisible()) return;

        const overTooltip = tooltip.matches(":hover") || tooltip.contains(e.target);
        const overActiveTerm = Boolean(activeTooltipTarget?.isConnected && activeTooltipTarget.matches(":hover"));
        const tooltipCanScroll = tooltip.scrollHeight > tooltip.clientHeight;

        if (!overTooltip && !overActiveTerm) return;
        if (!tooltipCanScroll) return;

        e.preventDefault();
        e.stopPropagation();
        tooltip.scrollTop += e.deltaY;
    }, { passive: false, capture: true });
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", async () => {
    await loadTooltips();
    initTooltips();

    // 🔥 Auto-detecta se usa botões ou não
    initMarkdownButtons();
});