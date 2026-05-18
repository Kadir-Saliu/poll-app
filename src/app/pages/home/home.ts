import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import { calculateEndsIn } from '../../core/utils/date-utils';
import {
  getEndingSoonByCategory,
  prepareHomeLists,
  sortByCategory,
} from '../../core/utils/survey-utils';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {
  surveys: any[] = [];
  soonEnding: any[] = [];
  categoryCards: any[] = [];
  sortDropdownOpen = false;
  loading = true;
  activeSurveys: any[] = [];
  pastSurveys: any[] = [];
  activeTab: 'active' | 'past' = 'active';

  categories = [
    'Team Activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Education & Learning',
    'Lifestyle & Preferences',
    'Technology & Innovation',
  ];

  constructor(
    private cd: ChangeDetectorRef,
    private supabaseService: SupabaseService,
  ) {}

  async ngOnInit() {
    try {
      await this.loadSurveys();
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
  }

  async loadSurveys() {
    try {
      const { data, error } = await this.supabaseService.client
        .from('surveys')
        .select('*')
        .order('end_date', { ascending: true });

      if (error) return;

      this.surveys = Array.isArray(data)
        ? data.map((s) => ({
            ...s,
            id: s.id ?? String(Math.random()).slice(2),
            name: s.name ?? 'Untitled survey',
            category: s.category ?? 'Uncategorized',
            end_date: s.end_date ?? null,
            endsIn: s.end_date ? calculateEndsIn(s.end_date) : 'Unknown',
          }))
        : [];

        console.log('Surveys loaded:', this.surveys);


      const lists = prepareHomeLists(this.surveys);
      this.soonEnding = lists.soonEnding;
      this.activeSurveys = lists.activeSurveys;
      this.pastSurveys = lists.pastSurveys;
      this.categoryCards = lists.categoryCards;

      this.cd.detectChanges();
    } catch (err) {
      console.error(err);
    }
  }

  toggleSortDropdown(): void {
    this.sortDropdownOpen = !this.sortDropdownOpen;
  }

  sortByCategory(category: string): void {
    const sorted = sortByCategory(this.surveys, category, this.activeTab);
    this.activeSurveys = sorted.activeSurveys;
    this.pastSurveys = sorted.pastSurveys;
    this.sortDropdownOpen = false;
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  }

  toggleTab(tab: 'active' | 'past'): void {
    this.activeTab = tab;
  }
}
