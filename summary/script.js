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
        updateSimulationAndChart();
    }

    // JSONデータを読み込んで、5年ごとの推移を計算
    fetch('../date/step3_data.json')
        .then(response => response.json())
        .then(data => {
            const simulationResults = calculate5YearProjection(data);
            const chartData = generateChartData(simulationResults);
            createRetirementAssetChart(chartData);
        })
        .catch(error => console.error('Error loading JSON data:', error));

    function calculate5YearProjection(data) {
        const projection = [];
        let currentYear = data[0]["何歳"].split('歳')[0];
        let aggregatedNonInvested = 0;
        let aggregatedInvested = 0;

        data.forEach((entry, index) => {
            const year = entry["何歳"].split('歳')[0];
            if (year !== currentYear || index === data.length - 1) {
                // 5年ごとにデータを集約
                if (index % 60 === 0 || index === data.length - 1) {  // 60ヶ月 = 5年
                    projection.push({
                        age: `${currentYear}歳`,
                        nonInvestedAssets: aggregatedNonInvested,
                        investedAssets: aggregatedInvested
                    });
                    currentYear = year;
                    aggregatedNonInvested = 0;
                    aggregatedInvested = 0;
                }
            }
            aggregatedNonInvested += entry["運用しないお金"];
            aggregatedInvested += entry["運用するお金"];
        });

        // 最後にデータを追加する
        projection.push({
            age: `${currentYear}歳`,
            nonInvestedAssets: aggregatedNonInvested,
            investedAssets: aggregatedInvested
        });

        return projection;
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
    
        document.getElementById('non-invested-assets').textContent = nonInvestedAssets.toFixed(0);
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
        const nonInvestedAssets = parseFloat(document.getElementById('non-invested-assets').textContent) || 0;

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
            resultMessage.textContent = `あなたの計画では資産がもつのは${shortageAge + 1}歳までです。${shortageAge + 1}歳まで約${shortageYears + 1}年分(${Math.abs(retirementFundBalance).toFixed(0)}万円)の資金が足りません。何らかの対策が必要です。`;
        }

        return {
            investmentAssets,
            nonInvestedAssets,
            retirementAge: parseInt(document.getElementById('retirement-age').value) || 0,
            lifeExpectancy: parseInt(document.getElementById('life-expectancy').value) || 0,
            annualReturnRate
        };
    }

    function calculateRetirementSimulation() {
        const {
            investmentAssets,
            nonInvestedAssets,
            retirementAge,
            lifeExpectancy,
            annualReturnRate
        } = calculateRetirementFundBalance();
    
        const simulationResults = [];
        let currentInvestedAssets = investmentAssets;
        let currentNonInvestedAssets = nonInvestedAssets;
        const monthlyExpenses = parseFloat(document.getElementById('monthly-expenses').textContent) || 0;
    
        // 5年ごとの推移予測を計算
        for (let age = retirementAge; age <= lifeExpectancy; age += 5) {
            // 現在の年齢での資産状況を記録
            simulationResults.push({
                age: age,
                investedAssets: Math.max(0, currentInvestedAssets),
                nonInvestedAssets: Math.max(0, currentNonInvestedAssets)
            });
    
            // 次の5年分の資産を計算
            for (let i = 0; i < 5; i++) {
                const yearlyExpenses = monthlyExpenses * 12;
                if (currentNonInvestedAssets >= yearlyExpenses) {
                    currentNonInvestedAssets -= yearlyExpenses;
                } else {
                    const remainingExpenses = yearlyExpenses - currentNonInvestedAssets;
                    currentNonInvestedAssets = 0;
                    currentInvestedAssets -= remainingExpenses;
                }
    
                if (currentInvestedAssets > 0) {
                    // 資産運用による増加分を計算
                    currentInvestedAssets *= (1 + annualReturnRate);
                }
            }
        }
    
        return simulationResults;
    }
    
    function generateChartData(simulationResults) {
        return {
            labels: simulationResults.map(result => result.age),
            investedAssets: simulationResults.map(result => result.investedAssets),
            nonInvestedAssets: simulationResults.map(result => result.nonInvestedAssets)
        };
    }
    
    function updateSimulationAndChart() {
        const simulationResults = calculateRetirementSimulation();
        const chartData = generateChartData(simulationResults);
        createRetirementAssetChart(chartData);
    }
    
    // グラフ描画のための関数
    let retirementAssetChart;
    
    function createRetirementAssetChart(data) {
        const ctx = document.getElementById('retirementAssetChart').getContext('2d');
        
        // 既存のグラフインスタンスがあれば破棄
        if (retirementAssetChart) {
            retirementAssetChart.destroy();
        }
    
        retirementAssetChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: '運用する資金の推移',
                        data: data.investedAssets,
                        backgroundColor: 'rgba(231, 76, 60, 0.8)',
                        borderColor: 'rgba(231, 76, 60, 1)',
                        borderWidth: 1
                    },
                    {
                        label: '運用しない資金の推移',
                        data: data.nonInvestedAssets,
                        backgroundColor: 'rgba(52, 152, 219, 0.8)',
                        borderColor: 'rgba(52, 152, 219, 1)',
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
                        title: {
                            display: true,
                            text: '資産額（万円）'
                        },
                        ticks: {
                            stepSize: 2500,
                            callback: function(value) {
                                return value.toLocaleString() + '万円';
                            }
                        },
                        min: 0,
                        max: 10000
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '老後の5年ごとの資産推移予測',
                        font: {
                            size: 18
                        }
                    },
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y.toLocaleString() + '万円';
                                }
                                return label;
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

