import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Validators } from '@angular/forms';
import { supabase } from '../../supabaseClient';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-survey',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-survey.html',
  styleUrl: './create-survey.scss',
})
export class CreateSurvey {
  surveyForm: FormGroup;
  isPublishing = false;

  dropdownOpen = false;
  selectedCategory: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.surveyForm = this.fb.group({
      name: ['', Validators.required],
      endDate: [''],
      category: [''],
      description: [''],
      questions: this.fb.array<FormGroup>([]),
    });

    // Standardmäßig 1 Frage + 2 Antworten
    this.addQuestion();
    this.addAnswer(0);
    this.addAnswer(0);
  }

  // DROPDOWN
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.surveyForm.get('category')?.setValue(cat);
    this.dropdownOpen = false;
  }

  // FORMARRAY GETTER
  get questions(): FormArray<FormGroup> {
    return this.surveyForm.get('questions') as FormArray<FormGroup>;
  }

  getAnswers(q: FormGroup): FormArray<FormGroup> {
    return q.get('answers') as FormArray<FormGroup>;
  }

  toLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // FRAGEN
  addQuestion() {
    const question = this.fb.group({
      text: ['', Validators.required],
      allowMultiple: [false],
      answers: this.fb.array<FormGroup>([]),
    });

    this.questions.push(question);

    const index = this.questions.length - 1;

    // Ab Frage 2 → automatisch 2 Antworten
    if (index > 0) {
      this.addAnswer(index);
      this.addAnswer(index);
    }
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  // ANTWORTEN
  addAnswer(questionIndex: number) {
    const answers = this.getAnswers(this.questions.at(questionIndex));

    if (answers.length >= 6) return;

    const answer = this.fb.group({
      text: ['', Validators.required],
    });

    answers.push(answer);
  }

  removeAnswer(questionIndex: number, answerIndex: number) {
    const answers = this.getAnswers(this.questions.at(questionIndex));

    if (answers.length <= 2) return;

    answers.removeAt(answerIndex);
  }

  // PUBLISH
  async publishSurvey() {
    if (this.surveyForm.invalid || this.questions.length === 0) return;

    this.isPublishing = true;

    const { name, description, endDate, category } = this.surveyForm.value;

    // SURVEY SPEICHERN
    const { data: survey, error } = await supabase
      .from('surveys')
      .insert({
        name,
        description,
        category:this.selectedCategory,
        end_date: endDate || null,
        status: 'published',
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      this.isPublishing = false;
      return;
    }

    // FRAGEN + ANTWORTEN SPEICHERN
    await this.saveQuestions(survey.id);

    this.isPublishing = false;

    // WEITERLEITUNG
    this.router.navigate(['/single', survey.id]);
  }

  // FRAGEN + ANTWORTEN SPEICHERN
  async saveQuestions(surveyId: number) {
    for (let q of this.questions.controls) {
      const text = q.get('text')?.value;
      const allowMultiple = q.get('allowMultiple')?.value;

      const { data: question } = await supabase
        .from('questions')
        .insert({
          survey_id: surveyId,
          text,
          allow_multiple: allowMultiple,
        })
        .select()
        .single();

      const answerInserts = q.get('answers')!.value.map((a: any) =>
        supabase.from('answers').insert({
          question_id: question.id,
          text: a.text,
        }),
      );

      await Promise.all(answerInserts);
      console.log(answerInserts);
    }
  }
}
