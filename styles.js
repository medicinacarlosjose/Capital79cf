/***************************************************
 * CAPITAL 79 — styles.js FINAL (CORRIGIDO)
 * Compatível com file://
 ***************************************************/

/* ===================== ELEMENTOS ===================== */
const monthsContainer = document.getElementById("monthsContainer");
const modal = document.getElementById("modal");

const totalIncome = document.getElementById("totalIncome");
const currentExpense = document.getElementById("currentExpense");
const balance = document.getElementById("balance");

const expenseValue = document.getElementById("expenseValue");
const expenseType = document.getElementById("expenseType");
const expenseCard = document.getElementById("expenseCard");
const otherCard = document.getElementById("otherCard");
const expenseInstallments = document.getElementById("expenseInstallments");
const expensePayer = document.getElementById("expensePayer");
const otherPayer = document.getElementById("otherPayer");
const expenseMonth = document.getElementById("expenseMonth");

const months = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];

/* ===================== ESTADO ===================== */
/* ===================== ESTADO ===================== */
let data = {};
let income = 0;
let editingExpense = null;
let editingGroup = null;

/* ➕ CONTROLE DE QUANTOS MESES EXIBIR */
let monthsToShow = 12;

/* ===================== UTIL ===================== */
function generateGroupId() {
  return "grp_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatMonth(key) {
  const [m, y] = key.split("-");
  return `${m.charAt(0)}${m.slice(1).toLowerCase()} ${y.slice(2)}`;
}

/* ===================== TEMA ===================== */
function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "financeFlowTheme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
}

/* ===================== MODAL ===================== */
function openModal() {
  modal.classList.remove("hidden");
}
function closeModal() {
  modal.classList.add("hidden");
}

/* ===================== VISIBILIDADE ===================== */
expenseType.addEventListener("change", () => {
  const isParcelado = expenseType.value === "parcelado";
  expenseCard.classList.toggle("hidden", !isParcelado);
  expenseInstallments.classList.toggle("hidden", !isParcelado);
});
expensePayer.addEventListener("change", () => {
  otherPayer.classList.toggle("hidden", expensePayer.value !== "Outro");
});
expenseCard.addEventListener("change", () => {
  otherCard.classList.toggle("hidden", expenseCard.value !== "Outro");
});

/* ===================== SALVAR ===================== */
function saveExpense() {
  const value = parseFloat(expenseValue.value);
  if (isNaN(value)) return alert("Valor inválido");

  const type = expenseType.value;
  const payer = expensePayer.value === "Outro" ? otherPayer.value : expensePayer.value;
  const card = expenseCard.value === "Outro" ? otherCard.value : expenseCard.value;

  const year = new Date().getFullYear();
  const base = months.indexOf(expenseMonth.value);

  if (type === "parcelado") {
    const installments = parseInt(expenseInstallments.value) || 1;
    const part = value / installments;
    const groupId = generateGroupId();

    for (let i = 0; i < installments; i++) {
      const d = new Date(year, base + i, 1);
      const key = `${months[d.getMonth()]}-${d.getFullYear()}`;
      if (!data[key]) data[key] = [];
      data[key].push({ value: part, type, payer, card, groupId });
    }
  } else {
    const key = `${expenseMonth.value}-${year}`;
    if (!data[key]) data[key] = [];
    data[key].push({ value, type, payer, card });
  }

  persist();
  generateMonths();
  closeModal();
}

/* ===================== MESES ===================== */
function toggleDetails(el) {
  el.nextElementSibling.classList.toggle("hidden");
}

