import os
import json
import logging
from typing import AsyncGenerator
from google.adk.agents import Agent, BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types

from .tools import (
    get_active_incidents,
    get_nearby_shelters,
    get_nearby_hospitals,
    log_sos_alert,
    get_safe_route,
    get_preparedness_checklist,
    report_missing_person,
    register_volunteer,
    get_weather_info
)

logger = logging.getLogger(__name__)

# Check if LLM API key or GCP project is present
HAS_CREDENTIALS = "GOOGLE_API_KEY" in os.environ or "GOOGLE_CLOUD_PROJECT" in os.environ

# Declare ADK tools for LLM binding
def tool_get_active_incidents() -> list[dict]:
    """Retrieves all active emergency incidents reported in the system."""
    return get_active_incidents()

def tool_get_nearby_shelters(shelter_type: str = None, pet_friendly: bool = None, medical_support: bool = None) -> list[dict]:
    """Finds shelters, relief camps, or food distribution centers matching the filters."""
    return get_nearby_shelters(shelter_type, pet_friendly, medical_support)

def tool_get_nearby_hospitals() -> list[dict]:
    """Retrieves all emergency medical hospitals and blood banks with bed availability."""
    return get_nearby_hospitals()

def tool_log_sos_alert(sender_name: str, sender_phone: str, latitude: float, longitude: float, situation: str) -> dict:
    """Dispatches a critical SOS emergency alert from a citizen to responders."""
    return log_sos_alert(sender_name, sender_phone, latitude, longitude, situation)

def tool_get_safe_route(start_lat: float, start_lng: float, end_lat: float, end_lng: float) -> dict:
    """Calculates the safest route between two coordinates, bypassing hazard areas."""
    return get_safe_route(start_lat, start_lng, end_lat, end_lng)

def tool_get_preparedness_checklist(disaster_type: str) -> dict:
    """Provides a tailored emergency checklist and supplies list for a specific disaster."""
    return get_preparedness_checklist(disaster_type)

def tool_get_weather_info(location: str) -> dict:
    """Fetches real-time weather information and safety hazard advisory reports for any location."""
    return get_weather_info(location)

