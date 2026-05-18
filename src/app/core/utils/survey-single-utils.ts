import { supabase } from '../../supabaseClient';

export async function fetchSurvey(id: string) {
  const { data, error } = await supabase.from('surveys').select('*').eq('id', id).single();
  if (error) throw new Error('Survey load failed');
  return data;
}

export async function fetchQuestions(id: string) {
  const { data, error } = await supabase.from('questions').select('*').eq('survey_id', id);
  if (error) throw new Error('Questions load failed');
  return data;
}

export async function fetchAnswers(questionId: number) {
  const { data } = await supabase.from('answers').select('*').eq('question_id', questionId);
  return data || [];
}

export async function fetchVotes(pollId: number) {
  const { data, error } = await supabase.from('votes').select('option_id').eq('poll_id', pollId);
  if (error) throw new Error('Votes load failed');
  return data || [];
}

export function calculatePercentages(questions: any[], votes: any[]) {
  const counts: Record<string, number> = {};
  for (const v of votes) counts[v.option_id] = (counts[v.option_id] || 0) + 1;

  for (const q of questions) {
    const total = q.answers.reduce((sum: number, a: any) => sum + (counts[a.id] || 0), 0);
    for (const a of q.answers) {
      const votesForAnswer = counts[a.id] || 0;
      a.percentage = total > 0 ? Math.round((votesForAnswer / total) * 100) : 0;
    }
  }
  return questions;
}
