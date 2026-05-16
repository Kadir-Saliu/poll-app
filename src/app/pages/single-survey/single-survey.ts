import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-single-survey',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './single-survey.html',
  styleUrls: ['./single-survey.scss'],
})
export class SingleSurvey {
  survey = {
    name: 'Let’s Plan the Next Team Event Together',
    description:
      'We want to create team activities that everyone will enjoy – share your preferences and ideas in our survey to help us plan better experiences together.',
    endDate: '01.09.2025',
    category: 'Team activities',

    questions: [
      {
        text: 'Which date would work best for you?',
        allowMultiple: false,
        answers: [
          { text: '19.09.2025, Friday', percentage: 27 },
          { text: '04.10.2025, Friday', percentage: 14 },
          { text: '11.10.2025, Saturday', percentage: 42 },
          { text: '31.10.2025, Friday', percentage: 17 },
        ],
      },
      {
        text: 'Choose the activities you prefer',
        allowMultiple: true,
        answers: [
          { text: 'Outdoor adventure like kayaking', percentage: 9 },
          { text: 'Office Costume Party', percentage: 0 },
          { text: 'Bowling, mini-golf, volleyball', percentage: 50 },
          { text: 'Beach party, Music & cocktails', percentage: 41 },
          { text: 'Escape room', percentage: 0 },
        ],
      },
      {
        text: 'What’s most important to you in a team event?',
        allowMultiple: false,
        answers: [
          { text: 'Team bonding', percentage: 44 },
          { text: 'Food and drinks', percentage: 22 },
          { text: 'Trying something new', percentage: 17 },
          { text: 'Keeping it low-key and stress-free', percentage: 17 },
        ],
      },
      {
        text: 'How long would you prefer the event to last?',
        allowMultiple: false,
        answers: [
          { text: 'Half a day', percentage: 14 },
          { text: 'Full day', percentage: 58 },
          { text: 'Evening only', percentage: 28 },
        ],
      },
    ],
  };

  hasVotes(): boolean {
    return this.survey.questions.some((q) => q.answers.some((a) => a.percentage > 0));
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
}
