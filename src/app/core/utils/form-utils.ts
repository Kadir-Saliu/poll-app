import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

export function createQuestion(fb: FormBuilder): FormGroup {
  return fb.group({
    text: ['', Validators.required],
    allowMultiple: [false],
    answers: fb.array<FormGroup>([]),
  });
}

export function createAnswer(fb: FormBuilder): FormGroup {
  return fb.group({ text: ['', Validators.required] });
}

export function addAnswerToQuestion(fb: FormBuilder, question: FormGroup): void {
  const answers = question.get('answers') as FormArray<FormGroup>;
  if (answers.length < 6) answers.push(createAnswer(fb));
}

export function removeAnswerFromQuestion(question: FormGroup, index: number): void {
  const answers = question.get('answers') as FormArray<FormGroup>;
  if (answers.length > 2) answers.removeAt(index);
}

export function toLetter(index: number): string {
  return String.fromCharCode(65 + index);
}
