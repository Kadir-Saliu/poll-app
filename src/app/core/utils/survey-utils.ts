// survey-utils.ts
export function getEndingSoonByCategory(surveys: any[]): any[] {
  const map = new Map<string, any>();
  for (const s of surveys) {
    const cat = s.category ?? 'Uncategorized';
    const sEnd = s.end_date ? new Date(s.end_date).getTime() : Infinity;
    const existing = map.get(cat);
    if (
      !existing ||
      sEnd < (existing.end_date ? new Date(existing.end_date).getTime() : Infinity)
    ) {
      map.set(cat, s);
    }
  }
  return Array.from(map.values());
}

// 🔹 Unterfunktion 1: Filtert aktive und vergangene Surveys
export function splitSurveysByDate(surveys: any[]): {
  activeSurveys: any[];
  pastSurveys: any[];
} {
  const today = new Date();
  const activeSurveys = surveys.filter(
    (s) => !s.end_date || new Date(s.end_date).getTime() >= today.getTime(),
  );
  const pastSurveys = surveys.filter(
    (s) => s.end_date && new Date(s.end_date).getTime() < today.getTime(),
  );
  return { activeSurveys, pastSurveys };
}

// 🔹 Unterfunktion 2: Baut die Listenstruktur für Home
export function prepareHomeLists(surveys: any[]): {
  soonEnding: any[];
  activeSurveys: any[];
  pastSurveys: any[];
  categoryCards: any[];
} {
  if (!surveys || surveys.length === 0)
    return { soonEnding: [], activeSurveys: [], pastSurveys: [], categoryCards: [] };

  const soonEnding = getEndingSoonByCategory(surveys).filter((s) => s.endsIn !== 'Unknown');
  const { activeSurveys, pastSurveys } = splitSurveysByDate(surveys);
  return { soonEnding, activeSurveys, pastSurveys, categoryCards: [...surveys] };
}

// 🔹 Unterfunktion 1: Filtert Surveys nach Kategorie
function filterByCategory(surveys: any[], category: string): any[] {
  return surveys.filter((s) => (s.category ?? 'Uncategorized') === category);
}

// 🔹 Unterfunktion 2: Teilt Surveys nach Datum in aktiv / vergangen
function splitByDate(surveys: any[]): { active: any[]; past: any[] } {
  const today = new Date();
  const active = surveys.filter(
    (s) => !s.end_date || new Date(s.end_date).getTime() >= today.getTime(),
  );
  const past = surveys.filter(
    (s) => s.end_date && new Date(s.end_date).getTime() < today.getTime(),
  );
  return { active, past };
}

// 🔹 Hauptfunktion (jetzt unter 14 Zeilen)
export function sortByCategory(
  surveys: any[],
  category: string,
  activeTab: 'active' | 'past',
): { activeSurveys: any[]; pastSurveys: any[] } {
  if (!category) return { activeSurveys: [], pastSurveys: [] };

  const filtered = filterByCategory(surveys, category);
  const { active, past } = splitByDate(filtered);

  return activeTab === 'active'
    ? { activeSurveys: active, pastSurveys: [] }
    : { activeSurveys: [], pastSurveys: past };
}
