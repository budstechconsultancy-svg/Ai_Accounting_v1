# Integration Guide: Adding Questions to Ledger Creation Form

## Step-by-Step Integration

### Step 1: Import the Component

In your ledger creation page (e.g., `MastersPage.tsx` or `LedgerCreationWizard.tsx`):

```typescript
import LedgerQuestions from '../components/LedgerQuestions';
```

### Step 2: Add State for Question Answers

```typescript
const [questionAnswers, setQuestionAnswers] = useState<Record<number, any>>({});
```

### Step 3: Add the Component to Your Form

Based on your screenshot, add the component after the "SUB GROUP 3" and "LEDGER TYPE" fields:

```tsx
{/* Existing form fields */}
<div className="form-group">
  <label>SUB GROUP 3</label>
  <input
    type="text"
    placeholder="Enter Name"
    value={subGroup3}
    onChange={(e) => setSubGroup3(e.target.value)}
  />
</div>

<div className="form-group">
  <label>LEDGER TYPE</label>
  <input
    type="text"
    placeholder="Enter Name"
    value={ledgerType}
    onChange={(e) => setLedgerType(e.target.value)}
  />
</div>

{/* ADD QUESTIONS COMPONENT HERE */}
{ledgerType && (
  <LedgerQuestions
    selectedLedgerType={ledgerType}
    onAnswersChange={setQuestionAnswers}
  />
)}

{/* Create Ledger button */}
<button onClick={handleCreateLedger} className="create-button">
  Create Ledger
</button>
```

### Step 4: Include Answers in Ledger Creation

When creating the ledger, include the question answers:

```typescript
const handleCreateLedger = async () => {
  const ledgerData = {
    name: ledgerName,
    category: category,
    group: group,
    sub_group_1: subGroup1,
    sub_group_2: subGroup2,
    sub_group_3: subGroup3,
    ledger_type: ledgerType,
    question_answers: questionAnswers, // Include answers
  };

  try {
    const response = await axios.post('/api/accounting/masters/ledgers/', ledgerData);
    console.log('Ledger created:', response.data);
    // Show success message
  } catch (error) {
    console.error('Error creating ledger:', error);
    // Show error message
  }
};
```

## Complete Example

Here's a complete example based on your interface:

```tsx
import React, { useState } from 'react';
import LedgerQuestions from '../components/LedgerQuestions';
import axios from '../utils/httpClient';

export const LedgerCreationWizard = () => {
  // Form state
  const [category, setCategory] = useState('');
  const [group, setGroup] = useState('');
  const [subGroup1, setSubGroup1] = useState('');
  const [subGroup2, setSubGroup2] = useState('');
  const [subGroup3, setSubGroup3] = useState('');
  const [ledgerType, setLedgerType] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState({});

  const handleCreateLedger = async () => {
    const ledgerData = {
      category,
      group,
      sub_group_1: subGroup1,
      sub_group_2: subGroup2,
      sub_group_3: subGroup3,
      ledger_type: ledgerType,
      question_answers: questionAnswers,
    };

    try {
      const response = await axios.post('/api/accounting/masters/ledgers/', ledgerData);
      alert('Ledger created successfully!');
      // Reset form or redirect
    } catch (error) {
      alert('Error creating ledger');
      console.error(error);
    }
  };

  return (
    <div className="ledger-creation-wizard">
      <h2>Create Ledger</h2>

      <div className="form-section">
        <h3>Select Ledger Type</h3>

        <div className="form-group">
          <label>CATEGORY</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Liability"
          />
        </div>

        <div className="form-group">
          <label>GROUP</label>
          <input
            type="text"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            placeholder="e.g., Long-term borrowings"
          />
        </div>

        <div className="form-group">
          <label>SUB GROUP 1</label>
          <input
            type="text"
            value={subGroup1}
            onChange={(e) => setSubGroup1(e.target.value)}
            placeholder="e.g., Secured Loans"
          />
        </div>

        <div className="form-group">
          <label>SUB GROUP 2</label>
          <input
            type="text"
            value={subGroup2}
            onChange={(e) => setSubGroup2(e.target.value)}
            placeholder="Enter Name"
          />
        </div>

        <div className="form-group">
          <label>SUB GROUP 3</label>
          <input
            type="text"
            value={subGroup3}
            onChange={(e) => setSubGroup3(e.target.value)}
            placeholder="Enter Name"
          />
        </div>

        <div className="form-group">
          <label>LEDGER TYPE</label>
          <input
            type="text"
            value={ledgerType}
            onChange={(e) => setLedgerType(e.target.value)}
            placeholder="Enter Name"
          />
        </div>
      </div>

      {/* DYNAMIC QUESTIONS - Shows when ledgerType or subGroup1 is selected */}
      {(ledgerType || subGroup1) && (
        <LedgerQuestions
          selectedLedgerType={ledgerType || subGroup1}
          onAnswersChange={setQuestionAnswers}
        />
      )}

      <button onClick={handleCreateLedger} className="create-ledger-button">
        Create Ledger
      </button>
    </div>
  );
};
```

## Determining Which Field to Use

The questions are mapped to `sub_group_1_1` in the database. Based on your hierarchy:

- If you want questions for "Secured Loans" → use `subGroup1`
- If you want questions for specific ledger types → use `ledgerType`

**Recommended approach:**

```tsx
{/* Show questions based on the most specific selection */}
{(ledgerType || subGroup1) && (
  <LedgerQuestions
    selectedLedgerType={ledgerType || subGroup1}
    onAnswersChange={setQuestionAnswers}
  />
)}
```

## Testing

1. **Select "Secured Loans"** in your hierarchy
2. **Questions should appear** below the form
3. **Fill in the answers**
4. **Click "Create Ledger"**
5. **Check console** to see the submitted data including `question_answers`

## Styling

The component includes built-in styling that matches modern UI patterns. To customize:

```css
/* In your CSS file */
.ledger-questions {
  /* Override default styles */
  background: your-color;
  border: your-border;
}
```

## API Endpoint

The component calls:
```
GET /api/accounting/questions/by_subgroup/?sub_group_1_1=Secured Loans
```

Make sure your Django server is running on `http://localhost:8000`.

## Troubleshooting

### Questions not showing?
1. Check if `selectedLedgerType` prop has a value
2. Open browser console and check for API errors
3. Verify the sub-group name matches exactly in the database

### API errors?
1. Check Django server is running: `python manage.py runserver`
2. Check the API endpoint: `http://localhost:8000/api/accounting/questions/subgroups/`
3. Verify CORS settings if needed

### Answers not being collected?
1. Check `onAnswersChange` callback is provided
2. Use React DevTools to inspect state
3. Add console.log in the callback to debug

---

**Your questions will now appear dynamically based on the selected ledger type!** 🎉
