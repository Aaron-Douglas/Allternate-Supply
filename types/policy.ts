export interface Policy {
  id: string;
  type: 'warranty' | 'returns';
  title: string;
  content: string;
  effective_date: string;
  updated_at: string;
  updated_by: string | null;
}
