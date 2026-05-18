import { SurveyService } from '../services/survey.service';
import { QuestionService } from '../services/question.service';

export async function publishSurveyLogic(
  surveyService: SurveyService,
  questionService: QuestionService,
  formValue: any,
  selectedCategory: string | null,
  questions: any[],
): Promise<number> {
  const { name, description, endDate, category } = formValue;
  const surveyId = await surveyService.createSurvey({
    name,
    category: selectedCategory ?? category,
    end_date: endDate || null,
    description,
  });
  await questionService.saveQuestions(surveyId, questions);
  return surveyId;
}
