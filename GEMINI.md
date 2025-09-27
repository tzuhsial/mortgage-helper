# Should I Refinance Helper

This project is a simple web application to help users determine if they should refinance their mortgage.

## How it works

The user will input their current mortgage information and the new mortgage information. The application will then calculate the potential savings and provide a recommendation.

## Technologies

*   HTML
*   CSS
*   JavaScript

## Loan Calculation and Estimation Logic

To provide a flexible and accurate comparison, the calculator offers two methods for determining the user's current mortgage situation. This design choice was made to accommodate users who may have made extra principal payments, which would make a simple amortization schedule inaccurate.

### 1. Automatic Estimation ("Calculate for me")

This is the default method. The user provides their original loan details:
*   Original Loan Amount
*   Original Loan Term
*   Original Interest Rate
*   Loan Start Date

The calculator then estimates the current state of the loan.

**Remaining Balance Formula:**
The remaining balance (`B`) after a certain number of payments (`p`) is calculated using the following formula:

```
B = P * [((1+r)^n - (1+r)^p) / ((1+r)^n - 1)]
```
*   `B`: Remaining balance
*   `P`: Original principal loan amount
*   `r`: Monthly interest rate (annual rate / 12)
*   `n`: Total number of payments for the loan (term in years * 12)
*   `p`: Number of payments made so far

### 2. Manual Entry ("Enter manually")

This method is for users who know their exact loan details from a recent statement, which is necessary if they have made extra payments. The user provides:
*   Current Loan Balance
*   Current Monthly Payment
*   Current Annual Interest Rate

**Remaining Term Calculation:**
A key insight from our discussion was that we don't need to ask the user for the remaining loan term. It can be calculated from the other inputs.

**Remaining Term Formula:**
The number of remaining payments (`n`) is calculated using the following formula:
```
n = -log(1 - (P * r) / M) / log(1 + r)
```
*   `n`: Number of remaining payments (in months)
*   `P`: Current loan balance
*   `r`: Monthly interest rate (annual rate / 12)
*   `M`: Current monthly payment

This calculated remaining term is then used to determine the total remaining interest on the current loan, providing a precise baseline for the refinance comparison.

---

**General Monthly Payment Formula:**
For reference, the standard formula to calculate a fixed monthly mortgage payment (`M`) is:
```
M = P * [r(1+r)^n] / [(1+r)^n - 1]
```
*   `M`: Monthly payment
*   `P`: Principal loan amount
*   `r`: Monthly interest rate
*   `n`: Number of payments