import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  constructor(private supabaseService: SupabaseService) {}

  async saveQuestions(surveyId: number, questions: any[]) {
    for (const q of questions) {
      const { text, allowMultiple, answers } = q;

      const { data: question } = await this.supabaseService.client
        .from('questions')
        .insert({
          survey_id: surveyId,
          text,
          allow_multiple: allowMultiple,
        })
        .select()
        .single();

      const answerInserts = answers.map((a: any) =>
        this.supabaseService.client.from('answers').insert({
          question_id: question.id,
          text: a.text,
        }),
      );

      await Promise.all(answerInserts);
    }
  }
}
