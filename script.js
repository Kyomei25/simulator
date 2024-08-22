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
        calculateLoanBalance();  // 住宅ローンの計算を先に行う
        calculateTotalExpenses();  // 老後期間の支出合計は住宅ローン残高のみ含める
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
        const yearlyExpenses = [
            'dream-expenses'
        ].reduce((total, id) => {
            return total + (parseFloat(document.getElementById(id).value) || 0);
        }, 0);

        document.getElementById('yearly-total').textContent = yearlyExpenses.toFixed(1);
    }

    function calculateLoanBalance() {
        const monthlyMortgage = parseFloat(document.getElementById('monthly-mortgage').value) || 0;
        const remainingMortgageYears = parseFloat(document.getElementById('remaining-mortgage-years').value) || 0;
        const retirementYears = parseInt(document.getElementById('retirement-years').textContent) || 0;

        const currentLoanBalance = monthlyMortgage * remainingMortgageYears * 12;
        const retirementLoanBalance = Math.max(0, (remainingMortgageYears - retirementYears) * monthlyMortgage * 12);

        document.getElementById('current-loan-balance').textContent = currentLoanBalance.toFixed(1);
        document.getElementById('retirement-loan-balance').textContent = retirementLoanBalance.toFixed(1);

        return retirementLoanBalance;
    }

    function calculateTotalExpenses() {
        const retirementLoanBalance = calculateLoanBalance(); // 老後からのローン残高のみを含める
        const bufferFund = parseFloat(document.getElementById('buffer-fund').value) || 0;

        const totalExpenses = retirementLoanBalance + bufferFund;
        document.getElementById('total-expenses').textContent = totalExpenses.toFixed(1);
    }

    function calculateMonthlyRetirementExpenses() {
        const totalExpenses = parseFloat(document.getElementById('total-expenses').textContent) || 0;
        const retirementYears = parseInt(document.getElementById('retirement-years').textContent) || 1;

        const monthlyRetirementExpenses = totalExpenses / retirementYears / 12;
        
        document.getElementById('monthly-retirement-expenses').textContent = monthlyRetirementExpenses.toFixed(1);
    }

    calculateAll();
});

