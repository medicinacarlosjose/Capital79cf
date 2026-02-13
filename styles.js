/***************************************************
 * CAPITAL 79 — styles.js FINAL (ATUALIZADO)
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
let data = {};
let income = 0;
let monthsToShow = 12;

/* ===================== UTIL ===================== */
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
function openModal() { modal.classList.remove("hidden"); }
function closeModal() { modal.classList.add("hidden"); }

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
  const key = `${expenseMonth.value}-${year}`;

  if (!data[key]) data[key] = [];
  data[key].push({ value, type, payer, card });

  persist();
  generateMonths();
  closeModal();
}

/* ===================== MESES ===================== */
function toggleDetails(el) {
  el.nextElementSibling.classList.toggle("hidden");
}

function deleteExpense(key, index) {
  data[key].splice(index, 1);
  persist();
  generateMonths();
}

function generateMonths() {
  monthsContainer.innerHTML = "";

  const currentKey = "MAR-2026"; // FIXO COMO VOCÊ PEDIU

  for (let i = -12; i <= 12; i++) {
    const d = new Date(2026, 2 + i, 1); // Março é índice 2
    const key = `${months[d.getMonth()]}-${d.getFullYear()}`;

    if (!Array.isArray(data[key])) data[key] = [];

    const total = (data[key] || []).reduce((s, e) => s + e.value, 0);

    const avista = data[key]
      .filter(e => e.type === "vista")
      .reduce((s, e) => s + e.value, 0);

    const parcelado = data[key]
      .filter(e => e.type === "parcelado")
      .reduce((s, e) => s + e.value, 0);

    const recorrente = data[key]
      .filter(e => e.type === "recorrente")
      .reduce((s, e) => s + e.value, 0);

    const meuValor = total;

    const card = document.createElement("div");
    card.className = "month-card";

    card.innerHTML = `
      <h3>${months[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}
        <span style="color:red; font-size:13px;">
          Total: R$ ${total.toFixed(2)}
        </span>
      </h3>

      <div class="month-block">
        À vista <span style="float:right">R$ ${avista.toFixed(2)} [+]</span>
      </div>

      <div class="month-block">
        Parcelado <span style="float:right">R$ ${parcelado.toFixed(2)} [+]</span>
      </div>

      <div class="month-block">
        Recorrente <span style="float:right">R$ ${recorrente.toFixed(2)} [+]</span>
      </div>

      <div class="month-block" style="font-weight:bold;">
        Meu valor <span style="float:right">R$ ${meuValor.toFixed(2)}</span>
      </div>

      ${
        key === currentKey
        ? `
        <div class="month-block" style="font-weight:bold; margin-top:4px;">
          Saldo atual 
          <span style="float:right">
            R$ ${(income - meuValor).toFixed(2)}
          </span>
        </div>
        `
        : ""
      }
    `;

    monthsContainer.appendChild(card);
  }

  updateTopSummary();
}

/* ===================== TOPO ===================== */
function updateTop() {
  income = parseFloat(totalIncome.value) || 0;

  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const key = `${months[next.getMonth()]}-${next.getFullYear()}`;

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
