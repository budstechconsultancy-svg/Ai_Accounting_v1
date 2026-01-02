# Questions API Documentation

## Overview

The Questions API provides endpoints to fetch dynamic questions for ledger creation based on the selected ledger type/sub-group. Questions are stored in the `questions` table and include conditional logic for field types and validation.

## API Endpoints

### Base URL
```
http://localhost:8000/api/accounting/questions/
```

### 1. List All Questions
```http
GET /api/accounting/questions/
```

**Response:**
```json
[
  {
    "id": 1,
    "sub_group_1_1": "Bank",
    "sub_group_1_2": "29",
    "question": "Enable cheque printing",
    "condition_rule": "Yes / No.",
    "field_type": "radio",
    "required": false,
    "options": ["Yes", "No"],
    "validation": {},
    "placeholder": "Yes",
    "help_text_parsed": "",
    "created_at": "2026-01-02T11:34:25Z"
  }
]
```

### 2. Get Questions by Sub-Group
```http
GET /api/accounting/questions/by_subgroup/?sub_group_1_1=Bank
```

**Query Parameters:**
- `sub_group_1_1` (required): The sub-group name (e.g., "Bank", "Sundry Debtors", "Secured Loans")
- `sub_group_1_2` (optional): Filter by specific question code

**Response:**
```json
{
  "count": 3,
  "sub_group_1_1": "Bank",
  "questions": [
    {
      "id": 519,
      "sub_group_1_1": "Bank",
      "sub_group_1_2": "29",
      "question": "Enable cheque printing",
      "condition_rule": "Yes / No.",
      "field_type": "radio",
      "required": false,
      "options": ["Yes", "No"],
      "validation": {},
      "placeholder": "Yes",
      "help_text_parsed": ""
    },
    {
      "id": 520,
      "sub_group_1_2": "29",
      "question": "Set a limit for bank transfers",
      "field_type": "radio",
      "options": ["Yes", "No"]
    }
  ]
}
```

### 3. Search Questions
```http
GET /api/accounting/questions/search/?q=bank
```

**Query Parameters:**
- `q` (required): Search query

**Response:**
```json
{
  "count": 5,
  "query": "bank",
  "questions": [...]
}
```

### 4. Get All Sub-Groups
```http
GET /api/accounting/questions/subgroups/
```

**Response:**
```json
{
  "count": 15,
  "subgroups": [
    "Bank",
    "Preference Share Capital",
    "Secured Loans",
    "Sundry Debtors",
    "Tangible assets"
  ]
}
```

## Field Types

The API automatically parses the `condition_rule` column to determine the field type:

| Condition Rule Pattern | Field Type | Example |
|------------------------|------------|---------|
| Contains "Numeric" or "Number" | `number` | "Amount /Numeric" |
| Contains "Yes" and "No" | `radio` | "Yes / No." |
| Contains "Dropdown" or "Select" | `dropdown` | "Select option" |
| Contains "Checkbox" | `checkbox` | "Enable / Checkbox" |
| Contains "Date" | `date` | "Date / YYYY-MM-DD" |
| Contains "Email" | `email` | "Email address" |
| Contains "Phone" | `tel` | "Phone number" |
| Contains "Text" or "Alpha" | `text` | "Text / Alpha Numeric" |
| Default | `text` | Any other format |

## Condition Rule Format

The `condition_rule` column uses a slash-separated format:

```
<placeholder> / <type> / <validation> / <options> / ...
```

**Examples:**
1. `"Face value / share / Amount /Numeric / Yes /- / - / - /-"`
   - Field type: number
   - Placeholder: "Face value / share / Amount"

2. `"Enable cheque printing / Yes / No."`
   - Field type: radio
   - Options: ["Yes", "No"]

3. `"PAN / GSTIN / Aadhaar / - / Alpha Numeric (To check special characters  -, & @) /-"`
   - Field type: text
   - Validation: Alpha Numeric with special characters

## Frontend Integration Example

### React/TypeScript Example

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Question {
  id: number;
  sub_group_1_1: string;
  sub_group_1_2: string;
  question: string;
  field_type: string;
  required: boolean;
  options: string[];
  placeholder: string;
}

function LedgerQuestions({ subGroup }: { subGroup: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, any>>({});

  useEffect(() => {
    // Fetch questions for the selected sub-group
    axios.get(`/api/accounting/questions/by_subgroup/`, {
      params: { sub_group_1_1: subGroup }
    })
    .then(response => {
      setQuestions(response.data.questions);
    });
  }, [subGroup]);

  const renderField = (question: Question) => {
    switch (question.field_type) {
      case 'number':
        return (
          <input
            type="number"
            placeholder={question.placeholder}
            required={question.required}
            onChange={(e) => setAnswers({
              ...answers,
              [question.id]: e.target.value
            })}
          />
        );
      
      case 'radio':
        return question.options.map(option => (
          <label key={option}>
            <input
              type="radio"
              name={`question_${question.id}`}
              value={option}
              onChange={(e) => setAnswers({
                ...answers,
                [question.id]: e.target.value
              })}
            />
            {option}
          </label>
        ));
      
      case 'text':
      default:
        return (
          <input
            type="text"
            placeholder={question.placeholder}
            required={question.required}
            onChange={(e) => setAnswers({
              ...answers,
              [question.id]: e.target.value
            })}
          />
        );
    }
  };

  return (
    <div>
      <h3>Questions for {subGroup}</h3>
      {questions.map(question => (
        <div key={question.id}>
          <label>{question.question}</label>
          {renderField(question)}
        </div>
      ))}
    </div>
  );
}
```

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sub_group_1_1` varchar(255) DEFAULT NULL,
  `sub_group_1_2` varchar(50) DEFAULT NULL,
  `question` text DEFAULT NULL,
  `condition_rule` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `questions_sub_group_1_2_idx` (`sub_group_1_2`),
  KEY `questions_sub_group_1_1_idx` (`sub_group_1_1`)
);
```

## Testing the API

### Using cURL

```bash
# Get all questions
curl http://localhost:8000/api/accounting/questions/

# Get questions for Bank sub-group
curl "http://localhost:8000/api/accounting/questions/by_subgroup/?sub_group_1_1=Bank"

# Search questions
curl "http://localhost:8000/api/accounting/questions/search/?q=loan"

# Get all sub-groups
curl http://localhost:8000/api/accounting/questions/subgroups/
```

### Using Postman

1. **GET** `http://localhost:8000/api/accounting/questions/by_subgroup/`
2. Add query parameter: `sub_group_1_1` = `Bank`
3. Send request

## Notes

- Questions are read-only (no POST/PUT/DELETE endpoints)
- Questions are global (not tenant-specific)
- The `condition_rule` parsing is automatic and happens on-the-fly
- Field types are inferred from the condition_rule string

## Next Steps

1. Integrate the API into your frontend ledger creation form
2. Render questions dynamically based on selected ledger type
3. Collect answers and save them with the ledger
4. Implement validation based on field types and rules
