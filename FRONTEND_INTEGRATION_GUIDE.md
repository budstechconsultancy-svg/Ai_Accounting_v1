# Frontend Integration Guide - Dynamic Questions

## ✅ Complete Implementation

### Files Created:

1. **`DynamicQuestions.tsx`** - Main component for rendering questions
2. **`LedgerCreationFormExample.tsx`** - Integration example

## How to Use

### Step 1: Import the Component

```typescript
import DynamicQuestions from './components/DynamicQuestions';
```

### Step 2: Add to Your Form

```tsx
const [questionAnswers, setQuestionAnswers] = useState<Record<number, any>>({});
const [selectedSubGroup, setSelectedSubGroup] = useState('');

// In your JSX:
{selectedSubGroup && (
  <DynamicQuestions
    selectedSubGroup={selectedSubGroup}
    onAnswersChange={setQuestionAnswers}
  />
)}
```

### Step 3: Submit with Ledger Data

```typescript
const handleSubmit = async () => {
  const ledgerData = {
    name: ledgerName,
    category: category,
    group: group,
    sub_group_1: selectedSubGroup,
    question_answers: questionAnswers, // Include answers
  };

  await axios.post('/api/accounting/masters/ledgers/', ledgerData);
};
```

## Component Props

### DynamicQuestions

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedSubGroup` | `string` | Yes | The sub-group name to fetch questions for |
| `onAnswersChange` | `(answers: Record<number, any>) => void` | No | Callback when answers change |

## Supported Field Types

The component automatically renders the appropriate input based on `field_type`:

| Field Type | Rendered As | Example |
|------------|-------------|---------|
| `text` | Text input | Name, Address |
| `number` | Number input | Amount, Quantity |
| `radio` | Radio buttons | Yes/No questions |
| `checkbox` | Checkbox | Enable/Disable |
| `dropdown` | Select dropdown | List of options |
| `date` | Date picker | Date fields |
| `email` | Email input | Email address |
| `tel` | Phone input | Phone number |

## Answer Format

Answers are stored in this format:

```typescript
{
  [questionId]: answerValue
}

// Example:
{
  519: "Yes",           // Radio button answer
  520: "50000",         // Number input answer
  521: true,            // Checkbox answer
  522: "2026-01-02"     // Date answer
}
```

## Styling

The component includes built-in styles using CSS-in-JS. You can customize by:

1. **Override styles** - Add your own CSS classes
2. **Use CSS modules** - Import your own stylesheet
3. **Modify inline styles** - Edit the `<style jsx>` block

### Example Custom Styling:

```tsx
<DynamicQuestions
  selectedSubGroup={subGroup}
  onAnswersChange={setAnswers}
  className="my-custom-questions"
/>
```

```css
/* Your custom CSS */
.my-custom-questions .form-control {
  border-color: #your-color;
  border-radius: 8px;
}
```

## API Integration

### Fetching Questions

The component automatically fetches questions when `selectedSubGroup` changes:

```typescript
GET /api/accounting/questions/by_subgroup/?sub_group_1_1=Bank
```

### Response Format:

```json
{
  "count": 3,
  "sub_group_1_1": "Bank",
  "questions": [
    {
      "id": 519,
      "question": "Enable cheque printing",
      "field_type": "radio",
      "required": false,
      "options": ["Yes", "No"],
      "placeholder": "Yes"
    }
  ]
}
```

## Error Handling

The component handles:
- ✅ Loading states
- ✅ API errors
- ✅ Empty question lists
- ✅ No sub-group selected

## Validation

### Required Fields

Questions marked as `required: true` will have:
- Red asterisk (*) next to label
- HTML5 `required` attribute
- Form won't submit without answer

### Custom Validation

Add your own validation:

```typescript
const validateAnswers = (answers: Record<number, any>) => {
  const errors: string[] = [];

  questions.forEach(question => {
    if (question.required && !answers[question.id]) {
      errors.push(`${question.question} is required`);
    }

    if (question.field_type === 'number') {
      const value = parseFloat(answers[question.id]);
      if (isNaN(value) || value < 0) {
        errors.push(`${question.question} must be a positive number`);
      }
    }
  });

  return errors;
};
```

## Complete Integration Example

### In Your Ledger Creation Page:

```tsx
import React, { useState } from 'react';
import DynamicQuestions from '../components/DynamicQuestions';
import axios from 'axios';

export const CreateLedgerPage = () => {
  const [ledgerName, setLedgerName] = useState('');
  const [subGroup, setSubGroup] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/accounting/masters/ledgers/', {
        name: ledgerName,
        sub_group_1: subGroup,
        question_answers: questionAnswers,
      });

      console.log('Ledger created:', response.data);
      // Show success message, redirect, etc.
    } catch (error) {
      console.error('Error:', error);
      // Show error message
    }
  };

  return (
    <div className="create-ledger-page">
      <h1>Create New Ledger</h1>

      <form onSubmit={handleSubmit}>
        {/* Basic Fields */}
        <div className="form-group">
          <label>Ledger Name *</label>
          <input
            type="text"
            value={ledgerName}
            onChange={(e) => setLedgerName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Sub Group *</label>
          <select
            value={subGroup}
            onChange={(e) => setSubGroup(e.target.value)}
            required
          >
            <option value="">Select...</option>
            <option value="Bank">Bank</option>
            <option value="Sundry Debtors">Sundry Debtors</option>
            <option value="Secured Loans">Secured Loans</option>
          </select>
        </div>

        {/* Dynamic Questions */}
        {subGroup && (
          <DynamicQuestions
            selectedSubGroup={subGroup}
            onAnswersChange={setQuestionAnswers}
          />
        )}

        {/* Submit */}
        <button type="submit" className="btn-primary">
          Create Ledger
        </button>
      </form>
    </div>
  );
};
```

## Testing

### Test the Component:

1. **Select a sub-group** - Questions should load automatically
2. **Fill in answers** - Check that `onAnswersChange` is called
3. **Submit form** - Verify answers are included in submission
4. **Change sub-group** - Questions should update and answers reset

### Debug Mode:

```tsx
<DynamicQuestions
  selectedSubGroup={subGroup}
  onAnswersChange={(answers) => {
    console.log('Answers updated:', answers);
    setQuestionAnswers(answers);
  }}
/>
```

## Troubleshooting

### Questions not loading?
- Check API is running: `http://localhost:8000/api/accounting/questions/`
- Verify sub-group name matches database exactly (case-sensitive)
- Check browser console for errors

### Answers not updating?
- Ensure `onAnswersChange` callback is provided
- Check React DevTools to see state updates

### Styling issues?
- Check for CSS conflicts with existing styles
- Use browser DevTools to inspect elements
- Override styles with higher specificity

## Next Steps

1. ✅ Component is ready to use
2. 🔄 Integrate into your ledger creation form
3. 🔄 Test with different sub-groups
4. 🔄 Add custom validation if needed
5. 🔄 Style to match your design system

---

**The DynamicQuestions component is production-ready!** 🎉
