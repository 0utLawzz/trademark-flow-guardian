import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Assignment } from '../types';
import { FiX } from 'react-icons/fi';

interface Props {
    caseId: number;
    onClose: () => void;
    onSuccess: (assignment: Assignment) => void;
}

const AssignModal: React.FC<Props> = ({ caseId, onClose, onSuccess }) => {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [city, setCity] = useState('LHR');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('assignments')
            .upsert({ case_id: caseId, code, name, city })
            .single();

        setLoading(false);
        if (error) {
            alert('Error assigning case: ' + error.message);
            return;
        }
        onSuccess(data as Assignment);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal glass-card p-6 relative">
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                >
                    <FiX size={20} />
                </button>
                <h3 className="text-xl mb-4">Assign Case</h3>
                <label className="block mb-2">
                    Code
                    <input
                        className="input w-full mt-1"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                </label>
                <label className="block mb-2">
                    Name
                    <input
                        className="input w-full mt-1"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
                <label className="block mb-4">
                    City
                    <select
                        className="input w-full mt-1"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    >
                        <option value="LHR">LHR</option>
                        <option value="KRI">KRI</option>
                        {/* Add more city codes as needed */}
                    </select>
                </label>
                <button
                    className="btn btn-primary w-full"
                    disabled={loading}
                    onClick={handleSubmit}
                >
                    {loading ? 'Assigning…' : 'Assign'}
                </button>
            </div>
        </div>
    );
};

export default AssignModal;
