export interface Survey {
  id: string;
  name: string;
  category: string;
  end_date: string | null;
  endsIn: string;
  description?: string,
}
