import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
    this.surveyForm = this.fb.group({
      name: ['', Validators.required],
      endDate: [''],
      category: [''],
      description: [''],
      questions: this.fb.array<FormGroup>([]),
    });

    // 🔥 Standardmäßig 1 Frage + 2 Antworten erzeugen
    this.addQuestion(); // Frage 1
    this.addAnswer(0); // Antwort A
    this.addAnswer(0); // Antwort B
  }

  dropdownOpen = false;
  selectedCategory: string | null = null;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.surveyForm.get('category')?.setValue(cat);
    this.dropdownOpen = false;
  }

  // QUESTIONS AS FORMARRAY<FORMGROUP>
  get questions(): FormArray<FormGroup> {
    return this.surveyForm.get('questions') as FormArray<FormGroup>;
  }

  // ANSWERS AS FORMARRAY<FORMGROUP>
  getAnswers(q: FormGroup): FormArray<FormGroup> {
    return q.get('answers') as FormArray<FormGroup>;
  }

  toLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  addQuestion() {
    const question = this.fb.group({
      text: ['', Validators.required],
      allowMultiple: [false],
      answers: this.fb.array<FormGroup>([]),
    });

    this.questions.push(question);

    const index = this.questions.length - 1;

    // 🔥 Abfrage: Wenn es die erste Frage ist
    if (index > 0) {
      this.addAnswer(index);
      this.addAnswer(index);
    }
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  addAnswer(questionIndex: number) {
    const answers = this.getAnswers(this.questions.at(questionIndex));

    // Maximal 6 Antworten
    if (answers.length >= 6) return;

    const answer = this.fb.group({
      text: ['', Validators.required], // Antwort darf nicht leer sein
    });

    answers.push(answer);
  }

  removeAnswer(questionIndex: number, answerIndex: number) {
    const answers = this.getAnswers(this.questions.at(questionIndex));

    if (answers.length <= 2) return; // Mindestanzahl

    answers.removeAt(answerIndex);
  }
}