if HAS_CREDENTIALS:
    # 1. Classification Agent
    classification_agent = Agent(
        name="classification_agent",
        model=Gemini(model="gemini-flash-latest"),
        instruction="""You are an Incident Classification Agent. 
        Your job is to identify the type of emergency (flood, fire, earthquake, cyclone, landslide, accident, medical emergency) 
        from the user's description and state the severity level (low, medium, high, critical). 
        Always output your classification clearly in markdown.""",
        description="Classifies disaster incidents by type and severity."
    )

    # 2. Routing Agent
    routing_agent = Agent(
        name="routing_agent",
        model=Gemini(model="gemini-flash-latest"),
        tools=[tool_get_safe_route],
        instruction="""You are a Routing Agent. 
        Your job is to find the safest route for evacuation or response. 
        Use the tool_get_safe_route tool to compute the route, then present the coordinates, bypass instructions, and safety warnings to the user.""",
        description="Finds safe evacuation paths bypassing blocked or hazard regions."
    )

    # 3. Medical Agent
    medical_agent = Agent(
        name="medical_agent",
        model=Gemini(model="gemini-flash-latest"),
        tools=[tool_get_nearby_hospitals],
        instruction="""You are a Medical Agent. 
        Your job is to assist with medical help. Provide first-aid instructions, triage guides, CPR steps, and use the tool_get_nearby_hospitals tool to locate hospital beds, blood banks, or ambulance numbers.""",
        description="Provides emergency medical instructions and lists available hospitals/beds."
    )

    # 4. Resource Agent
    resource_agent = Agent(
        name="resource_agent",
        model=Gemini(model="gemini-flash-latest"),
        tools=[tool_get_nearby_shelters, tool_get_active_incidents],
        instruction="""You are a Resource Agent. 
        Your job is to locate shelters, food distribution centers, relief camps, and active hazards. 
        Use tool_get_nearby_shelters to search for safe assembly points or relief camps, and tool_get_active_incidents to see active hazards.""",
        description="Discovers active incidents and open shelters/relief camps."
    )

    # 5. Communication Agent
    communication_agent = Agent(
        name="communication_agent",
        model=Gemini(model="gemini-flash-latest"),
        tools=[tool_log_sos_alert],
        instruction="""You are a Communication Agent. 
        Your job is to broadcast emergency alerts, register citizen SOS notifications, and coordinate help. 
        Use tool_log_sos_alert to dispatch alerts to responders.""",
        description="Manages citizen SOS alerts and response notifications."
    )

    # 6. Preparedness Agent
    preparedness_agent = Agent(
        name="preparedness_agent",
        model=Gemini(model="gemini-flash-latest"),
        tools=[tool_get_preparedness_checklist],
        instruction="""You are a Preparedness Agent. 
        Your job is to help citizens prepare before a disaster strikes. 
        Use tool_get_preparedness_checklist to fetch lists of essential items (food, water, flashlights) and custom survival actions.""",
        description="Generates emergency readiness checklists and survival plans."
    )

    # 7. Risk Prediction Agent
    risk_prediction_agent = Agent(
        name="risk_prediction_agent",
        model=Gemini(model="gemini-flash-latest"),
        tools=[tool_get_weather_info],
        instruction="""You are a Risk Prediction Agent. 
        Your job is to analyze weather conditions and assess local safety hazards. 
        Always call tool_get_weather_info to get the real-time weather, temperature, chance of rain, and risk details for the location requested.
        Explain the current weather state, EOC alert level, and provide clear, wise, actionable safety advice for citizens (e.g. avoiding waterlogged fields, reservoirs, or hill slopes if there is heavy rain).""",
        description="Analyzes weather conditions and localized disaster risks."
    )

    # Root Coordinator Agent
    root_agent = Agent(
        name="root_agent",
        model=Gemini(model="gemini-flash-latest"),
        sub_agents=[
            classification_agent,
            routing_agent,
            medical_agent,
            resource_agent,
            communication_agent,
            preparedness_agent,
            risk_prediction_agent
        ],
        instruction="""You are the ResQu AI Lead Emergency Coordinator. 
        Your role is to understand the user's situation and delegate to the appropriate specialized agent:
        - Delegate to classification_agent for classifying a disaster situation.
        - Delegate to routing_agent to find safe evacuation routes or roads.
        - Delegate to medical_agent for injuries, hospital bed search, first aid, or ambulances.
        - Delegate to resource_agent to discover shelters, relief camps, food distribution, or active hazards.
        - Delegate to communication_agent to log a critical SOS alert.
        - Delegate to preparedness_agent to get checklists (flood kit, earthquake kit) or disaster readiness planning.
        - Delegate to risk_prediction_agent for weather inquiries, rain forecast, flood risk prediction, temperature, or safety concerns related to weather in any location.
        Always guide the user professionally and remain calm.""",
    )
