// GLOBAL STATE
let userType = '';
let allowance = parseFloat(localStorage.getItem('allowance')) || 0;
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// SECTION NAVIGATION
function showSection(id) {
    document.querySelectorAll('.section').forEach(sec =>
        sec.classList.remove('active')
    );
    document.getElementById(id).classList.add('active');
}

// LOGIN
function loginAs(type) {
    userType = type;
    showSection(type === 'student' ? 'student-dashboard' : 'parent-dashboard');
    updateDashboard();
}

// LOGOUT
function logout() {
    userType = '';
    showSection('login');
}

// UPDATE DASHBOARD
function updateDashboard() {
    const spent = expenses.reduce((s, e) => s + e.amount, 0);
    const remaining = allowance - spent;

    if (userType === 'student') {
        document.getElementById('student-allowance').textContent = allowance;
        document.getElementById('student-spent').textContent = spent;
        document.getElementById('student-remaining').textContent = remaining;

        const percent = allowance > 0 ? (spent / allowance) * 100 : 0;
        document.getElementById('student-progress-fill').style.width =
            Math.min(percent, 100) + '%';

        document.getElementById('student-message').textContent =
            remaining < 0 ? 'Overspending ⚠️' : 'Good control 👍';
    }

    if (userType === 'parent') {
        document.getElementById('parent-allowance').textContent = allowance;
        document.getElementById('parent-spent').textContent = spent;
        document.getElementById('parent-remaining').textContent = remaining;

        document.getElementById('parent-insight').textContent =
            spent > allowance * 0.7
                ? 'High spending detected ⚠️'
                : 'Spending is under control 👍';
    }
}

// ADD EXPENSE
document.getElementById('expense-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('expense-name').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0) + amount;

    if (totalSpent > allowance) {
        document.getElementById('add-message').textContent =
            'Cannot exceed allowance!';
        return;
    }

    const type = ['Food', 'Study', 'Travel'].includes(category)
        ? 'Worthy'
        : 'Worthless';

    expenses.push({ name, amount, category, type });
    localStorage.setItem('expenses', JSON.stringify(expenses));

    this.reset();
    document.getElementById('add-message').textContent = '';
    showSection('student-dashboard');
    updateDashboard();
});

// EXPENSE HISTORY
function renderStudentHistory() {
    const container = document.getElementById('student-expenses-container');
    container.innerHTML = '';

    if (expenses.length === 0) {
        container.innerHTML = '<p style="text-align:center;">No expenses yet</p>';
        return;
    }

    expenses.forEach(exp => {
        const div = document.createElement('div');
        div.className = 'glass-card expense-card';

        div.innerHTML = `
            <div>
                <strong>${exp.name}</strong><br>
                <small>${exp.category}</small>
            </div>
            <div>
                ₹${exp.amount}
                <span class="category-label ${exp.type}">
                    ${exp.type}
                </span>
            </div>
        `;

        container.appendChild(div);
    });
}

// SET ALLOWANCE (PARENT)
document.getElementById('allowance-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const amt = parseFloat(
        document.getElementById('allowance-amount').value
    );
    const pin = document.getElementById('pin').value;

    if (pin !== '1234') {
        document.getElementById('allowance-message').textContent =
            'Wrong PIN ❌';
        return;
    }

    allowance = amt;
    localStorage.setItem('allowance', allowance);
    document.getElementById('allowance-message').textContent =
        'Allowance saved ✅';

    updateDashboard();
});