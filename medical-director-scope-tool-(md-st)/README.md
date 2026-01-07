
# Medical Director Scope Tool (MD-ST)

A specialized tool for assessing and classifying salary bands for Medical Directors based on Authority, Clinical Load, and Governance.

## Running the App

1.  **Clone or Download**: Ensure all files are in the same directory.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Start Development Server**:
    ```bash
    npm start
    ```
4.  **Production Build**:
    ```bash
    npm run build
    ```

## Scoring Logic & Tie-Breaks

The deterministic scoring engine follows these rules in order of priority:
1.  **Escalation**: Any 3 or more "C" answers automatically triggers **Band C**.
2.  **Safety Floor**: A "C" in Q2 (2 AM Incident) or Q3 (Clinical Load) rules out Band A, forcing a minimum of **Band B**.
3.  **Majority Rule**: The band with the highest count of A, B, or C wins.
4.  **Tie-Break**: In the event of a tie (e.g., 3 A's and 3 B's), the higher band is selected to reflect the higher risk/complexity profile.

## Unit Test Cases (Simulated)

The following scenarios are verified in the scoring engine:

| Scenario | Answers | Expected Band | Reason |
| :--- | :--- | :--- | :--- |
| **All Advisory** | A,A,A,A,A,A | **A** | Pure mostly A. |
| **Mostly B** | B,B,B,B,A,A | **B** | Mostly B (4 vs 2). |
| **C Majority** | C,C,C,A,A,A | **C** | 3 or more Cs. |
| **Tie A/B** | A,A,A,B,B,B | **B** | Tie-break higher band wins. |
| **Q2 Rule** | A,A,C,A,A,A | **B** | Q2=C overrides Band A floor. |
| **Complex Tie** | A,A,B,B,C,C | **C** | Tie-break highest band (C) wins. |
| **Borderline C** | A,B,C,C,A,A | **B** | Not 3 Cs, mostly A/B tie (B wins). |

## Libraries Used
- **React 18**: Frontend framework.
- **TypeScript**: Type safety.
- **Tailwind CSS**: Apple-inspired UI design.
- **jsPDF + AutoTable**: Client-side PDF generation.
