document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.container');
    const inputs = form.querySelectorAll('input[type="number"]');
    const result = document.getElementById('result');
    const bankSavingsOutput = document.getElementById('bank-savings');
    let retirementChart;

    inputs.forEach(input => {
        input.addEventListener('input', calculateRetirementFund);
    });

    function calculateRetirementFund() {
        const currentAge = parseInt(document.getElementById('current-age').value) || 0;
        const retirementAge = parseInt(document.getElementById('retirement-age').value) || 0;
        const lifeExpectancy = parseInt(document.getElementById('life-expectancy').value) || 0;
        const monthlyExpenses = parseFloat(document.getElementById('monthly-expenses').value) || 0;
        const currentAssets = parseFloat(document.getElementById('current-assets').value) || 0;
        const investmentAmount = parseFloat(document.getElementById('investment-amount').value) || 0;
        const monthlyInvestment = parseFloat(document.getElementById('monthly-investment').value) || 0;
        const monthlySavings = parseFloat(document.getElementById('monthly-savings').value) || 0;
        const retirementBonus = parseFloat(document.getElementById('retirement-bonus').value) || 0;
        const pension = parseFloat(document.getElementById('pension').value) || 0;
        const retirementIncome = parseFloat(document.getElementById('retirement-income').value) || 0;
        const retirementIncomePeriod = parseInt(document.getElementById('retirement-income-period').value) || 0;
        const otherAssets = parseFloat(document.getElementById('other-assets').value) || 0;

        // 入力値の妥当性チェック
        if (currentAge >= retirementAge || retirementAge >= lifeExpectancy) {
            result.innerHTML = "年齢の入力が正しくありません。現在の年齢 < 退職年齢 < 寿命 となるように設定してください。";
            return;
        }

        const yearsUntilRetirement = retirementAge - currentAge;

        // 銀行に残しておく金額の計算
        const bankSavings = currentAssets - investmentAmount - (monthlyInvestment * 12 * yearsUntilRetirement);
        bankSavingsOutput.textContent = bankSavings.toFixed(1);

        // 投資の成長率（年率5%と仮定）
        const investmentReturn = 0.05;

        // 退職時の総資産を計算
        let investedFunds = investmentAmount * Math.pow(1 + investmentReturn, yearsUntilRetirement);
        investedFunds += monthlyInvestment * 12 * ((Math.pow(1 + investmentReturn, yearsUntilRetirement) - 1) / investmentReturn);
        let nonInvestedFunds = bankSavings + (monthlySavings * 12 * yearsUntilRetirement) + retirementBonus + otherAssets;

        // 年ごとの資金推移を計算
        const chartData = [];
        let currentYear = retirementAge;
        let fundsExhaustedAge = null;

        while (currentYear <= lifeExpectancy) {
            // 年金と退職後の収入を加算
            let annualIncome = pension;
            if (currentYear - retirementAge < retirementIncomePeriod) {
                annualIncome += retirementIncome * 12;
            }

            // 年間支出を計算
            let annualExpenses = monthlyExpenses * 12;

            // 年間の収支を計算
            let annualBalance = annualIncome - annualExpenses;

            // 非投資資金から先に使用
            nonInvestedFunds += annualBalance;
            if (nonInvestedFunds < 0) {
                investedFunds += nonInvestedFunds;
                nonInvestedFunds = 0;
            }

            // 投資資金の成長（年率）
            investedFunds *= (1 + investmentReturn);

            // 資金が尽きた年齢を記録
            if (investedFunds + nonInvestedFunds <= 0 && fundsExhaustedAge === null) {
                fundsExhaustedAge = currentYear;
                break;
            }

            chartData.push({
                age: currentYear,
                investedFunds: Math.max(0, investedFunds),
                nonInvestedFunds: Math.max(0, nonInvestedFunds)
            });

            currentYear++;
        }

        // 結果テキストの更新と最大年齢の決定
        const { resultText, adjustedMaxAge } = updateResultText(chartData, fundsExhaustedAge, lifeExpectancy, monthlyExpenses);
        result.innerHTML = resultText;

        // グラフの更新
        updateChart(chartData, adjustedMaxAge);
    }

    function updateResultText(chartData, fundsExhaustedAge, lifeExpectancy, monthlyExpenses) {
        let resultText = '';
        let adjustedMaxAge = lifeExpectancy;

        if (fundsExhaustedAge) {
            const shortage = monthlyExpenses * 12 * (lifeExpectancy - fundsExhaustedAge);
            const shortageYears = lifeExpectancy - fundsExhaustedAge;
            resultText = `**あなたの計画では資産が${fundsExhaustedAge}歳までしか持ちません。${lifeExpectancy}歳まで約${shortageYears.toFixed(1)}年分${shortage.toFixed(1)}万円の資金が足りません。何らかの対策が必要です。**`;
            adjustedMaxAge = fundsExhaustedAge;
        } else {
            const lastDataPoint = chartData[chartData.length - 1];
            const totalFunds = lastDataPoint.investedFunds + lastDataPoint.nonInvestedFunds;
            const surplusYears = totalFunds / (monthlyExpenses * 12);
            adjustedMaxAge = Math.min(Math.ceil(lifeExpectancy + surplusYears), 120); // 最大120歳まで
            resultText = `※あなたは年金だけで暮らせますが、年金減額に備えて見込額を2~3割減らして見積もりましょう。<br>あなたの計画では資産が${adjustedMaxAge.toFixed(1)}歳まで持ちます。`;
        }

        return { resultText, adjustedMaxAge };
    }

    function updateChart(chartData, maxAge) {
        const ctx = document.getElementById('retirementChart').getContext('2d');
        const labels = chartData.map(data => data.age + '歳');
        const investedData = chartData.map(data => data.investedFunds);
        const nonInvestedData = chartData.map(data => data.nonInvestedFunds);

        // 資金が0になる年までデータを延長
        while (labels[labels.length - 1] !== maxAge + '歳' && labels.length < 100) { // 最大100データポイントまで
            labels.push(parseInt(labels[labels.length - 1]) + 1 + '歳');
            investedData.push(0);
            nonInvestedData.push(0);
        }

        if (retirementChart) {
            retirementChart.data.labels = labels;
            retirementChart.data.datasets[0].data = investedData;
            retirementChart.data.datasets[1].data = nonInvestedData;
            retirementChart.update();
        } else {
            retirementChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: '運用する資金',
                            data: investedData,
                            backgroundColor: 'rgba(0, 123, 255, 0.5)',
                            borderColor: 'rgba(0, 123, 255, 1)',
                            borderWidth: 1
                        },
                        {
                            label: '運用しない資金',
                            data: nonInvestedData,
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            stacked: true,
                            title: {
                                display: true,
                                text: '年齢'
                            }
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '金額（万円）'
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(context.parsed.y * 10000);
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // 初期計算を実行
    calculateRetirementFund();
});