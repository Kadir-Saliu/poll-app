import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { supabase } from '../../supabaseClient';

import {
  fetchSurvey,
  fetchQuestions,
  fetchAnswers,
  fetchVotes,
  calculatePercentages,
} from '../../core/utils/survey-single-utils';

@Component({
  selector: 'app-single-survey',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './single-survey.html',
  styleUrls: ['./single-survey.scss'],
})
export class SingleSurvey {
  survey: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) this.loadSurvey(id);
    });
  }

  async loadSurvey(id: string) {
    try {
      const survey = await fetchSurvey(id);
      const questions = await fetchQuestions(id);
      for (const q of questions as any[]) {
        q.answers = await fetchAnswers(q.id);
      }
      this.survey = { ...survey, questions };
      this.loading = false;
      this.cdr.detectChanges();
      await this.loadResults();
    } catch (err) {
      console.error('❌ Fehler beim Laden des Surveys:', err);
      this.loading = false;
    }
  }

  toLetter(i: number): string {
    return String.fromCharCode(65 + i);
  }

  selectAnswer(qIndex: number, aIndex: number): void {
    const question = this.survey.questions[qIndex];
    question.answers.forEach((a: any, i: number) => (a.selected = i === aIndex));
  }

  hasVotes(): boolean {
    if (!this.survey?.questions) return false;
    return this.survey.questions.some((q: any) => q.answers?.some((a: any) => a.percentage > 0));
  }

  async completeSurvey(): Promise<void> {
  for (const q of this.survey.questions) {
    const selected = q.answers.find((a: any) => a.selected);
    if (!selected) continue;

    const { error } = await supabase.from('votes').insert({
      poll_id: this.survey.id,
      question_id: q.id,
      option_id: selected.id,
      created_at: new Date().toISOString(),
    });

    if (error) console.error('❌ Fehler beim Speichern der Antwort:', error);
  }

  // 👇 Auswahl zurücksetzen und Referenz neu setzen
  this.survey.questions = this.survey.questions.map((q: any) => ({
    ...q,
    answers: q.answers.map((a: any) => ({ ...a, selected: false })),
  }));

  this.cdr.detectChanges();
  await this.loadResults();
}


  async loadResults(): Promise<void> {
    try {
      const votes = await fetchVotes(this.survey.id);
      this.survey.questions = calculatePercentages(this.survey.questions, votes);
      this.cdr.detectChanges();
    } catch (err) {
      console.error('❌ Fehler beim Laden der Ergebnisse:', err);
    }
  }
}
