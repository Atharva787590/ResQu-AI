const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchIncidents() {
  const res = await fetch(`${API_BASE_URL}/api/incidents`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch incidents");
  return res.json();
}

export async function createIncident(data: {
  title: string;
  description: string;
  type: string;
  latitude: number;
  longitude: number;
  severity: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to report incident");
  return res.json();
}

export async function fetchShelters(filters?: {
  type?: string;
  pet_friendly?: boolean;
  medical_support?: boolean;
}) {
  const params = new URLSearchParams();
  if (filters?.type) params.append("type", filters.type);
  if (filters?.pet_friendly !== undefined) params.append("pet_friendly", String(filters.pet_friendly));
  if (filters?.medical_support !== undefined) params.append("medical_support", String(filters.medical_support));

  const res = await fetch(`${API_BASE_URL}/api/shelters?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch shelters");
  return res.json();
}

export async function createShelter(data: {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address: string;
  capacity: number;
  medical_support: boolean;
  pet_friendly: boolean;
  contact_number: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/shelters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create shelter");
  return res.json();
}

export async function fetchHospitals() {
  const res = await fetch(`${API_BASE_URL}/api/hospitals`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch hospitals");
  return res.json();
}

export async function fetchVolunteers() {
  const res = await fetch(`${API_BASE_URL}/api/volunteers`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch volunteers");
  return res.json();
}

export async function createVolunteer(data: {
  name: string;
  skills: string;
  location: string;
  contact_number: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/volunteers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to register volunteer");
  return res.json();
}

export async function fetchMissingPersons() {
  const res = await fetch(`${API_BASE_URL}/api/missing-persons`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch missing persons");
  return res.json();
}

export async function createMissingPerson(data: {
  name: string;
  age: number;
  last_seen_location: string;
  description: string;
  contact_info: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/missing-persons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to report missing person");
  return res.json();
}

export async function fetchSosAlerts() {
  const res = await fetch(`${API_BASE_URL}/api/sos-alerts`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch SOS alerts");
  return res.json();
}

export async function createSosAlert(data: {
  sender_name: string;
  sender_phone: string;
  latitude: number;
  longitude: number;
  situation: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/sos-alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to broadcast SOS alert");
  return res.json();
}

export async function calculateRoute(data: {
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
}) {
  const params = new URLSearchParams({
    start_lat: String(data.start_lat),
    start_lng: String(data.start_lng),
    end_lat: String(data.end_lat),
    end_lng: String(data.end_lng),
  });
  const res = await fetch(`${API_BASE_URL}/api/routes?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error("Failed to calculate route");
  return res.json();
}

export async function sendChatMessage(sessionId: string, text: string) {
  const res = await fetch(`${API_BASE_URL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_name: "app",
      user_id: "user",
      session_id: sessionId,
      streaming: false,
      new_message: {
        role: "user",
        parts: [{ text: text }]
      }
    }),
  });
  if (!res.ok) throw new Error("Failed to query ResQu AI assistant");
  const events = await res.json();
  // Extract text response from events
  let replyText = "";
  for (const event of events) {
    if (event.content && event.content.parts) {
      for (const part of event.content.parts) {
        if (part.text) {
          replyText += part.text;
        }
      }
    }
  }
  return replyText || "I'm sorry, I couldn't generate a response. Please try again.";
}
