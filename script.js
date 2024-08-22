document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('retirement-calculator');
    const inputs = form.querySelectorAll('input[type="number"]');

    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value < 0) {
                this.value = 0;
            }
        });
        input.addEventListener('input', calculateAll);
    });

    function calculateAll() {
        calculateRetirementYears();
        calculateMonthlyExpenses();
        calculateYearlyExpenses();
        calculateTotalExpenses();
        calculateMonthlyRetirementExpenses();
    }

    function calculateRetirementYears() {
        const retirementAge = parseInt(document.getElementById('retirement-age').value) || 0;
        const lifeExpectancy = parseInt(document.getElementById('life-expectancy').value) || 0;
        const retirementYears = lifeExpectancy - retirementAge;
        document.getElementById('retirement-years').textContent = retirementYears;
    }

    function calculateMonthlyExpenses() {
        const monthlyExpenses = [
            'food-expenses', 'daily-expenses', 'utility-expenses',
            'communication-expenses', 'transportation-expenses', 'hobby-expenses',
            'housing-expenses', 'education-expenses'
        ].reduce((total, id) => {
            return total + (parseFloat(document.getElementById(id).value) || 0);
        }, 0);

        document.getElementById('monthly-total').textContent = monthlyExpenses.toFixed(1);
    }

    function calculateYearlyExpenses() {
        // 'insurance-expenses' と 'other-expenses' を削除
        const yearlyExpenses = [
            'dream-expenses'
        ].reduce((total, id) => {
            return total + (parseFloat(document.getElementById(id).value) || 0);
        }, 0);

        document.getElementById('yearly-total').textContent = yearlyExpenses.toFixed(1);
    }

    function calculateTotalExpenses() {
        const retirementYears = parseInt(document.getElementById('retirement-years').textContent) || 0;
        const monthlyTotal = parseFloat(document.getElementById('monthly-total').textContent) || 0;
        const yearlyTotal = parseFloat(document.getElementById('yearly-total').textContent) || 0;
        const bufferFund = parseFloat(document.getElementById('buffer-fund').value) || 0;

        const totalExpenses = (monthlyTotal * 12 + yearlyTotal) * retirementYears + bufferFund;
        document.getElementById('total-expenses').textContent = totalExpenses.toFixed(1);
    }

    function calculateMonthlyRetirementExpenses() {
        const totalExpenses = parseFloat(document.getElementById('total-expenses').textContent) || 0;
        const retirementYears = parseInt(document.getElementById('retirement-years').textContent) || 1; // 0で割らないように1を使用
        
        const monthlyRetirementExpenses = totalExpenses / retirementYears / 12;
        
        document.getElementById('monthly-retirement-expenses').textContent = monthlyRetirementExpenses.toFixed(1);
    }

    // 初期計算
    calculateAll();
});