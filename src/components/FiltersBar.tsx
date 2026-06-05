import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

interface Props {
    onApply: (journalNo: string, tmNo: string, search: string) => void;
}

const FiltersBar: React.FC<Props> = ({ onApply }) => {
    const [journal, setJournal] = useState('');
    const [tm, setTm] = useState('');
    const [search, setSearch] = useState('');

    const apply = () => onApply(journal, tm, search);

    return (
        <div className="flex flex-wrap items-center gap-4 mb-4 glass-card p-3">
            <input
                type="text"
                placeholder="Journal No"
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                className="input"
            />
            <input
                type="text"
                placeholder="TM No"
                value={tm}
                onChange={(e) => setTm(e.target.value)}
                className="input"
            />
            <div className="relative flex-1">
                <input
                    type="text"
                    placeholder="Search title…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input w-full pl-8"
                />
                <FiSearch
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={apply}
                />
            </div>
            <button className="btn btn-primary" onClick={apply}>
                Apply
            </button>
        </div>
    );
};

export default FiltersBar;
