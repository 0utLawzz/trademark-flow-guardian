export interface Assignment {
    id?: number;
    case_id?: number;
    code: string;
    name: string;
    city: string;
}

export interface Case {
    id: number;
    title: string;
    status: string;
    journal_no: string | null;
    tm_no: string | null;
    client_group: string | null;
    assignment?: Assignment | null;
}
