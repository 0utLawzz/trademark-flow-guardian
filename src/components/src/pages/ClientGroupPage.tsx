import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Case } from '../types';
import CaseList from '../components/CaseList';
import FiltersBar from '../components/FiltersBar';
import ReportView from '../components/ReportView';
import BrandHeader from '../components/BrandHeader';

const ClientGroupPage: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const [cases, setCases] = useState<Case[]>([]);
    const [filtered, setFiltered] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);

    // Load cases for the selected group
    useEffect(() => {
        if (!groupId) return;
        (async () => {
            const { data, error } = await supabase
                .from('cases')
                .select('*, assignments(*)')
                .eq('client_group', groupId)
                .order('id');
            if (error) {
                console.error('Failed to load cases', error);
                setLoading(false);
                return;
            }
            setCases(data as Case[]);
            setFiltered(data as Case[]);
            setLoading(false);
        })();
    }, [groupId]);

    const applyFilters = (journalNo: string, tmNo: string, search: string) => {
        let filteredList = cases;
        if (journalNo) filteredList = filteredList.filter((c) => c.journal_no === journalNo);
        if (tmNo) filteredList = filteredList.filter((c) => c.tm_no === tmNo);
        if (search) {
            const s = search.toLowerCase();
            filteredList = filteredList.filter((c) => c.title.toLowerCase().includes(s));
        }
        setFiltered(filteredList);
    };

    const refresh = () => {
        // re‑fetch cases after an assignment change
        if (!groupId) return;
        (async () => {
            const { data, error } = await supabase
                .from('cases')
                .select('*, assignments(*)')
                .eq('client_group', groupId);
            if (!error) {
                setCases(data as Case[]);
                setFiltered(data as Case[]);
            }
        })();
    };

    if (loading) return <p>Loading cases…</p>;

    return (
        <div className="container mx-auto p-4">
            <BrandHeader />
            <h1 className="text-2xl font-bold mb-4">Client Group Dashboard</h1>
            <FiltersBar onApply={applyFilters} />
            <CaseList cases={filtered} onRefresh={refresh} />
            <ReportView cases={filtered} />
        </div>
    );
};

export default ClientGroupPage;
