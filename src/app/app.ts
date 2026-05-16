import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SupabaseService } from './core/services/supabase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('poll-app');

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    console.log('🔌 Testing Supabase connection...');

    const { data, error } = await this.supabase.client
      .from('surveys')
      .select('*');

    if (error) {
      console.error('❌ Supabase error:', error);
    } else {
      console.log('✅ Supabase connected! Data:', data);
    }
  }
}
