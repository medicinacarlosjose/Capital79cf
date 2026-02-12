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
  const now = new Date();

  for (let i = 0; i < monthsToShow; i++) {

    const d = new Date(now.getFullYear(), now.getMonth() + 1 + i, 1);
    const key = `${months[d.getMonth()]}-${d.getFullYear()}`;
    if (!data[key]) data[key] = [];

    const vista = data[key].filter(e => e.type === "vista");
    const parcelado = data[key].filter(e => e.type === "parcelado");
    const recorrente = data[key].filter(e => e.type === "recorrente");

    // 🔥 NOVA REGRA DO "MEU VALOR"
    const meuValor = data[key].filter(e =>
      e.type === "recorrente" ||
      (
        (e.type === "vista" || e.type === "parcelado") &&
        e.payer === "Carlos França"
      )
    );

    const sum = arr => arr.reduce((s, e) => s + e.value, 0);

    const totalVista = sum(vista);
    const totalParcelado = sum(parcelado);
    const totalRecorrente = sum(recorrente);
    const totalMeu = sum(meuValor);
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
        ${vista.map((e, idx) => `
          <div>
            R$ ${e.value.toFixed(2)} • ${e.payer}
            <button class="trash-btn" onclick="deleteExpense('${key}', ${idx})">🗑</button>
          </div>
        `).join("")}
      </div>

      <div class="summary-line" onclick="toggleDetails(this)">
        <span>Parcelado</span><span>R$ ${totalParcelado.toFixed(2)} [+]</span>
      </div>
      <div class="details hidden">
        ${parcelado.map((e, idx) => `
          <div>
            R$ ${e.value.toFixed(2)} • ${e.card} • ${e.payer}
            <button class="trash-btn" onclick="deleteExpense('${key}', ${idx})">🗑</button>
          </div>
        `).join("")}
      </div>

      <div class="summary-line" onclick="toggleDetails(this)">
        <span>Recorrente</span><span>R$ ${totalRecorrente.toFixed(2)} [+]</span>
      </div>
      <div class="details hidden">
        ${recorrente.map((e, idx) => `
          <div>
            R$ ${e.value.toFixed(2)} • ${e.payer}
            <button class="trash-btn" onclick="deleteExpense('${key}', ${idx})">🗑</button>
          </div>
        `).join("")}
      </div>

      <div class="summary-line">
        <span><strong>Meu valor</strong></span>
        <span><strong>R$ ${totalMeu.toFixed(2)}</strong></span>
      </div>
    `;

    monthsContainer.appendChild(card);
  }

  updateTop();
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
