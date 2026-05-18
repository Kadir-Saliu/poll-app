import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Survey } from '../models/survey.models';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  constructor(private supabaseService: SupabaseService) {}

  async getAllSurveys(): Promise<Survey[]> {
    const { data, error } = await this.supabaseService.client
      .from('surveys')
      .select('*')
      .order('end_date', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async createSurvey(survey: Omit<Survey, 'id' | 'endsIn'>): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('surveys')
      .insert([survey])
      .select()
      .single();

    if (error) throw error;
    return data.id; // ✅ gibt die ID zurück
  }
}
