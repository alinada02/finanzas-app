// ==========================================
// 1. SELECCIÓN DE ELEMENTOS DEL DOM
// ==========================================
const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');

const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const transactionListEl = document.getElementById('transaction-list');

// ==========================================
// 2. MEMORIA DE LA APLICACIÓN
// ==========================================
let transactions = JSON.parse(localStorage.getItem('finanzas_transactions')) || [];
let expenseChartInstance = null;
let barChartInstance = null; // Añadimos una variable para el nuevo gráfico de barras

// ==========================================
// 3. RENDERIZADO DE GRÁFICOS (Chart.js)
// ==========================================
function renderCharts() {
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    const barCtx = document.getElementById('barChart').getContext('2d');

    // --- Lógica del Gráfico de Rosca (Gastos por Categoría) ---
    const expenses = transactions.filter(t => t.type === 'expense');
    const categories = ['Trabajo', 'Comida', 'Servicios', 'Transporte', 'Entretenimiento', 'Otros'];
    
    const totalsByCategory = categories.map(cat => {
        return expenses
            .filter(t => t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0);
    });

    if (expenseChartInstance) {
        expenseChartInstance.destroy();
    }

    expenseChartInstance = new Chart(expenseCtx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: totalsByCategory,
                backgroundColor: ['#38bdf8', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#64748b'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%', // Hace la rosca más delgada y moderna
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } }
            }
        }
    });

    // --- Lógica del Gráfico de Barras (Ingresos vs Gastos) ---
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

    if (barChartInstance) {
        barChartInstance.destroy();
    }

    barChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Comparativa Global'], // Etiqueta del eje X
            datasets: [
                {
                    label: 'Ingresos',
                    data: [totalIncome],
                    backgroundColor: '#22c55e',
                    borderRadius: 6, // Bordes redondeados en las barras
                    barPercentage: 0.6
                },
                {
                    label: 'Gastos',
                    data: [totalExpense],
                    backgroundColor: '#ef4444',
                    borderRadius: 6,
                    barPercentage: 0.6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#232b3e' }, // Cuadrícula sutil
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false }, // Ocultamos la cuadrícula vertical
                    ticks: { color: '#94a3b8' }
                }
            },
            plugins: {
                legend: { position: 'top', labels: { color: '#f8fafc' } }
            }
        }
    });
}

// ==========================================
// 4. ACTUALIZACIÓN DE LA INTERFAZ
// ==========================================
function updateUI() {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const total = income - expense;

    totalBalanceEl.textContent = `$${total.toFixed(2)}`;
    totalIncomeEl.textContent = `+$${income.toFixed(2)}`;
    totalExpenseEl.textContent = `-$${expense.toFixed(2)}`;

    transactionListEl.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionListEl.innerHTML = '<p style="color: #94a3b8; text-align: center; margin-top: 2rem;">No hay movimientos registrados aún.</p>';
    }

    transactions.forEach((t) => {
        const li = document.createElement('li');
        li.classList.add('transaction-item', t.type === 'income' ? 'income-item' : 'expense-item');
        
        li.innerHTML = `
            <div class="item-info">
                <strong>${t.description}</strong>
                <span>${t.category}</span>
            </div>
            <div>
                <span class="item-amount">${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}</span>
                <button class="btn-delete" onclick="removeTransaction(${t.id})">🗑️</button>
            </div>
        `;
        transactionListEl.appendChild(li);
    });

    localStorage.setItem('finanzas_transactions', JSON.stringify(transactions));
    
    // Llamamos a la función que pinta ambos gráficos
    renderCharts();
}

// ==========================================
// 5. MANEJO DE EVENTOS (Formulario y Borrado)
// ==========================================
form.addEventListener('submit', function(e) {
    e.preventDefault();

    const newTransaction = {
        id: Date.now(),
        description: descriptionInput.value,
        amount: parseFloat(amountInput.value),
        type: typeSelect.value,
        category: categorySelect.value
    };

    transactions.push(newTransaction);
    updateUI();
    form.reset();
});

window.removeTransaction = function(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateUI();
}

// Inicialización de la app
updateUI();