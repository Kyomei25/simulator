document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('retirement-calculator');
    const inputs = form.querySelectorAll('input[type="number"], select');
    let retirementAssetChart;

    inputs.forEach(input => {
        input.addEventListener('input', calculateAll);
    });

    function calculateAll() {
        console.log('Calculating all values...');
        calculateRetirementYears();
        calculateMonthlyExpenses();
        calculateNonInvestedAssets();
        calculateRetirementFundBalance();
        updateSimulationAndChart();
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
            case 'low': annualReturnRate = 0.01; break;
            case 'medium': annualReturnRate = 0.03; break;
            case 'high': annualReturnRate = 0.05; break;
            default: annualReturnRate = 0.01;
        }

        let investmentAssets = lumpSumInvestment;
        for (let i = 0; i < workingYears; i++) {
            investmentAssets *= (1 + annualReturnRate);
            investmentAssets += (monthlyInvestment + additionalMonthlyInvestment) * 12;
        }

        let retirementBonusGrowth = retirementBonus * Math.pow((1 + annualReturnRate), retirementYears);
        const totalPension = pension * retirementYears;
        const totalPartTimeIncome = partTimeIncome * 12 * Math.min(partTimeYears, retirementYears);
        const nonInvestedAssets = parseFloat(document.getElementById('non-invested-assets').textContent) || 0;
        const monthlyExpenses = totalExpenses / retirementYears / 12;

        const totalIncome = investmentAssets + retirementBonusGrowth + totalPension + totalPartTimeIncome + otherIncome + nonInvestedAssets;
        const monthsCovered = totalIncome / monthlyExpenses;
        const totalRetirementMonths = retirementYears * 12;
        const shortageMonths = Math.max(0, totalRetirementMonths - monthsCovered);
        const retirementFundBalance = -(shortageMonths * monthlyExpenses);

        document.getElementById('retirement-fund-balance').textContent = retirementFundBalance.toFixed(0);

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
            annualReturnRate,
            monthlyExpenses
        };
    }

    function calculateRetirementSimulation() {
        const currentAge = parseInt(document.getElementById('current-age').value) || 0;
        const retirementAge = parseInt(document.getElementById('retirement-age').value) || 0;
        const lifeExpectancy = parseInt(document.getElementById('life-expectancy').value) || 0;
        const currentAssets = parseFloat(document.getElementById('current-assets').value) || 0;
        const lumpSumInvestment = parseFloat(document.getElementById('lump-sum-investment').value) || 0;
        const monthlyInvestmentFromAssets = parseFloat(document.getElementById('monthly-investment').value) || 0;
        const additionalMonthlyInvestment = parseFloat(document.getElementById('additional-monthly-investment').value) || 0;
        const retirementBonus = parseFloat(document.getElementById('retirement-bonus').value) || 0;
        const pension = parseFloat(document.getElementById('pension').value) || 0;
        const partTimeIncome = parseFloat(document.getElementById('part-time-income').value) || 0;
        const partTimeYears = parseInt(document.getElementById('part-time-years').value) || 0;
        const otherIncome = parseFloat(document.getElementById('other-income').value) || 0;
        const monthlyExpenses = parseFloat(document.getElementById('monthly-expenses').textContent) || 0;

        const riskTolerance = document.getElementById('risk-tolerance').value;
        let annualReturnRate;
        switch (riskTolerance) {
            case 'low': annualReturnRate = 0.01; break;
            case 'medium': annualReturnRate = 0.03; break;
            case 'high': annualReturnRate = 0.05; break;
            default: annualReturnRate = 0.01;
        }

        // 運用しない資産の初期値計算
        let nonInvestedAssets = currentAssets - lumpSumInvestment - (monthlyInvestmentFromAssets * 12 * (retirementAge - currentAge));
        nonInvestedAssets += otherIncome; // その他の収入を加算

        // 運用する資産の初期値計算
        let investedAssets = lumpSumInvestment;
        for (let age = currentAge; age < retirementAge; age++) {
            investedAssets *= (1 + annualReturnRate);
            investedAssets += (monthlyInvestmentFromAssets + additionalMonthlyInvestment) * 12;
        }
        investedAssets += retirementBonus; // 退職金を加算

        const simulationResults = [];
        let currentSimAge = retirementAge;

        while (currentSimAge <= lifeExpectancy) {
            let currentInvestedAssets = investedAssets;
            let currentNonInvestedAssets = nonInvestedAssets;
            const fiveYearExpenses = monthlyExpenses * 60;
            const fiveYearPension = pension * 5;
            const fiveYearPartTimeIncome = (currentSimAge - retirementAge < partTimeYears) ? partTimeIncome * 12 * 5 : 0;

            // 運用しない資産から先に使用
            currentNonInvestedAssets += fiveYearPension + fiveYearPartTimeIncome - fiveYearExpenses;

            if (currentNonInvestedAssets < 0) {
                // 運用しない資産が不足した場合、運用する資産から補填
                currentInvestedAssets += currentNonInvestedAssets;
                currentNonInvestedAssets = 0;
            }

            if (currentInvestedAssets > 0) {
                if (currentNonInvestedAssets > 0) {
                    // 取り崩しをしていない段階の運用する資金の成長
                    currentInvestedAssets *= Math.pow(1 + annualReturnRate, 5);
                } else {
                    // 運用する資産を使い始めた後の成長と取り崩し
                    for (let i = 0; i < 60; i++) {
                        currentInvestedAssets = currentInvestedAssets * (1 + annualReturnRate / 12) - monthlyExpenses;
                        if (currentInvestedAssets < 0) {
                            currentInvestedAssets = 0;
                            break;
                        }
                    }
                }
            }

            simulationResults.push({
                age: currentSimAge,
                investedAssets: Math.max(0, Math.round(currentInvestedAssets)),
                nonInvestedAssets: Math.max(0, Math.round(currentNonInvestedAssets))
            });

            investedAssets = currentInvestedAssets;
            nonInvestedAssets = currentNonInvestedAssets;
            currentSimAge += 5;

            if (investedAssets <= 0 && nonInvestedAssets <= 0) {
                break;
            }
        }

        console.log('Simulation Results:', simulationResults);
        return simulationResults;
    }

    function generateChartData(simulationResults) {
        console.log('Generating Chart Data from:', simulationResults);
        return {
            labels: simulationResults.map(result => result.age),
            datasets: [
                {
                    label: '運用する資金の推移',
                    data: simulationResults.map(result => result.investedAssets),
                    backgroundColor: 'rgba(231, 76, 60, 0.8)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 1
                },
                {
                    label: '運用しない資金の推移',
                    data: simulationResults.map(result => result.nonInvestedAssets),
                    backgroundColor: 'rgba(52, 152, 219, 0.8)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }
            ]
        };
    }

    function updateSimulationAndChart() {
        console.log('Updating simulation and chart...');
        const simulationResults = calculateRetirementSimulation();
        console.log('Simulation results:', simulationResults);
        const chartData = generateChartData(simulationResults);
        console.log('Chart data:', chartData);
        createRetirementAssetChart(chartData);
    }

    function createRetirementAssetChart(data) {
        console.log('Creating retirement asset chart...');
        const ctx = document.getElementById('retirementAssetChart');
        if (!ctx) {
            console.error('Canvas element not found!');
            return;
        }

        console.log('Creating chart with data:', data);

        if (retirementAssetChart) {
            console.log('Destroying existing chart...');
            retirementAssetChart.destroy();
        }

        retirementAssetChart = new Chart(ctx, {
            type: 'bar',
            data: data,
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
                            callback: function(value) {
                                return value.toLocaleString() + '万円';
                            }
                        },
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
        console.log('Chart created successfully');
    }

    // 初期計算を実行
    console.log('Initializing calculations...');
    calculateAll();
});