export interface Incident {
  id: string;
  type: "traffic" | "full" | "delay" | "police";
  description: string;
  coordinates: [number, number];
  timestamp: number;
  routeId?: string;
  routeName?: string;
  likes: number;
}

const STORAGE_KEY = "bussamario_incidents";
const EXPIRATION_TIME = 15 * 60 * 1000; // 15 minutes

// Custom event name for instant updates
export const INCIDENT_UPDATE_EVENT = "bussamario_incident_update";

function triggerUpdate() {
  window.dispatchEvent(new CustomEvent(INCIDENT_UPDATE_EVENT));
}

export const incidentStore = {
  getIncidents: (): Incident[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const list: Incident[] = JSON.parse(stored);
      
      // Filter out expired incidents
      const now = Date.now();
      const active = list.filter((inc) => now - inc.timestamp < EXPIRATION_TIME);
      
      if (active.length !== list.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
      }
      
      return active;
    } catch (err) {
      console.error("Error reading incidents:", err);
      return [];
    }
  },

  addIncident: (type: Incident["type"], coordinates: [number, number], routeId?: string, routeName?: string): Incident => {
    const descriptions: Record<Incident["type"], string> = {
      traffic: "Tráfico pesado y retrasos en la vía.",
      full: "Buseta con cupo máximo de pasajeros.",
      delay: "Demoras reportadas en el paso del bus.",
      police: "Control de tránsito / Policía vial.",
    };

    const newIncident: Incident = {
      id: `inc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      description: descriptions[type],
      coordinates,
      timestamp: Date.now(),
      routeId,
      routeName,
      likes: 0,
    };

    const incidents = incidentStore.getIncidents();
    incidents.push(newIncident);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
    
    triggerUpdate();
    return newIncident;
  },

  likeIncident: (id: string): void => {
    const incidents = incidentStore.getIncidents();
    const incident = incidents.find((inc) => inc.id === id);
    if (incident) {
      incident.likes += 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
      triggerUpdate();
    }
  },

  clearExpired: (): void => {
    const incidents = incidentStore.getIncidents();
    // This will trigger filtering in getIncidents and saving if changed
    triggerUpdate();
  },
};
