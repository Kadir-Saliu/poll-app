import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../supabaseClient';

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

  constructor(private cd: ChangeDetectorRef) {}

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
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('end_date', { ascending: true });

      if (error) return;

      this.surveys = Array.isArray(data)
        ? data.map((s) => ({
            ...s,
            id: s.id ?? s.uuid ?? s._id ?? String(Math.random()).slice(2),
            name: s.name ?? s.title ?? 'Untitled survey',
            category: s.category ?? 'Uncategorized',
            end_date: s.end_date ?? s.endsAt ?? null,
            endsIn: s.end_date ? this.calculateEndsIn(s.end_date) : 'Unknown',
          }))
        : [];

      this.prepareHomeLists();
      setTimeout(() => window.dispatchEvent(new Event('resize')), 1);
    } catch (err) {
      console.error(err);
    }
    this.cd.detectChanges();
  }

  calculateEndsIn(endDate: string) {
    const today = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (isNaN(days)) return 'Unknown';
    if (days <= 0) return 'Ended';
    if (days === 1) return '1 day';
    return `${days} days`;
  }

  getEndingSoonByCategory() {
    const map = new Map<string, any>();
    for (const s of this.surveys) {
      const cat = s.category ?? 'Uncategorized';
      if (!map.has(cat)) {
        map.set(cat, s);
        continue;
      }
      const existing = map.get(cat);
      const sEnd = s.end_date ? new Date(s.end_date).getTime() : Infinity;
      const eEnd = existing.end_date ? new Date(existing.end_date).getTime() : Infinity;
      if (sEnd < eEnd) map.set(cat, s);
    }
    return Array.from(map.values());
  }

  prepareHomeLists() {
    if (!this.surveys || this.surveys.length === 0) {
      this.soonEnding = [];
      this.categoryCards = [];
      this.activeSurveys = [];
      this.pastSurveys = [];
      return;
    }

    this.soonEnding = this.getEndingSoonByCategory();

    const today = new Date();

    this.activeSurveys = this.surveys.filter((s) => {
      const end = new Date(s.end_date);
      return end.getTime() >= today.getTime();
    });

    this.pastSurveys = this.surveys.filter((s) => {
      const end = new Date(s.end_date);
      return end.getTime() < today.getTime();
    });

    const byCategory = new Map<string, any>();
    for (const s of this.surveys) {
      const cat = s.category ?? 'Uncategorized';
      if (!byCategory.has(cat)) byCategory.set(cat, s);
    }
    this.categoryCards = Array.from(byCategory.values());
  }

  toggleSortDropdown() {
    this.sortDropdownOpen = !this.sortDropdownOpen;
  }

  sortByCategory(category: string) {
    if (!category) {
      this.prepareHomeLists();
      return;
    }

    const today = new Date();

    if (this.activeTab === 'active') {
      this.activeSurveys = this.surveys.filter(
        (s) =>
          (s.category ?? 'Uncategorized') === category &&
          new Date(s.end_date).getTime() >= today.getTime(),
      );
    } else {
      this.pastSurveys = this.surveys.filter(
        (s) =>
          (s.category ?? 'Uncategorized') === category &&
          new Date(s.end_date).getTime() < today.getTime(),
      );
    }

    this.sortDropdownOpen = false;
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  }

  toggleTab(tab: 'active' | 'past') {
    this.activeTab = tab;
  }
}
