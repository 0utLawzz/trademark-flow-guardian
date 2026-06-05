import React, { useEffect, useState } from 'react';
import { Case } from '../types';
import CaseActions from './CaseActions';

interface Props {
    cases: Case[];
    onRefresh: () => void; // passed down to refresh after assignment
}

/**
 * Renders a table of cases.
 * Each row gets an id (`case-row-<case.id>`) so the PDF export can target it.
 */
const CaseList: React.FC<Props> = ({ cases, onRefresh }) => {
    return (
        <div className="overflow-x-auto glass-card p-4">
            <table className="table-case w-full">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Journal No</th>
                        <th>TM No</th>
                        <th>Assignment</th>
                        <th className="no-print">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {cases.map((c) => (
                        <tr key={c.id} id={`case-row-${c.id}`} className="hover:bg-white/5">
                            <td>{c.id}</td>
                            <td>{c.title}</td>
                            <td>{c.status}</td>
                            <td>{c.journal_no ?? '-'}</td>
                            <td>{c.tm_no ?? '-'}</td>
                            <td>
                                {c.assignment
                                    ? `${c.assignment.name} (${c.assignment.city})`
                                    : '-'}
                            </td>
                            <td className="no-print">
                                <CaseActions caseId={c.id} onRefresh={onRefresh} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CaseList;