else:
    # Programmatic Mock Fallback Agent when no Gemini API keys are configured
    class MockEmergencyAgent(BaseAgent):
        async def _run_async_impl(self, ctx: InvocationContext) -> AsyncGenerator[Event, None]:
            # Inspect user message history
            user_text = ""
            for event in reversed(ctx.session.events):
                if event.content and event.content.parts:
                    for part in event.content.parts:
                        if part.text:
                            user_text = part.text
                            break
                if user_text:
                    break
            
            user_text_lower = user_text.lower()
            response_text = ""
            active_sub_agent = "Root Coordinator Agent"
            
            # Simple keyword routing matching the multi-agent design
            if any(k in user_text_lower for k in ["shelter", "camp", "food", "assembly", "safe point"]):
                active_sub_agent = "Resource Agent"
                shelter_list = get_nearby_shelters()
                response_text = "### 🏠 Nearby Shelters & Relief Camps\n"
                response_text += "Here are the active shelters found in the database:\n\n"
                for s in shelter_list:
                    pet_icon = "🐾 Pet Friendly" if s["pet_friendly"] else "❌ No Pets"
                    med_icon = "🏥 Medical Support Available" if s["medical_support"] else "❌ No Medical Staff"
                    response_text += f"- **{s['name']}** ({s['type'].title()})\n"
                    response_text += f"  - *Address:* {s['address']}\n"
                    response_text += f"  - *Capacity:* {s['occupancy']}/{s['capacity']} occupied ({s['available_space']} spaces available)\n"
                    response_text += f"  - *Services:* {pet_icon} | {med_icon}\n"
                    response_text += f"  - *Contact:* {s['contact_number']}\n\n"
                response_text += "*Discovered via Resource Agent using SQLite Database query.*"
                
            elif any(k in user_text_lower for k in ["hospital", "medical", "ambulance", "doctor", "blood", "cpr", "first aid"]):
                active_sub_agent = "Medical Agent"
                if "cpr" in user_text_lower:
                    response_text = """### 🏥 CPR First-Aid Instructions:
1. **Call Emergency Services (911 / Local Helpline) immediately.**
2. **Push Hard and Fast**: Place hands in the center of the chest and push 2 inches deep at 100 to 120 compressions per minute.
3. **Rescue Breaths**: If trained, give 2 rescue breaths after every 30 compressions.
4. **AED**: Use an Automated External Defibrillator as soon as it is available.
"""
                elif "first aid" in user_text_lower:
                    response_text = """### 🩹 Basic First Aid Instructions:
- **Bleeding**: Apply direct pressure with a clean cloth. Elevate the wound above the heart if possible.
- **Burns**: Run cool water over the burn for 10-20 minutes. Do not apply ice, butter, or ointments. Cover with clean plastic wrap.
- **Fractures**: Keep the limb still. Do not try to realign the bone. Support with a splint.
"""
                else:
                    hosp_list = get_nearby_hospitals()
                    response_text = "### 🏥 Emergency Medical Help & Hospital Availability\n"
                    response_text += "Here are nearby hospitals with live bed counts:\n\n"
                    for h in hosp_list:
                        response_text += f"- **{h['name']}**\n"
                        response_text += f"  - *Address:* {h['address']}\n"
                        response_text += f"  - *Available Beds:* **{h['available_beds']}** / {h['total_beds']} beds\n"
                        response_text += f"  - *Blood Inventory:* {', '.join(h['blood_types_available'])}\n"
                        response_text += f"  - *Ambulance Dispatch:* {', '.join(h['ambulance_contacts'])}\n"
                        response_text += f"  - *Contact:* {h['contact_number']}\n\n"
                    response_text += "*Discovered via Medical Agent using SQLite Database query.*"
                    
            elif any(k in user_text_lower for k in ["route", "safe path", "evacuate", "block", "road"]):
                active_sub_agent = "Routing Agent"
                # Parse mock locations or use Dadar West as default start and Bandra Shelter as end
                route_res = get_safe_route(19.0178, 72.8478, 19.0540, 72.8400)
                response_text = "### 🧭 Evacuation Route Navigator\n"
                response_text += f"**Route Status**: {route_res['status'].upper()}\n"
                response_text += f"**Start Coordinates**: {route_res['start']} (Dadar West)\n"
                response_text += f"**Destination**: {route_res['destination']} (Bandra Relief Shelter)\n"
                response_text += f"**Evacuation Path Coordinates**:\n"
                for coord in route_res['path']:
                    response_text += f"  - `Lat: {coord[0]}, Lng: {coord[1]}`\n"
                response_text += f"\n*Safety Note*: {route_res['note']}\n\n"
                response_text += "*Calculated via Routing Agent bypassing active hazard zones.*"
                
            elif any(k in user_text_lower for k in ["sos", "alert", "emergency", "trapped", "danger"]):
                active_sub_agent = "Communication Agent"
                # Register a mock SOS alert for the session in Mumbai
                alert_res = log_sos_alert("Citizen Chat User", "+91 91111 00000", 19.0300, 72.8500, f"SOS reported via chatbot: {user_text}")
                response_text = f"### 🚨 CRITICAL SOS DISPATCHED\n"
                response_text += f"**Status**: **{alert_res['status'].upper()}**\n"
                response_text += f"Your emergency alert has been logged into the ResQu AI database and broadcast to emergency responders.\n\n"
                response_text += f"- **SOS Ticket ID**: #{alert_res['id']}\n"
                response_text += f"- **Distress Coordinates**: Lat {alert_res['latitude']}, Lng {alert_res['longitude']}\n"
                response_text += f"- **Reported Situation**: {alert_res['situation']}\n"
                response_text += f"- **Time Logged**: {alert_res['reported_at']}\n\n"
                response_text += "⚠️ **STAY CALM. Emergency services are being coordinated to your last known location.**"
                
            elif any(k in user_text_lower for k in ["checklist", "kit", "preparedness", "prep", "pack"]):
                active_sub_agent = "Preparedness Agent"
                disaster = "general"
                if "flood" in user_text_lower:
                    disaster = "flood"
                elif "earthquake" in user_text_lower:
                    disaster = "earthquake"
                elif "cyclone" in user_text_lower or "hurricane" in user_text_lower:
                    disaster = "cyclone"
                elif "fire" in user_text_lower:
                    disaster = "fire"
                    
                check_res = get_preparedness_checklist(disaster)
                response_text = f"### 🎒 Tailored Preparedness Plan: {check_res['title']}\n"
                response_text += "#### Essential Emergency Supplies Checklist:\n"
                for item in check_res['essential_supplies']:
                    response_text += f"- [ ] {item}\n"
                response_text += "\n#### Immediate Critical Actions:\n"
                for action in check_res['critical_actions']:
                    response_text += f"- {action}\n"
                response_text += f"\n*Generated via Preparedness Agent for {check_res['disaster'].upper()} scenarios.*"
                
            elif any(k in user_text_lower for k in ["weather", "rain", "forecast", "precipitation", "monsoon", "climate", "temp"]):
                active_sub_agent = "Risk Prediction Agent"
                # Simple parser for location from user text
                location = "Mumbai"
                if "in " in user_text_lower:
                    parts = user_text.split("in ")
                    if len(parts) > 1:
                        location = parts[1].strip("?.! ")
                elif "at " in user_text_lower:
                    parts = user_text.split("at ")
                    if len(parts) > 1:
                        location = parts[1].strip("?.! ")
                elif "for " in user_text_lower:
                    parts = user_text.split("for ")
                    if len(parts) > 1:
                        location = parts[1].strip("?.! ")
                elif "ramtek" in user_text_lower:
                    location = "Ramtek, Nagpur"
                elif "nagpur" in user_text_lower:
                    location = "Nagpur"
                elif "mumbai" in user_text_lower:
                    location = "Mumbai"
                
                weather_res = get_weather_info(location)
                response_text = f"### 🌧️ Meteorological & Safety Risk Report: {weather_res['location']}\n"
                response_text += f"- **Current Condition**: {weather_res['condition']} ({weather_res['temperature_c']}°C)\n"
                response_text += f"- **Humidity / Wind**: {weather_res['humidity']} | {weather_res['wind_speed_kmph']}\n"
                response_text += f"- **Rainfall Probability**: **{weather_res['rainfall_chance']}** (Precipitation: {weather_res['precipitation_mm']})\n"
                response_text += f"- **EOC Alert Status**: ⚠️ **{weather_res['alert_status']}**\n"
                response_text += f"- **Safety Risk Level**: **{weather_res['risk_level']}**\n\n"
                response_text += f"#### 🛡️ EOC Safety Assessment & Guidelines:\n"
                
                risk_lvl = weather_res['risk_level'].lower()
                if "high" in risk_lvl or "critical" in risk_lvl or "red" in weather_res['alert_status'].lower() or "orange" in weather_res['alert_status'].lower():
                    if "ramtek" in location.lower():
                        response_text += "1. **Landslide Warning**: High risk of soil instability and minor landslides around **Ramtek Gad Mandir** hill slopes. Avoid visiting high slopes or trekking routes.\n"
                        response_text += "2. **Reservoir Alert**: Stay away from water reservoirs and river bodies (Khindsi Lake) due to rapid catchment runoff.\n"
                        response_text += "3. **Agricultural Safety**: Farmers should secure livestock and avoid low-lying waterlogged fields.\n"
                        response_text += "4. **Helpline**: Keep emergency services (112) active. Keep phones charged and emergency kits ready.\n"
                    elif "mumbai" in location.lower():
                        response_text += "1. **Tidal Surge Danger**: Avoid coastal regions (Marine Drive, Juhu, Gateway of India) due to high-tide (4.5m) risk.\n"
                        response_text += "2. **Subway Inundation**: Avoid subways (Milan, Khar, Andheri) and low-lying transit corridors.\n"
                        response_text += "3. **Stay Indoors**: Citizens are strongly advised to remain in secure structures. Avoid travel unless critical.\n"
                        response_text += "4. **Contacts**: For rescue or evacuation assistance, dial BMC Disaster Cell at 1916 or National Hotline 112.\n"
                    else:
                        response_text += f"1. **Severe Weather Action**: Heavy precipitation detected. Seek shelter in high-ground concrete structures immediately.\n"
                        response_text += "2. **Evacuation Readiness**: Monitor local emergency channels and prepare a family go-bag.\n"
                        response_text += "3. **Transit Warning**: Roads may be flooded or blocked. Do not attempt to cross flooded roadways.\n"
                        response_text += "4. **Emergency Contact**: Keep local rescue helpline numbers active and stay in communication.\n"
                else:
                    response_text += "1. **Standard Operations**: No active weather warning. Normal safety precautions apply.\n"
                    response_text += "2. **Outdoor Travel**: Safe for travel, but remain alert for local convective shower updates.\n"
                    response_text += "3. **Water Safety**: Exercise standard caution when near rivers, beaches, or reservoirs.\n"
                
                response_text += f"\n*Real-time meteorological and risk prediction data compiled via EOC Risk Prediction Agent.*"

            elif any(k in user_text_lower for k in ["missing", "find person", "lost"]):
                active_sub_agent = "Resource Agent"
                response_text = "### 🔍 Missing Persons Board & Status\n"
                response_text += "Here are the active reports in the database:\n\n"
                # Simulate loading from SQLite
                from .database import SessionLocal, MissingPerson as DBMP
                db = SessionLocal()
                mps = db.query(DBMP).all()
                for m in mps:
                    response_text += f"- **{m.name}** (Age {m.age})\n"
                    response_text += f"  - *Last Seen:* {m.last_seen_location} ({m.last_seen_date})\n"
                    response_text += f"  - *Description:* {m.description}\n"
                    response_text += f"  - *Status:* **{m.status.upper()}**\n"
                    response_text += f"  - *Contact:* {m.contact_info}\n\n"
                db.close()
                response_text += "You can report a missing person using the Report Missing Person form."
                
            elif any(k in user_text_lower for k in ["volunteer", "register volunteer"]):
                active_sub_agent = "Resource Agent"
                response_text = "### 🤝 Volunteer Coordination Board\n"
                response_text += "Volunteers are critical for emergency operations. Current matching tasks include:\n"
                response_text += "1. **Medical Triage Assistance** - Requires First Aid / CPR skills (Dadar Relief Camp)\n"
                response_text += "2. **Evacuation Assistance** - Requires physical fitness & vehicle clearance (Bandra West)\n"
                response_text += "3. **Food and Supply Dispatch** - Ghatkopar Safety Assembly Point logistics\n\n"
                response_text += "Please use the Volunteer Registration Form to join the response team."
                
            else:
                response_text = """### 🛡️ ResQu AI Operations Coordinator
Welcome to the emergency operations assistant. I can coordinate resource discovery and response:
- Ask **"Where is the nearest shelter?"** to find open relief camps or food distribution.
- Ask **"Which hospitals have available beds?"** or ask for **"first aid instructions"**.
- Ask **"What is the safest route?"** to find an evacuation route avoiding hazard areas.
- Ask **"What should I pack for a flood?"** to generate an emergency checklist.
- Type **"SOS Emergency"** to log a distress ticket with your location.
"""
            
            # Format the output with the EOC active sub-agent metadata
            final_output = f"**[EOC Active Agent: {active_sub_agent}]**\n\n"
            final_output += response_text
            
            yield Event(
                author=self.name,
                content=types.Content(role='model', parts=[types.Part.from_text(text=final_output)])
            )

    root_agent = MockEmergencyAgent(name="root_agent")

app = App(
    root_agent=root_agent,
    name="app",
)
