import datetime
import json
from .database import SessionLocal, init_db, Shelter, Hospital, Incident, Volunteer, MissingPerson, Route, SosAlert

def seed_data():
    db = SessionLocal()
    
    # Clear existing data to allow re-seeding
    db.query(Shelter).delete()
    db.query(Hospital).delete()
    db.query(Incident).delete()
    db.query(Volunteer).delete()
    db.query(MissingPerson).delete()
    db.query(Route).delete()
    db.query(SosAlert).delete()
    db.commit()

    # Seed Shelters (Mumbai-based)
    shelters = [
        Shelter(
            name="Dadar Community Hall Relief Camp",
            type="relief camp",
            latitude=19.0190,
            longitude=72.8430,
            address="Swami Vivekananda Rd, Dadar West, Mumbai, MH 400028",
            capacity=600,
            occupancy=280,
            medical_support=True,
            pet_friendly=True,
            contact_number="022-2430-1101"
        ),
        Shelter(
            name="Bandra Reclamation Assembly Point",
            type="assembly point",
            latitude=19.0520,
            longitude=72.8320,
            address="KC Marg, Bandra Reclamation, Bandra West, Mumbai, MH 400050",
            capacity=400,
            occupancy=35,
            medical_support=True,
            pet_friendly=False,
            contact_number="022-2640-1102"
        ),
        Shelter(
            name="Sion Koliwada Food Center",
            type="food center",
            latitude=19.0395,
            longitude=72.8625,
            address="GTB Nagar, Sion East, Mumbai, MH 400037",
            capacity=300,
            occupancy=120,
            medical_support=False,
            pet_friendly=True,
            contact_number="022-2401-1103"
        ),
        Shelter(
            name="Andheri Sports Complex Shelter",
            type="shelter",
            latitude=19.1310,
            longitude=72.8360,
            address="Veera Desai Rd, Andheri West, Mumbai, MH 400053",
            capacity=1000,
            occupancy=450,
            medical_support=True,
            pet_friendly=True,
            contact_number="022-2623-1104"
        )
    ]
    db.add_all(shelters)

    # Seed Hospitals (Mumbai-based)
    hospitals = [
        Hospital(
            name="KEM Hospital & Research Center (Parel)",
            latitude=19.0025,
            longitude=72.8420,
            address="Acharya Donde Marg, Parel, Mumbai, MH 400012",
            total_beds=600,
            available_beds=110,
            blood_types_available="A+, B+, O+, AB+, O-, A-",
            ambulance_contacts="102, 022-2410-7000",
            contact_number="022-2410-7000"
        ),
        Hospital(
            name="Lilavati Hospital & Research Centre (Bandra)",
            latitude=19.0510,
            longitude=72.8270,
            address="A3, Bandra Reclamation Rd, Bandra West, Mumbai, MH 400050",
            total_beds=350,
            available_beds=24,
            blood_types_available="O-, A-, B-, AB-",
            ambulance_contacts="108, 022-2675-1000",
            contact_number="022-2675-1000"
        ),
        Hospital(
            name="Sion Hospital (LTMG General Hospital)",
            latitude=19.0370,
            longitude=72.8600,
            address="Sion West, Sion, Mumbai, MH 400022",
            total_beds=500,
            available_beds=48,
            blood_types_available="A+, B+, O+, AB+",
            ambulance_contacts="102, 022-2407-6381",
            contact_number="022-2407-6381"
        )
    ]
    db.add_all(hospitals)

    # Seed Incidents (Mumbai-based)
    now = datetime.datetime.utcnow()
    incidents = [
        Incident(
            title="Dadar West Hindmata Waterlogging",
            description="Heavy monsoon rain caused severe waterlogging at Hindmata junction. Water level is 3-4 feet. Evacuations in progress.",
            type="flood",
            latitude=19.0178,
            longitude=72.8478,
            status="active",
            severity="high",
            reported_at=now - datetime.timedelta(hours=4)
        ),
        Incident(
            title="Bandra West Linking Road Commercial Fire",
            description="Massive structural fire in shopping plaza on Linking Road. 6 fire engines and police on site. Linked corridors cordoned off.",
            type="fire",
            latitude=19.0596,
            longitude=72.8295,
            status="active",
            severity="critical",
            reported_at=now - datetime.timedelta(hours=2)
        ),
        Incident(
            title="Ghatkopar Hills Slum Landslide",
            description="Heavy downpour triggered a landslide in Ghatkopar West hills. NDRF and BMC Disaster Response Team deployed.",
            type="landslide",
            latitude=19.0860,
            longitude=72.9080,
            status="active",
            severity="critical",
            reported_at=now - datetime.timedelta(hours=5)
        ),
        Incident(
            title="Western Express Highway Multi-Vehicle Pileup",
            description="6-car pileup near Andheri Flyover due to oil spill and low visibility. Traffic police conducting bypass clearance.",
            type="accident",
            latitude=19.1155,
            longitude=72.8566,
            status="monitoring",
            severity="medium",
            reported_at=now - datetime.timedelta(minutes=45)
        )
    ]
    db.add_all(incidents)

    # Seed Volunteers (Mumbai-based)
    volunteers = [
        Volunteer(
            name="Aarav Mehta",
            skills="First Aid, CPR, Triage, Medical Support",
            location="Dadar West, Mumbai",
            contact_number="+91 98200 12345",
            status="deployed",
            assigned_task="First Aid at Dadar Community Hall Relief Camp"
        ),
        Volunteer(
            name="Priya Sharma",
            skills="Search & Rescue, Physical Evacuation, Swimming, Boat Rescue",
            location="Bandra West, Mumbai",
            contact_number="+91 98199 54321",
            status="available",
            assigned_task="None"
        ),
        Volunteer(
            name="Rajesh Patil",
            skills="Logistics, Food Distribution, Marathi Translation",
            location="Ghatkopar West, Mumbai",
            contact_number="+91 97690 98765",
            status="available",
            assigned_task="None"
        ),
        Volunteer(
            name="Ananya Iyer",
            skills="Crisis Counseling, Social Work, Marathi Translation",
            location="Sion, Mumbai",
            contact_number="+91 98333 44556",
            status="deployed",
            assigned_task="Translation services at Sion Koliwada Food Center"
        )
    ]
    db.add_all(volunteers)

    # Seed Missing Persons (Mumbai-based)
    missing_persons = [
        MissingPerson(
            name="Vikram Malhotra",
            age=29,
            last_seen_location="Linking Road commercial complex, Bandra West",
            last_seen_date="June 21, 2026, 4:30 PM",
            description="Wearing black raincoat, blue jeans, grey sneakers. 5'10\" tall, athletic build.",
            photo_url="/placeholder_person_1.jpg",
            contact_info="Family contact: +91 98210 22334",
            status="missing",
            reported_at=now - datetime.timedelta(hours=6)
        ),
        MissingPerson(
            name="Sunita Deshmukh",
            age=65,
            last_seen_location="Hindmata Junction, Dadar",
            last_seen_date="June 21, 2026, 11:00 AM",
            description="Wearing green saree, holding black umbrella. Speaks Marathi. Uses a walking cane.",
            photo_url="/placeholder_person_2.jpg",
            contact_info="Emergency contact: +91 98330 67890",
            status="reunified",
            reported_at=now - datetime.timedelta(hours=8)
        )
    ]
    db.add_all(missing_persons)

    # Seed SOS Alerts (Mumbai-based)
    sos_alerts = [
        SosAlert(
            sender_name="Kabir Shah",
            sender_phone="+91 98205 11223",
            latitude=19.0185,
            longitude=72.8455,
            situation="Water level rising up to ground floor. Senior citizens inside. Need emergency rescue boat.",
            status="pending",
            reported_at=now - datetime.timedelta(minutes=30)
        ),
        SosAlert(
            sender_name="Meera Sen",
            sender_phone="+91 98190 33445",
            latitude=19.0580,
            longitude=72.8310,
            situation="Thick smoke entering office on 3rd floor. Exit staircase blocked by fire. Need urgent assistance.",
            status="dispatched",
            reported_at=now - datetime.timedelta(minutes=10)
        )
    ]
    db.add_all(sos_alerts)

    # Seed Routes (Mumbai-based)
    routes = [
        Route(
            name="Dadar to Bandra Evacuation Route",
            start_lat=19.0178,
            start_lng=72.8478,
            end_lat=19.0540,
            end_lng=72.8400,
            state="safe",
            path_coordinates=json.dumps([
                [19.0178, 72.8478],
                [19.0280, 72.8450],
                [19.0380, 72.8410],
                [19.0540, 72.8400]
            ])
        ),
        Route(
            name="Ghatkopar Landslide Bypass (BLOCKED)",
            start_lat=19.0860,
            start_lng=72.9080,
            end_lat=19.0370,
            end_lng=72.8600,
            state="blocked",
            path_coordinates=json.dumps([
                [19.0860, 72.9080],
                [19.0750, 72.8950],
                [19.0600, 72.8800],
                [19.0370, 72.8600]
            ])
        ),
        Route(
            name="Western Express Highway Escape Corridor",
            start_lat=19.1155,
            start_lng=72.8566,
            end_lat=19.1310,
            end_lng=72.8360,
            state="safe",
            path_coordinates=json.dumps([
                [19.1155, 72.8566],
                [19.1220, 72.8500],
                [19.1280, 72.8410],
                [19.1310, 72.8360]
            ])
        )
    ]
    db.add_all(routes)
    
    db.commit()
    db.close()
    print("Database seeded successfully with Mumbai disaster relief operations details.")

if __name__ == "__main__":
    init_db()
    seed_data()
