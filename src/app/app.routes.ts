import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { CreateSurvey } from './pages/create-survey/create-survey';
import { SingleSurvey } from './pages/single-survey/single-survey';

export const routes: Routes = [
  {
    path: 'home',
    component: Home,
    runGuardsAndResolvers: 'always',
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  { path: 'create', component: CreateSurvey },
  { path: 'single/:id', component: SingleSurvey },
];
