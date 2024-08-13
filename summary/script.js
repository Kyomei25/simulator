document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('retirement-calculator');
    const inputs = form.querySelectorAll('input[type="number"], select');

    inputs.forEach(input => {
        input.addEventListener('input', calculateAll);
    });

    function calculateAll() {
        calculateRetirementYears();
        calculateMonthlyExpenses();
        calculateNonInvestedAssets();
        calculateRetirementFundBalance();
    }

    function calculateRetirementYears() {
        const currentAge = parseInt(document.getElementById('current-age').value) || 0;
        const retirementAge = parseInt(document.getElementById('retirement-age').value) || 0;
        const lifeExpectancy = parseInt(document.getElementById('life-expectancy').value) || 0;

        const workingYears = retirementAge - currentAge;
        const retirementYears = lifeExpectancy - retirementAge;

        document.getElementById('working-years').textContent = workingYears;
        document.getElementById('retirement-years').textContent = retirementYears;
    }

    function calculateMonthlyExpenses() {
        const totalExpenses = parseFloat(document.getElementById('total-expenses').value) || 0;
        const retirementYears = parseInt(document.getElementById('retirement-years').textContent) || 0;
        const monthlyExpenses = (totalExpenses / retirementYears / 12).toFixed(2);
        document.getElementById('monthly-expenses').textContent = monthlyExpenses;
    }

    function calculateNonInvestedAssets() {
        const currentAssets = parseFloat(document.getElementById('current-assets').value) || 0;
        const lumpSumInvestment = parseFloat(document.getElementById('lump-sum-investment').value) || 0;
        const monthlyInvestment = parseFloat(document.getElementById('monthly-investment').value) || 0;
        const workingYears = parseInt(document.getElementById('working-years').textContent) || 0;

        const totalInvestment = lumpSumInvestment + (monthlyInvestment * 12 * workingYears);
        const nonInvestedAssets = currentAssets - totalInvestment;

        document.getElementById('non-invested-assets').value = nonInvestedAssets.toFixed(0);
    }

    function calculateRetirementFundBalance() {
        const riskTolerance = document.getElementById('risk-tolerance').value;
        const currentAssets = parseFloat(document.getElementById('current-assets').value) || 0;
        const lumpSumInvestment = parseFloat(document.getElementById('lump-sum-investment').value) || 0;
        const monthlyInvestment = parseFloat(document.getElementById('monthly-investment').value) || 0;
        const additionalMonthlyInvestment = parseFloat(document.getElementById('additional-monthly-investment').value) || 0;
        const retirementBonus = parseFloat(document.getElementById('retirement-bonus').value) || 0;
        const pension = parseFloat(document.getElementById('pension').value) || 0;
        const partTimeIncome = parseFloat(document.getElementById('part-time-income').value) || 0;
        const partTimeYears = parseInt(document.getElementById('part-time-years').value) || 0;
        const otherIncome = parseFloat(document.getElementById('other-income').value) || 0;

        const workingYears = parseInt(document.getElementById('working-years').textContent) || 0;
        const retirementYears = parseInt(document.getElementById('retirement-years').textContent) || 0;
        const totalExpenses = parseFloat(document.getElementById('total-expenses').value) || 0;

        let annualReturnRate;
        switch (riskTolerance) {
            case 'low':
                annualReturnRate = 0.01;
                break;
            case 'medium':
                annualReturnRate = 0.03;
                break;
            case 'high':
                annualReturnRate = 0.05;
                break;
            default:
                annualReturnRate = 0.01;
        }

        // 運用資産の計算
        let investmentAssets = lumpSumInvestment;
        for (let i = 0; i < workingYears; i++) {
            investmentAssets *= (1 + annualReturnRate);
            investmentAssets += (monthlyInvestment + additionalMonthlyInvestment) * 12;
        }

        // 退職金の運用
        let retirementBonusGrowth = retirementBonus * Math.pow((1 + annualReturnRate), retirementYears);

        // 年金総額
        const totalPension = pension * retirementYears;

        // パートタイム収入の総額
        const totalPartTimeIncome = partTimeIncome * 12 * Math.min(partTimeYears, retirementYears);

        // 非投資資産
        const nonInvestedAssets = parseFloat(document.getElementById('non-invested-assets').value) || 0;

        // 老後の月間支出平均を計算
        const monthlyExpenses = totalExpenses / retirementYears / 12;

        // 総収入の計算
        const totalIncome = investmentAssets + retirementBonusGrowth + totalPension + totalPartTimeIncome + otherIncome + nonInvestedAssets;

        // 資金が足りる月数を計算
        const monthsCovered = totalIncome / monthlyExpenses;

        // 老後の期間（月数）
        const totalRetirementMonths = retirementYears * 12;

        // 不足月数を計算
        const shortageMonths = Math.max(0, totalRetirementMonths - monthsCovered);

        // 老後資金の過不足を計算
        const retirementFundBalance = -(shortageMonths * monthlyExpenses);

        document.getElementById('retirement-fund-balance').textContent = retirementFundBalance.toFixed(0);

        // 結果メッセージの生成
        const resultMessage = document.getElementById('result-message');
        if (retirementFundBalance >= 0) {
            const surplusYears = Math.floor(monthsCovered / 12) - retirementYears;
            resultMessage.textContent = `あなたの計画では資産が${parseInt(document.getElementById('life-expectancy').value) + surplusYears}歳まで持ちます。`;
        } else {
            const shortageYears = Math.ceil(shortageMonths / 12);
            const shortageAge = parseInt(document.getElementById('life-expectancy').value) - shortageYears;
            resultMessage.textContent = `あなたの計画では資産がもつのは${shortageAge}歳までです。${shortageAge + 1}歳まで約${shortageYears}年分(${Math.abs(retirementFundBalance).toFixed(0)}万円)の資金がたりません。何らかの対策が必要です。`;
        }

        // グラフの作成と描画
        createAndDrawChart(parseInt(document.getElementById('retirement-age').value), parseInt(document.getElementById('life-expectancy').value), investmentAssets, nonInvestedAssets, annualReturnRate);
    }

    function createAndDrawChart(retirementAge, lifeExpectancy, initialInvestmentAssets, initialNonInvestedAssets, annualReturnRate) {
        const ctx = document.getElementById('assetChart').getContext('2d');
        const labels = [];
        const investedData = [];
        const nonInvestedData = [];

        let currentInvestedAssets = initialInvestmentAssets;
        let currentNonInvestedAssets = initialNonInvestedAssets;

        for (let age = retirementAge; age <= lifeExpectancy; age += 5) {
            labels.push(age);
            investedData.push(currentInvestedAssets);
            nonInvestedData.push(currentNonInvestedAssets);

            // 5年間の資産成長を計算
            currentInvestedAssets *= Math.pow(1 + annualReturnRate, 5);
            // 非運用資産は変化なし
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '運用する資産',
                        data: investedData,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    },
                    {
                        label: '運用しない資産',
                        data: nonInvestedData,
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '年齢'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '資産（万円）'
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                return value.toLocaleString() + '万円';
                            }
                        }
                    }
                }
            }
        });
    }

    // 初期計算
    calculateAll();
});