import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  Validators,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SurveyService } from '../../core/services/survey.service';
import { QuestionService } from '../../core/services/question.service';
import {
  createQuestion,
  createAnswer,
  addAnswerToQuestion,
  removeAnswerFromQuestion,
  toLetter,
} from '../../core/utils/form-utils';
import { publishSurveyLogic } from '../../core/utils/publish-utils';

@Component({
  selector: 'app-create-survey',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-survey.html',
  styleUrls: ['./create-survey.scss'],
})
export class CreateSurvey {
  surveyForm: FormGroup;
  isPublishing = false;
  toastVisible = false;
  dropdownOpen = false;
  selectedCategory: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private surveyService: SurveyService,
    private questionService: QuestionService,
  ) {
    this.surveyForm = this.fb.group({
      name: ['', Validators.required],
      endDate: [''],
      category: [''],
      description: [''],
      questions: this.fb.array<FormGroup>([]),
    });
    this.addQuestion();
    this.addAnswer(0);
    this.addAnswer(0);
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.surveyForm.get('category')?.setValue(cat);
    this.dropdownOpen = false;
  }

  get questions(): FormArray<FormGroup> {
    return this.surveyForm.get('questions') as FormArray<FormGroup>;
  }

  getAnswers(q: FormGroup): FormArray<FormGroup> {
    return q.get('answers') as FormArray<FormGroup>;
  }

  addQuestion(): void {
    const question = createQuestion(this.fb);
    this.questions.push(question);
    const index = this.questions.length - 1;
    if (index > 0) {
      addAnswerToQuestion(this.fb, question);
      addAnswerToQuestion(this.fb, question);
    }
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  addAnswer(questionIndex: number): void {
    const question = this.questions.at(questionIndex);
    addAnswerToQuestion(this.fb, question);
  }

  removeAnswer(questionIndex: number, answerIndex: number): void {
    const question = this.questions.at(questionIndex);
    removeAnswerFromQuestion(question, answerIndex);
  }

  toLetter(index: number): string {
    return toLetter(index);
  }

  async publishSurvey(): Promise<void> {
    if (this.surveyForm.invalid || this.questions.length === 0) return;
    this.isPublishing = true;
    try {
      const surveyId = await publishSurveyLogic(
        this.surveyService,
        this.questionService,
        this.surveyForm.value,
        this.selectedCategory,
        this.questions.value,
      );
      this.showToast('Your survey is now published');
      setTimeout(() => this.router.navigate(['/home']), 2200);
    } catch {
      this.isPublishing = false;
    }
  }

  showToast(message: string): void {
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 2000);
  }
}
