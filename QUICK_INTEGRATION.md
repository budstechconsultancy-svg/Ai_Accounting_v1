# Quick Integration Guide

## Exact Placement in Your Form

Based on your screenshot, add the questions component in this exact order:

```tsx
{/* Existing fields */}
<div className="form-row">
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
</div>

{/* ADD QUESTIONS HERE - Between the input fields and Create button */}
{subGroup1 && (
  <LedgerQuestions
    selectedLedgerType={subGroup1}  // Use "Secured Loans" from SUB GROUP 1
    onAnswersChange={setQuestionAnswers}
  />
)}

{/* Create Ledger button - This stays at the bottom */}
<button 
  onClick={handleCreateLedger}
  className="create-ledger-button"
  disabled={!areAllRequiredQuestionsAnswered()}
>
  Create Ledger
</button>
```

## Visual Layout:

```
┌─────────────────────────────────────────────────┐
│ SUB GROUP 3          LEDGER TYPE                │
│ [Enter Name]         [Enter Name]               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Additional Information                          │  ← Questions appear here
│ Please provide details for Secured Loans        │
│                                                 │
│ 1. Question 1                                   │
│    [answer field]                               │
│                                                 │
│ 2. Question 2                                   │
│    [answer field]                               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│           [Create Ledger]                       │  ← Button at bottom
└─────────────────────────────────────────────────┘
```

## Complete Example for Your Page:

```tsx
import React, { useState } from 'react';
import LedgerQuestions from '../components/LedgerQuestions';

export const LedgerPreview = () => {
  const [category, setCategory] = useState('Liability');
  const [group, setGroup] = useState('Long-term borrowings');
  const [subGroup1, setSubGroup1] = useState('Secured Loans');
  const [subGroup2, setSubGroup2] = useState('');
  const [subGroup3, setSubGroup3] = useState('');
  const [ledgerType, setLedgerType] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState({});

  const handleCreateLedger = () => {
    const ledgerData = {
      category,
      group,
      sub_group_1: subGroup1,
      sub_group_2: subGroup2,
      sub_group_3: subGroup3,
      ledger_type: ledgerType,
      question_answers: questionAnswers
    };
    
    console.log('Creating ledger:', ledgerData);
    // API call here
  };

  return (
    <div className="ledger-preview">
      <h3>Ledger Preview</h3>

      <div className="preview-row">
        <div className="preview-field">
          <label>CATEGORY</label>
          <div className="value">{category}</div>
        </div>
        <div className="preview-field">
          <label>GROUP</label>
          <div className="value">{group}</div>
        </div>
      </div>

      <div className="preview-row">
        <div className="preview-field">
          <label>SUB GROUP 1</label>
          <div className="value">{subGroup1}</div>
        </div>
        <div className="preview-field">
          <label>SUB GROUP 2</label>
          <div className="value">{subGroup2 || '-'}</div>
        </div>
      </div>

      <div className="preview-row">
        <div className="preview-field">
          <label>SUB GROUP 3</label>
          <input
            type="text"
            placeholder="Enter Name"
            value={subGroup3}
            onChange={(e) => setSubGroup3(e.target.value)}
          />
        </div>
        <div className="preview-field">
          <label>LEDGER TYPE</label>
          <input
            type="text"
            placeholder="Enter Name"
            value={ledgerType}
            onChange={(e) => setLedgerType(e.target.value)}
          />
        </div>
      </div>

      {/* QUESTIONS APPEAR HERE */}
      {subGroup1 && (
        <LedgerQuestions
          selectedLedgerType={subGroup1}
          onAnswersChange={setQuestionAnswers}
        />
      )}

      {/* CREATE BUTTON AT BOTTOM */}
      <button 
        onClick={handleCreateLedger}
        className="create-ledger-btn"
      >
        Create Ledger
      </button>
    </div>
  );
};
```

## Key Points:

1. ✅ Questions appear **after** SUB GROUP 3 and LEDGER TYPE fields
2. ✅ Questions appear **before** the Create Ledger button
3. ✅ Questions load when `subGroup1` has a value ("Secured Loans")
4. ✅ Answers are collected in `questionAnswers` state
5. ✅ Button submits both ledger data AND question answers

That's it! The questions will now appear in the correct position.
