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
      const id = Number(params.get('id'));
      console.log('PARAM ID CHANGED → Lade Survey', id);
      this.loadSurvey(id);
    });
  }

  async loadSurvey(id: number) {
    console.log('🟡 loadSurvey START, id =', id);

    // 1) Survey laden
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', id)
      .single();

    console.log('🟡 Survey geladen:', survey);
    if (surveyError) console.error('❌ Survey Error:', surveyError);

    if (!survey) {
      console.warn('⚠️ Kein Survey gefunden!');
      this.loading = false;
      return;
    }

    // 2) Fragen laden
    console.log('🟡 Lade Fragen für Survey:', id);

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('survey_id', id);

    console.log('🟡 Questions geladen:', questions);
    if (questionsError) console.error('❌ Questions Error:', questionsError);

    if (!questions) {
      console.warn('⚠️ Keine Fragen gefunden!');
      this.loading = false;
      return;
    }

    // 3) Antworten laden
    for (let q of questions as any[]) {
      console.log('🟣 Lade Antworten für Frage:', q.id);

      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', q.id);

      console.log('🟣 Answers für Frage', q.id, ':', answers);
      if (answersError) console.error('❌ Answers Error:', answersError);

      q.answers = answers;
    }

    console.log('🟢 FINAL QUESTIONS:', questions);

    // 4) Survey zusammenbauen
    this.survey = {
      ...survey,
      questions,
    };

    console.log('🟢 this.survey gesetzt:', this.survey);

    this.loading = false;
    this.cdr.detectChanges();

    console.log('🟢 loading = false → Angular sollte jetzt rendern');
  }

  toLetter(i: number) {
    return String.fromCharCode(65 + i);
  }

  selectAnswer(qIndex: number, aIndex: number) {
    console.log('Selected:', qIndex, aIndex);
  }

  submitSurvey() {
    console.log('Survey completed');
  }

  hasVotes(): boolean {
    if (!this.survey || !this.survey.questions) return false;

    return this.survey.questions.some((q: any) => q.answers?.some((a: any) => a.percentage > 0));
  }
}
