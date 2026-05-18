export interface Question {
  id: string;
  survey_id: string;
  text: string;
  type: 'single' | 'multiple' | 'text';
}
