import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {
  surveys = [
    {
      id: 1,
      name: 'Weekly feedback round',
      category: 'Team activities',
      endsIn: '2 days',
    },
    {
      id: 2,
      name: 'Sprint retrospective',
      category: 'Team activities',
      endsIn: 'tomorrow',
    },
    {
      id: 3,
      name: 'Team mood check',
      category: 'Team activities',
      endsIn: 'today',
    },
  ];
}
