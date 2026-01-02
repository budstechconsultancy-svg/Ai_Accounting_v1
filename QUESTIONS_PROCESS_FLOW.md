# 🧠 Dynamic Questions Process Flow

This document outlines the end-to-end process flow of the Dynamic Questions system implemented for the AI Accounting Ledgers.

## 1. Overview
The system dynamically fetches and displays additional questions based on the selected **Ledger Type** (e.g., "Secured Loans", "Bank"). Answers are validated and saved with the Ledger.

## 2. Architecture

| Component | Responsibility | Key Elements |
|-----------|----------------|--------------|
| **Database** | Stores questions & answers | `questions` table (Source), `master_ledgers.additional_data` (Storage) |
| **Backend** | API Logic | `QuestionViewSet`, `MasterLedgerSerializer` |
| **Frontend** | UI/UX | `LedgerCreationWizard.tsx`, `LedgerQuestions.tsx` |

---

## 3. Step-by-Step Process Flow

### Step 1: User Selection
- **Action**: User navigates to **Masters > Ledgers** and selects a node in the hierarchy (e.g., "Secured Loans").
- **Trigger**: The `selectedNode` state in `LedgerCreationWizard` updates.

### Step 2: Fetching Questions
- **Component**: `<LedgerQuestions />` receives the `selectedLedgerType`.
- **API Call**: 
  ```http
  GET /api/questions/by_subgroup/?sub_group_1_1=Secured%20Loans
  ```
- **Backend Action**: `QuestionViewSet` queries the `questions` table for all rows matching the sub-group.

### Step 3: Dynamic Rendering
- **Action**: The frontend iterates through the returned questions.
- **Logic**: 
  - Renders `<input>`, `<select>`, or `<textarea>` based on `field_type` (text, number, date, etc.).
  - Displays `placeholder` and labels.

### Step 4: Input Validation
- **Logic**: As the user types, `handleAnswerChange` enforces rules defined in `condition_rule` (e.g., "Alpha Numeric").
- **Constraint**: If `condition_rule` contains `"Alpha Numeric"`, the input strictly accepts only `[a-zA-Z0-9 - & @]`. Other characters are blocked.

### Step 5: Data Submission
- **Action**: User clicks "Create Ledger".
- **Payload Construction**: `LedgerCreationWizard` bundles the form data.
  ```json
  {
    "name": "My Loan Account",
    "group": "Loans (Liability)",
    "question_answers": {
      "101": "123456789",   // Loan Account Number
      "102": "HDFC000123"    // IFSC Code
    }
  }
  ```

### Step 6: Backend Persistence
- **Endpoint**: `POST /api/masters/ledgers/`
- **Serialization**: `MasterLedgerSerializer` maps `question_answers` → `additional_data`.
- **Storage**: The JSON object is saved into the `additional_data` column of the `master_ledgers` table.

---

## 4. Key Files & Integration Points

### Backend
- **`backend/accounting/models_question.py`**: Defines `Question` model and rule parsing logic.
- **`backend/accounting/views_question.py`**: Exposes the API endpoint.
- **`backend/accounting/serializers.py`**: Maps frontend data to database model (`source='additional_data'`).

### Frontend
- **`frontend/components/LedgerQuestions.tsx`**: Main component handling UI, API calls, and Validation.
- **`frontend/components/LedgerCreationWizard.tsx`**: Parent component integrating the questions form.
- **`frontend/src/services/httpClient.ts`**: Handles authenticated API requests (with auto-refresh).

---

## 5. Troubleshooting
- **Questions not showing?**: Ensure the hierarchy name matches the `sub_group_1_1` in the database exactly.
- **401 Errors?**: The `httpClient` now auto-refreshes tokens. If persistent, re-login.
- **Answers not saving?**: Check `MasterLedgerSerializer` to ensure `question_answers` field is present (Fixed in Step 706).
