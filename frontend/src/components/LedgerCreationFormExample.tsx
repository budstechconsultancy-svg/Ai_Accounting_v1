import React, { useState } from 'react';
import DynamicQuestions from './DynamicQuestions';

/**
 * Example: How to integrate DynamicQuestions into your ledger creation form
 */

interface LedgerFormData {
    name: string;
    category: string;
    group: string;
    sub_group_1: string;
    // ... other ledger fields
}

export const LedgerCreationFormExample: React.FC = () => {
    const [formData, setFormData] = useState<LedgerFormData>({
        name: '',
        category: '',
        group: '',
        sub_group_1: '',
    });

    const [questionAnswers, setQuestionAnswers] = useState<Record<number, any>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const ledgerData = {
            ...formData,
            question_answers: questionAnswers, // Include question answers
        };

        try {
            // Send to your API
            const response = await fetch('/api/accounting/masters/ledgers/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ledgerData),
            });

            if (response.ok) {
                console.log('Ledger created successfully!');
                // Reset form or redirect
            }
        } catch (error) {
            console.error('Error creating ledger:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create Ledger</h2>

            {/* Basic Ledger Fields */}
            <div className="form-group">
                <label>Ledger Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label>Category</label>
                <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                >
                    <option value="">Select Category</option>
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Income">Income</option>
                    <option value="Expenditure">Expenditure</option>
                </select>
            </div>

            <div className="form-group">
                <label>Group</label>
                <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    required
                >
                    <option value="">Select Group</option>
                    <option value="Current Assets">Current Assets</option>
                    <option value="Fixed Assets">Fixed Assets</option>
                    {/* Add more groups */}
                </select>
            </div>

            <div className="form-group">
                <label>Sub Group</label>
                <select
                    value={formData.sub_group_1}
                    onChange={(e) => setFormData({ ...formData, sub_group_1: e.target.value })}
                    required
                >
                    <option value="">Select Sub Group</option>
                    <option value="Bank">Bank</option>
                    <option value="Sundry Debtors">Sundry Debtors</option>
                    <option value="Secured Loans">Secured Loans</option>
                    {/* Add more sub-groups */}
                </select>
            </div>

            {/* Dynamic Questions Component */}
            {formData.sub_group_1 && (
                <DynamicQuestions
                    selectedSubGroup={formData.sub_group_1}
                    onAnswersChange={setQuestionAnswers}
                />
            )}

            {/* Submit Button */}
            <button type="submit" className="btn-primary">
                Create Ledger
            </button>
        </form>
    );
};

export default LedgerCreationFormExample;
