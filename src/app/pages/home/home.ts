import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {
  surveys = [
    {
      id: 1,
      name: 'Let’s Plan the Next Team Event Together',
      category: 'Team activities',
      endDate: '2025-09-01',
    },
    {
      id: 2,
      name: 'Fit & wellness survey!',
      category: 'Health & Wellness',
      endDate: '2025-09-02',
    },
    {
      id: 3,
      name: 'Gaming habits and favorite games!',
      category: 'Gaming & Entertainment',
      endDate: '2025-09-03',
    },
    {
      id: 4,
      name: 'Workplace culture survey',
      category: 'Workplace culture',
      endDate: '2025-09-10',
    },
    {
      id: 5,
      name: 'Event feedback',
      category: 'Events',
      endDate: '2025-09-12',
    },
    {
      id: 6,
      name: 'General feedback',
      category: 'Other',
      endDate: '2025-09-15',
    },
    
  ];

  sortDropdownOpen = false;

  categories = [
    'Team Activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Education & Learning',
    'Lifestyle & Preferences',
    'Technology & Innovation',
  ];

  toggleSortDropdown() {
    this.sortDropdownOpen = !this.sortDropdownOpen;
  }

  sortByCategory(category: string) {
    console.log('Sort by:', category);
    this.sortDropdownOpen = false;
  }

  soonEnding: any[] = [];
  categoryCards: any[] = [];

  ngOnInit() {
    // 3 Highlight Cards
    this.soonEnding = [...this.surveys]
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      .slice(0, 3);

    // 6 Cards – je Kategorie 1
    const map = new Map();
    for (const s of this.surveys) {
      if (!map.has(s.category)) {
        map.set(s.category, s);
      }
    }
    this.categoryCards = Array.from(map.values()).slice(0, 6);
  }
}
