import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { supabase } from '../../supabaseClient';
import { ChangeDetectorRef } from '@angular/core';

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
      console.log('🔄 Lade Survey mit ID', id);
      this.loadSurvey(id);
    });
  }

  async loadSurvey(id: string | null) {
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', id ?? '')
      .single();

    if (surveyError) {
      console.error('❌ Fehler beim Laden des Surveys:', surveyError);
      this.loading = false;
      return;
    }

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('survey_id', id);

    if (questionsError) {
      console.error('❌ Fehler beim Laden der Fragen:', questionsError);
      this.loading = false;
      return;
    }

    for (const q of questions as any[]) {
      const { data: answers } = await supabase.from('answers').select('*').eq('question_id', q.id);
      q.answers = answers;
    }

    this.survey = { ...survey, questions };
    this.loading = false;
    this.cdr.detectChanges();

    // 👇 Hier neu:
    await this.loadResults();
  }

  toLetter(i: number) {
    return String.fromCharCode(65 + i);
  }

  selectAnswer(qIndex: number, aIndex: number) {
    const question = this.survey.questions[qIndex];
    question.answers.forEach((a: any, i: number) => (a.selected = i === aIndex));
    console.log('✅ Antwort gewählt:', question.answers[aIndex]);
  }

  hasVotes(): boolean {
    if (!this.survey?.questions) return false;
    return this.survey.questions.some((q: any) => q.answers?.some((a: any) => a.percentage > 0));
  }

  async completeSurvey() {
    console.log('🟢 Survey wird abgeschlossen...');

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
      else console.log('✅ Antwort gespeichert für Frage', q.id);
    }

    await this.loadResults();
  }

  async loadResults() {
    const { data: votes, error } = await supabase
      .from('votes')
      .select('option_id')
      .eq('poll_id', this.survey.id);

    if (error) {
      console.error('❌ Fehler beim Laden der Ergebnisse:', error);
      return;
    }

    const counts: Record<string, number> = {};
    for (const v of votes) {
      counts[v.option_id] = (counts[v.option_id] || 0) + 1;
    }

    for (const q of this.survey.questions) {
      const totalVotes = q.answers.reduce((sum: number, a: any) => sum + (counts[a.id] || 0), 0);

      for (const a of q.answers) {
        const votesForAnswer = counts[a.id] || 0;
        a.percentage = totalVotes > 0 ? Math.round((votesForAnswer / totalVotes) * 100) : 0;
      }
    }

    console.log('📊 Ergebnisse aktualisiert');
    this.cdr.detectChanges();
  }
}
