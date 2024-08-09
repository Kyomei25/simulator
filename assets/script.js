document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('asset-calculator');
    const inputs = form.querySelectorAll('input[type="number"]');
    let assetAllocationChart;

    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value < 0) {
                this.value = 0;
            }
        });
        input.addEventListener('input', calculateAll);
    });

    function calculateAll() {
        calculateNonInvestedAssets();
        calculateInvestedAssets();
        calculateTotalAssets();
        updateChart();
    }

    function calculateNonInvestedAssets() {
        const bankAssets = parseFloat(document.getElementById('bank-assets').value) || 0;
        const otherNonInvestedAssets = parseFloat(document.getElementById('other-non-invested-assets').value) || 0;
        const totalNonInvested = bankAssets + otherNonInvestedAssets;
        document.getElementById('total-non-invested').textContent = totalNonInvested.toFixed(1);
    }

    function calculateInvestedAssets() {
        const securitiesAssets = parseFloat(document.getElementById('securities-assets').value) || 0;
        const insuranceAssets = parseFloat(document.getElementById('insurance-assets').value) || 0;
        const otherInvestedAssets = parseFloat(document.getElementById('other-invested-assets').value) || 0;
        const totalInvested = securitiesAssets + insuranceAssets + otherInvestedAssets;
        document.getElementById('total-invested').textContent = totalInvested.toFixed(1);
    }

    function calculateTotalAssets() {
        const totalNonInvested = parseFloat(document.getElementById('total-non-invested').textContent) || 0;
        const totalInvested = parseFloat(document.getElementById('total-invested').textContent) || 0;
        const totalAssets = totalNonInvested + totalInvested;
        document.getElementById('total-assets').textContent = totalAssets.toFixed(1);
        return totalAssets;
    }

    function updateChart() {
        const ctx = document.getElementById('assetAllocationChart').getContext('2d');
        
        const nonInvestedAssets = parseFloat(document.getElementById('total-non-invested').textContent) || 0;
        const investedAssets = parseFloat(document.getElementById('total-invested').textContent) || 0;
        const totalAssets = calculateTotalAssets();

        const data = {
            labels: ['運用しない資産', '運用する資産'],
            datasets: [{
                data: [nonInvestedAssets, investedAssets],
                backgroundColor: ['#FF6384', '#36A2EB'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB']
            }]
        };

        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                cutout: '60%',
                layout: {
                    padding: {
                        top: 40 // グラフ上部に間を開ける
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        padding: {
                            bottom: 20
                        },
                        labels: {
                            font: {
                                size: 20
                            }
                        }
                    },
                    title: {
                        display: false // タイトル（資産配分）を非表示にする
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const percentage = ((value / totalAssets) * 100).toFixed(1);
                                return `${label}: ${value.toFixed(1)}万円 (${percentage}%)`;
                            }
                        },
                        titleFont: {
                            size: 20
                        },
                        bodyFont: {
                            size: 16
                        }
                    },
                    datalabels: {
                        color: '#000',
                        font: {
                            weight: 'bold',
                            size: 20
                        },
                        formatter: (value, ctx) => {
                            const percentage = ((value / totalAssets) * 100).toFixed(1) + '%';
                            return percentage;
                        }
                    }
                },
            },
            plugins: [ChartDataLabels]
        };

        if (assetAllocationChart instanceof Chart) {
            assetAllocationChart.data = data;
            assetAllocationChart.options = config.options;
            assetAllocationChart.update();
        } else {
            assetAllocationChart = new Chart(ctx, config);
        }

        // 総資産額を中央に表示
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#000';
        const centerX = assetAllocationChart.width / 2;
        const centerY = assetAllocationChart.height / 2;
        ctx.fillText('総資産:', centerX, centerY - 15);
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`${totalAssets.toFixed(1)}万円`, centerX, centerY + 15);
    }

    // 初期計算とグラフ描画
    calculateAll();
});