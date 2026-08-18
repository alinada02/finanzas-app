// ==========================================
// 1. CONECTAR JAVASCRIPT CON EL HTML
// ==========================================
// Aquí "atrapamos" los elementos de la pantalla por su ID para poder manipularlos.
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
// 2. MEMORIA (LocalStorage)
// ==========================================
// Buscamos si ya hay datos guardados en el navegador. Si no hay nada, iniciamos una lista vacía [].
let transactions = JSON.parse(localStorage.getItem('finanzas_transactions')) || [];
let chartInstance = null; // Espacio para guardar nuestro gráfico de Chart.js

// ==========================================
// 3. FUNCIÓN PARA DIBUJAR EL GRÁFICO
// ==========================================
function renderChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');

    // Filtramos solo los que son gastos (expense)
    const expenses = transactions.filter(t => t.type === 'expense');
    const categories = ['Trabajo', 'Comida', 'Servicios', 'Transporte', 'Entretenimiento', 'Otros'];
    
    // Calculamos cuánto se gastó en cada categoría
    const totalsByCategory = categories.map(cat => {
        return expenses
            .filter(t => t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0);
    });

    // Si ya existe un gráfico, lo borramos para dibujar el nuevo actualizado
    if (chartInstance) {
        chartInstance.destroy(); 
    }

    // Creamos el gráfico de tipo 'doughnut' (rosca)
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: totalsByCategory,
                backgroundColor: ['#38bdf8', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#64748b'],
                borderWidth: 2,
                borderColor: '#1e293b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8' } }
            }
        }
    });
}

// ==========================================
// 4. FUNCIÓN PARA ACTUALIZAR LOS NÚMEROS EN PANTALLA
// ==========================================
function updateUI() {
    // Sumamos todos los ingresos y todos los gastos
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    
    // El balance es lo que entra menos lo que sale
    const total = income - expense;

    // Pintamos los números en el HTML con dos decimales
    totalBalanceEl.textContent = `$${total.toFixed(2)}`;
    totalIncomeEl.textContent = `+$${income.toFixed(2)}`;
    totalExpenseEl.textContent = `-$${expense.toFixed(2)}`;

    // Limpiamos la lista visual antes de volver a llenarla
    transactionListEl.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionListEl.innerHTML = '<p style="color: #94a3b8; text-align: center; font-size: 0.9rem;">No hay transacciones registradas.</p>';
    }

    // Por cada transacción, creamos un elemento <li> en el HTML
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

    // Guardamos la lista actualizada en el disco duro del navegador
    localStorage.setItem('finanzas_transactions', JSON.stringify(transactions));

    // Actualizamos el gráfico
    renderChart();
}

// ==========================================
// 5. ESCUCHAR EL BOTÓN "AÑADIR TRANSACCIÓN"
// ==========================================
form.addEventListener('submit', function(e) {
    e.preventDefault(); // Evita que la página parpadee o se recargue

    // Armamos un paquete con los datos que escribió el usuario
    const newTransaction = {
        id: Date.now(), // Un identificador único usando la fecha y hora
        description: descriptionInput.value,
        amount: parseFloat(amountInput.value),
        type: typeSelect.value,
        category: categorySelect.value
    };

    // Metemos el paquete a nuestra lista principal
    transactions.push(newTransaction);
    
    // Actualizamos toda la pantalla
    updateUI();
    
    // Vaciamos las casillas del formulario para escribir uno nuevo
    form.reset();
});

// ==========================================
// 6. FUNCIÓN PARA BORRAR UN REGISTRO
// ==========================================
window.removeTransaction = function(id) {
    // Filtramos la lista para dejar todos EXCEPTO el que tenga el ID que queremos borrar
    transactions = transactions.filter(t => t.id !== id);
    updateUI();
}

// Cuando la página carga por primera vez, ejecutamos esta función para que pinte todo
updateUI();