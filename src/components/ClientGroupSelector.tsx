import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { FiUsers } from 'react-icons/fi';

interface Group {
    id: string;
    name: string;
}

/**
 * Shows all client groups as glass‑card tiles.
 * Clicking a tile navigates to /client-groups/:groupId
 */
const ClientGroupSelector: React.FC = () => {
    const navigate = useNavigate();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('client_groups')
                .select('id, name')
                .order('name');
            if (error) {
                console.error('Failed to fetch client groups', error);
                return;
            }
            setGroups(data as Group[]);
            setLoading(false);
        })();
    }, []);

    if (loading) return <p>Loading client groups…</p>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
                <div
                    key={g.id}
                    className="glass-card cursor-pointer flex items-center p-4 hover:shadow-xl transition-shadow"
                    onClick={() => navigate(`/client-groups/${g.id}`)}
                >
                    <FiUsers size={32} className="mr-3 text-indigo-200" />
                    <h3 className="text-lg font-medium">{g.name}</h3>
                </div>
            ))}
        </div>
    );
};

export default ClientGroupSelector;
