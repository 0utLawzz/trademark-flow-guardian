import React, { useState } from 'react';
import { FiPrinter, FiFilePdf, FiUserPlus } from 'react-icons/fi';
import AssignModal from './AssignModal';
import { Assignment } from '../types';
import html2pdf from 'html2pdf.js';

interface Props {
    caseId: number;
    onRefresh: () => void; // callback after successful assignment
}

const CaseActions: React.FC<Props> = ({ caseId, onRefresh }) => {
    const [showAssign, setShowAssign] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleExportPdf = () => {
        const element = document.getElementById(`case-row-${caseId}`);
        if (!element) return;
        const opt = {
            margin: 0.5,
            filename: `case_${caseId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        };
        html2pdf().from(element).set(opt).save();
    };

    const handleAssignSuccess = (assignment: Assignment) => {
        // Optionally update UI locally, but we simply request a refresh
        onRefresh();
    };

    return (
        <div className="flex items-center gap-2">
            <button className="action-icon" title="Assign" onClick={() => setShowAssign(true)}>
                <FiUserPlus size={18} />
            </button>
            <button className="action-icon" title="Print" onClick={handlePrint}>
                <FiPrinter size={18} />
            </button>
            <button className="action-icon" title="Export PDF" onClick={handleExportPdf}>
                <FiFilePdf size={18} />
            </button>

            {showAssign && (
                <AssignModal
                    caseId={caseId}
                    onClose={() => setShowAssign(false)}
                    onSuccess={handleAssignSuccess}
                />
            )}
        </div>
    );
};

export default CaseActions;