function generateMonths() {
  monthsContainer.innerHTML = "";
  const now = new Date();

for (let i = 0; i < monthsToShow; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = `${months[d.getMonth()]}-${d.getFullYear()}`;
    if (!data[key]) data[key] = [];

    const vista = data[key].filter(e => e.type === "vista");
    const parcelado = data[key].filter(e => e.type === "parcelado");
    const recorrente = data[key].filter(e => e.type === "recorrente");

    const sum = arr => arr.reduce((s, e) => s + e.value, 0);

    const totalVista = sum(vista);
    const totalParcelado = sum(parcelado);
    const totalRecorrente = sum(recorrente);
    const totalMes = totalVista + totalParcelado + totalRecorrente;

    const card = document.createElement("div");
    card.className = "month-card";

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0;">
          ${formatMonth(key)}
          <span style="color:#ff4d4d; font-size:14px; margin-left:8px;">
            Total: R$ ${totalMes.toFixed(2)}
          </span>
        </h3>
        <button class="trash-btn" onclick="confirmClearMonth('${key}')">🗑️</button>
      </div>

      <div class="summary-line" onclick="toggleDetails(this)">
        <span>À vista</span><span>R$ ${totalVista.toFixed(2)} [+]</span>
      </div>
      <div class="details hidden">
        ${vista.map(e => `<div>R$ ${e.value.toFixed(2)} • ${e.payer}</div>`).join("")}
      </div>

      <div class="summary-line" onclick="toggleDetails(this)">
        <span>Parcelado</span><span>R$ ${totalParcelado.toFixed(2)} [+]</span>
      </div>
      <div class="details hidden">
        ${parcelado.map(e => `<div>R$ ${e.value.toFixed(2)} • ${e.card} • ${e.payer}</div>`).join("")}
      </div>

      <div class="summary-line" onclick="toggleDetails(this)">
        <span>Recorrente</span><span>R$ ${totalRecorrente.toFixed(2)} [+]</span>
      </div>
      <div class="details hidden">
        ${recorrente.map(e => `<div>R$ ${e.value.toFixed(2)} • ${e.payer}</div>`).join("")}
      </div>
    `;

    monthsContainer.appendChild(card);
  }

// BOTÃO + MESES
const moreBtn = document.createElement("div");
moreBtn.style.gridColumn = "1 / -1";
moreBtn.style.textAlign = "center";
moreBtn.style.marginTop = "20px";

moreBtn.innerHTML = `
  <button onclick="loadMoreMonths()">
    ＋ Meses
  </button>
`;

monthsContainer.appendChild(moreBtn);

  updateTop();
}

function loadMoreMonths() {
  monthsToShow += 12;
  generateMonths();
}

/* ===================== TOPO ===================== */
function updateTop() {
  income = parseFloat(totalIncome.value) || 0;
  const now = new Date();
  const key = `${months[now.getMonth()]}-${now.getFullYear()}`;

  const arr = data[key] || [];
  const totalMes = arr.reduce((s, e) => s + e.value, 0);

  currentExpense.innerText = `R$ ${totalMes.toFixed(2)}`;
  balance.innerText = `R$ ${(income - totalMes).toFixed(2)}`;
}

/* ===================== LIMPAR MÊS ===================== */
function confirmClearMonth(key) {
  if (!confirm(`Deseja apagar TODOS os lançamentos de ${formatMonth(key)}?`)) return;
  delete data[key];
  persist();
  generateMonths();
}

/* ===================== STORAGE ===================== */
function persist() {
  localStorage.setItem("financeFlowData", JSON.stringify(data));
  localStorage.setItem("financeFlowIncome", totalIncome.value);
}

/* ===================== INIT ===================== */
(function init() {
  const d = localStorage.getItem("financeFlowData");
  if (d) data = JSON.parse(d);

  const inc = localStorage.getItem("financeFlowIncome");
  if (inc) totalIncome.value = inc;

  if (localStorage.getItem("financeFlowTheme") === "light") {
    document.body.classList.add("light");
  }

  generateMonths();
  updateTop();
})();

function exportData() {
  const backup = {
    financeFlowData: data,
    financeFlowIncome: totalIncome.value,
    financeFlowTheme: localStorage.getItem("financeFlowTheme") || "dark",
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `capital79-backup-${new Date().toISOString().slice(0,10)}.json`;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);

      if (!imported.financeFlowData || !imported.financeFlowIncome) {
        alert("Arquivo inválido ou corrompido.");
        return;
      }

      if (!confirm("Deseja substituir TODOS os dados atuais por este backup?")) {
        return;
      }

      // Restaurar dados
      data = imported.financeFlowData;
      totalIncome.value = imported.financeFlowIncome;

      localStorage.setItem(
        "financeFlowData",
        JSON.stringify(imported.financeFlowData)
      );
      localStorage.setItem(
        "financeFlowIncome",
        imported.financeFlowIncome
      );

      if (imported.financeFlowTheme) {
        localStorage.setItem("financeFlowTheme", imported.financeFlowTheme);
        document.body.classList.toggle(
          "light",
          imported.financeFlowTheme === "light"
        );
      }

      generateMonths();
      updateTop();

      alert("Dados importados com sucesso!");

    } catch (err) {
      alert("Erro ao importar o arquivo.");
      console.error(err);
    }
  };

  reader.readAsText(file);
}

moreBtn.className = "months-more-btn";

const pinModal = document.getElementById("pinLock");
const pinInput = document.getElementById("pinInput");
const pinMessage = document.getElementById("pinMessage");

function hashPin(pin) {
  return btoa(pin.split("").reverse().join(""));
}

function checkPinOnStart() {
  const savedPin = localStorage.getItem("capital79_pin");

  pinModal.classList.remove("hidden");

  if (!savedPin) {
    pinMessage.innerText = "Crie um PIN de 4 dígitos";
  } else {
    pinMessage.innerText = "Digite seu PIN";
  }
}

function confirmPin() {
  const pin = pinInput.value;

  if (pin.length !== 4) {
    alert("PIN deve ter 4 dígitos");
    return;
  }

  const savedPin = localStorage.getItem("capital79_pin");

  if (!savedPin) {
    localStorage.setItem("capital79_pin", hashPin(pin));
    pinModal.classList.add("hidden");
    pinInput.value = "";
    return;
  }

  if (hashPin(pin) === savedPin) {
    pinModal.classList.add("hidden");
    pinInput.value = "";
  } else {
    alert("PIN incorreto");
    pinInput.value = "";
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("Service Worker registrado"))
      .catch(err => console.error("Erro no SW:", err));
  });
}
