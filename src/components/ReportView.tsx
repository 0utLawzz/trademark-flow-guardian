import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { Case } from '../types';

interface Props {
    cases: Case[];
}

/**
 * Hidden printable area – the table is duplicated here so that the print
 * view does not contain UI controls (buttons, filters, etc.).
 */
const ReportView: React.FC<Props> = ({ cases }) => {
    const ref = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (!ref.current) return;
        // temporarily show the hidden area, trigger print, then hide again
        const original = ref.current.style.display;
        ref.current.style.display = 'block';
        window.print();
        ref.current.style.display = original;
    };

    const handleExportPdf = () => {
        if (!ref.current) return;
        const opt = {
            margin: 0.5,
            filename: `cases_report_${new Date().toISOString()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        };
        html2pdf().from(ref.current).set(opt).save();
    };

    return (
        <div className="no-print mt-4">
            <button className="btn mr-2" onClick={handlePrint}>
                Print Report
            </button>
            <button className="btn" onClick={handleExportPdf}>
                Export PDF
            </button>

            {/* Hidden printable div */}
            <div ref={ref} style={{ display: 'none' }}>
                <h2 className="text-center mb-4">Case Report</h2>
                <table className="table-case w-full">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Journal No</th>
                            <th>TM No</th>
                            <th>Assignment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cases.map((c) => (
                            <tr key={c.id}>
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
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Brand footer – fetched once via BrandHeader (re‑used) */}
                <div className="mt-6 text-sm text-center">
                    {/* The BrandHeader component can be rendered here again if you want the logo on the PDF */}
                </div>
            </div>
        </div>
    );
};

export default ReportView;
