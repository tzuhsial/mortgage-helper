document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const loanMethodRadios = document.querySelectorAll('input[name="current-loan-method"]');
    const calculateSection = document.getElementById('calculate-section');
    const manualSection = document.getElementById('manual-section');
    const hasExtraPaymentsCheckbox = document.getElementById('has-extra-payments');
    const extraPaymentSection = document.getElementById('extra-payment-section');
    const showAdvancedOptionsCheckbox = document.getElementById('show-advanced-options');
    const advancedOptionsSection = document.getElementById('advanced-options-section');
    const pointsInput = document.getElementById('discount-points');
    const pointsCostDisplay = document.getElementById('points-cost-display');
    const newLoanAmountInput = document.getElementById('new-loan-amount');
    const allInputs = document.querySelectorAll('input');
    const monthlyPaymentChartCanvas = document.getElementById('monthly-payment-chart');
    const totalInterestChartCanvas = document.getElementById('total-interest-chart');

    let myMonthlyPaymentChart; // Global Chart.js instance for monthly payments
    let myTotalInterestChart; // Global Chart.js instance for total interest

    // --- EVENT LISTENERS ---

    // Main listener to recalculate whenever any input changes
    allInputs.forEach(input => {
        input.addEventListener('input', calculateAndDisplayResults);
    });

    // Listener for toggling input modes
    loanMethodRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isManual = radio.value === 'manual';
            manualSection.style.display = isManual ? 'block' : 'none';
            calculateSection.style.display = isManual ? 'none' : 'block';
        });
    });

    // Listener for extra payments checkbox
    hasExtraPaymentsCheckbox.addEventListener('change', () => {
        extraPaymentSection.style.display = hasExtraPaymentsCheckbox.checked ? 'block' : 'none';
    });

    // Listener for advanced options checkbox
    showAdvancedOptionsCheckbox.addEventListener('change', () => {
        advancedOptionsSection.style.display = showAdvancedOptionsCheckbox.checked ? 'block' : 'none';
    });

    // --- MAIN CALCULATION & DISPLAY FUNCTION ---

    function calculateAndDisplayResults() {
        // --- CURRENT LOAN CALCULATIONS ---
        let currentBalance, originalMonthlyPayment, originalRemainingTermYears, remainingInterestOnOriginal;
        const method = document.querySelector('input[name="current-loan-method"]:checked').value;

        if (method === 'calculate') {
            const originalLoanAmount = parseFloat(document.getElementById('original-loan-amount').value) || 0;
            const originalAnnualInterestRate = (parseFloat(document.getElementById('original-interest-rate').value) || 0) / 100;
            const originalLoanTerm = parseInt(document.getElementById('original-loan-term').value) || 0;
            const loanStartDate = new Date(document.getElementById('loan-start-date').value);

            if (isNaN(loanStartDate.getTime())) { return; }

            const monthsElapsed = (new Date().getFullYear() - loanStartDate.getFullYear()) * 12 + (new Date().getMonth() - loanStartDate.getMonth());
            originalMonthlyPayment = calculateMonthlyPayment(originalLoanAmount, originalAnnualInterestRate, originalLoanTerm);

            if (hasExtraPaymentsCheckbox.checked) {
                const extraMonthlyPayment = parseFloat(document.getElementById('extra-monthly-payment').value) || 0;
                currentBalance = simulateAmortization(originalLoanAmount, originalAnnualInterestRate, originalLoanTerm, monthsElapsed, extraMonthlyPayment);
            } else {
                currentBalance = calculateRemainingBalance(originalLoanAmount, originalAnnualInterestRate, originalLoanTerm, monthsElapsed);
            }
            
            originalRemainingTermYears = (originalLoanTerm * 12 - monthsElapsed) / 12;
            remainingInterestOnOriginal = calculateTotalInterest(currentBalance, originalMonthlyPayment, originalRemainingTermYears);
        } else { // Manual
            currentBalance = parseFloat(document.getElementById('current-loan-balance').value) || 0;
            originalMonthlyPayment = parseFloat(document.getElementById('current-monthly-payment').value) || 0;
            const currentAnnualInterestRate = (parseFloat(document.getElementById('current-interest-rate').value) || 0) / 100;

            if (currentBalance <= 0 || originalMonthlyPayment <= 0 || currentAnnualInterestRate <= 0) { return; }

            const remainingLoanTermInMonths = calculateRemainingTermInMonths(currentBalance, currentAnnualInterestRate, originalMonthlyPayment);
            if (remainingLoanTermInMonths === Infinity) { return; }
            originalRemainingTermYears = remainingLoanTermInMonths / 12;
            remainingInterestOnOriginal = (originalMonthlyPayment * remainingLoanTermInMonths) - currentBalance;
        }

        // --- NEW LOAN CALCULATIONS (with Advanced Options) ---
        const baseNewLoanAmount = parseFloat(newLoanAmountInput.value) || 0;
        let newAnnualInterestRate = (parseFloat(document.getElementById('new-interest-rate').value) || 0) / 100;
        const newLoanTerm = parseInt(document.getElementById('new-loan-term').value) || 0;
        const baseClosingCosts = parseFloat(document.getElementById('refinance-closing-cost').value) || 0;
        const discountPoints = parseFloat(pointsInput.value) || 0;
        const rateReductionPerPoint = 0.25; // Hardcoded assumption

        const pointsCost = (baseNewLoanAmount * discountPoints) / 100;
        pointsCostDisplay.innerText = `Cost of points: $${pointsCost.toFixed(2)}`;

        // Adjust interest rate based on discount points and user-defined reduction
        if (discountPoints !== 0 && rateReductionPerPoint !== 0) {
            newAnnualInterestRate -= (discountPoints * (rateReductionPerPoint / 100));
        }

        const totalClosingCosts = baseClosingCosts + pointsCost;
        const rollInCosts = document.getElementById('roll-in-costs').checked;
        const finalNewLoanAmount = rollInCosts ? baseNewLoanAmount + totalClosingCosts : baseNewLoanAmount;

        if (finalNewLoanAmount <= 0 || newAnnualInterestRate <= 0 || newLoanTerm <= 0) { return; }

        const newMonthlyPayment = calculateMonthlyPayment(finalNewLoanAmount, newAnnualInterestRate, newLoanTerm);
        const newTotalInterest = calculateTotalInterest(finalNewLoanAmount, newMonthlyPayment, newLoanTerm);
        const monthlySavings = originalMonthlyPayment - newMonthlyPayment;

        // --- DISPLAY RESULTS ---
        document.getElementById('original-monthly-payment').innerText = `Monthly Payment: $${(originalMonthlyPayment > 0 ? originalMonthlyPayment : 0).toFixed(2)}`;
        document.getElementById('original-total-interest').innerText = `Remaining Interest: $${(remainingInterestOnOriginal > 0 ? remainingInterestOnOriginal : 0).toFixed(2)}`;

        document.getElementById('refinance-monthly-payment').innerText = `Monthly Payment: $${newMonthlyPayment.toFixed(2)}`;
        document.getElementById('refinance-total-interest').innerText = `Total Interest: $${newTotalInterest.toFixed(2)}`;
        document.getElementById('refinance-final-loan-amount').innerText = `Final Loan Amount: $${finalNewLoanAmount.toFixed(2)}`;
        console.log('Debug: Updated refinance-final-loan-amount to', document.getElementById('refinance-final-loan-amount').innerText);
        document.getElementById('refinance-effective-interest-rate').innerText = `Interest Rate: ${(newAnnualInterestRate * 100).toFixed(3)}%`;
        document.getElementById('refinance-total-closing-costs').innerText = `Total Closing Costs: $${totalClosingCosts.toFixed(2)}`;

        const cashToClose = rollInCosts ? 0 : totalClosingCosts;
        document.getElementById('refinance-cash-to-close').innerText = `Cash to Close: $${cashToClose.toFixed(2)}`;

        if (monthlySavings > 0) {
            document.getElementById('monthly-savings').innerText = `Monthly Savings: $${monthlySavings.toFixed(2)}`;
            const breakevenPoint = cashToClose / monthlySavings;
            document.getElementById('refinance-breakeven-point').innerText = `Breakeven Point: ${Math.round(breakevenPoint)} months`;
        } else {
            document.getElementById('monthly-savings').innerText = `Monthly Savings: -$${Math.abs(monthlySavings).toFixed(2)}`;
            document.getElementById('refinance-breakeven-point').innerText = "No savings with this refinance option.";
        }

        // --- CHART UPDATES ---

        // Monthly Payment Chart
        if (myMonthlyPaymentChart) {
            myMonthlyPaymentChart.data.datasets[0].data = [originalMonthlyPayment];
            myMonthlyPaymentChart.data.datasets[1].data = [newMonthlyPayment];
            myMonthlyPaymentChart.update();
        } else {
            myMonthlyPaymentChart = new Chart(monthlyPaymentChartCanvas, {
                type: 'bar',
                data: {
                    labels: ['Monthly Payment'],
                    datasets: [
                        {
                            label: 'Current Loan',
                            data: [originalMonthlyPayment],
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'New Loan',
                            data: [newMonthlyPayment],
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Monthly Payment Comparison'
                        },
                        datalabels: {
                            anchor: 'end',
                            align: 'top',
                            formatter: (value) => `$${value.toFixed(2)}`
                        }
                    },
                    scales: {
                        x: {
                            display: false // Hide x-axis labels for single bar per dataset
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Amount ($)'
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels] // Register the plugin
            });
        }

        // Total Interest Chart
        if (myTotalInterestChart) {
            myTotalInterestChart.data.datasets[0].data = [remainingInterestOnOriginal];
            myTotalInterestChart.data.datasets[1].data = [newTotalInterest];
            myTotalInterestChart.update();
        } else {
            myTotalInterestChart = new Chart(totalInterestChartCanvas, {
                type: 'bar',
                data: {
                    labels: ['Total Interest'],
                    datasets: [
                        {
                            label: 'Current Loan',
                            data: [remainingInterestOnOriginal],
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'New Loan',
                            data: [newTotalInterest],
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Total Interest Comparison'
                        },
                        datalabels: {
                            anchor: 'end',
                            align: 'top',
                            formatter: (value) => `$${value.toFixed(2)}`
                        }
                    },
                    scales: {
                        x: {
                            display: false // Hide x-axis labels for single bar per dataset
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Amount ($)'
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels] // Register the plugin
            });
        }
    }

    // --- HELPER FUNCTIONS ---
    function simulateAmortization(p, r, t, pm, e) { let b = p; const m = calculateMonthlyPayment(p, r, t); for (let i = 0; i < pm; i++) { const int = b * (r / 12); b -= (m - int + e); if (b < 0) { b = 0; break; } } return b; }
    function calculateRemainingTermInMonths(p, r, m) { const mr = r / 12; if (m <= p * mr) { return Infinity; } return -Math.log(1 - (p * mr) / m) / Math.log(1 + mr); }
    function calculateMonthlyPayment(p, r, t) { const mr = r / 12; const n = t * 12; if (p <= 0 || mr <= 0 || n <= 0) return 0; return (p * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1); }
    function calculateTotalInterest(p, m, t) { const n = t * 12; if (p <= 0 || m <= 0 || n <= 0) return 0; return (m * n) - p; }
    function calculateRemainingBalance(p, r, t, pm) { const mr = r / 12; const n = t * 12; if (pm >= n) return 0; return p * (Math.pow(1 + mr, n) - Math.pow(1 + mr, pm)) / (Math.pow(1 + mr, n) - 1); }

    // --- INITIALIZATION ---
    loanMethodRadios[0].dispatchEvent(new Event('change')); // Set default to manual
    calculateAndDisplayResults(); // Initial calculation on page load
});