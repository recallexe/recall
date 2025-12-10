use anyhow::Result;
use chrono::Utc;
use rand::Rng;
use rusqlite::Connection;
use std::env;

const CHARSET: &[u8] = b"ACDEFHJKLMNPQRTUVWXY0123456789";

fn generate_id() -> String {
    let mut rng = rand::rng();
    (0..8)
        .map(|_| {
            let idx = rng.random_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}

fn main() -> Result<()> {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: cargo run --bin populate_data -- <user_id>");
        eprintln!("Example: cargo run --bin populate_data -- USER123");
        std::process::exit(1);
    }

    let user_id = &args[1];
    let db_path = std::env::current_dir()?.join("recall.db");

    if !db_path.exists() {
        eprintln!("Error: Database file not found at {:?}", db_path);
        eprintln!("Make sure you're running this from the src-tauri directory");
        std::process::exit(1);
    }

    let conn = Connection::open(&db_path)?;

    // Verify user exists
    let user_exists: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM users WHERE id = ?1)",
        rusqlite::params![user_id],
        |row| row.get(0),
    )?;

    if !user_exists {
        eprintln!("Error: User with id '{}' not found in database", user_id);
        std::process::exit(1);
    }

    println!("Populating fake data for user: {}", user_id);
    println!("Database: {:?}", db_path);

    let now = Utc::now().timestamp();
    let mut rng = rand::rng();

    // Sample data arrays
    let area_names = vec![
        "Personal", "Work", "School", "Health", "Finance", "Learning", "Hobbies", "Family",
    ];
    let project_titles = vec![
        "Website Redesign",
        "Mobile App Development",
        "Research Paper",
        "Marketing Campaign",
        "Product Launch",
        "Team Training",
        "Budget Planning",
        "Fitness Program",
        "Language Learning",
        "Home Renovation",
        "Book Writing",
        "Course Development",
    ];
    let project_descriptions = vec![
        "Complete redesign of the company website",
        "Build a mobile app for iOS and Android",
        "Write research paper on machine learning",
        "Launch new marketing campaign for Q4",
        "Prepare for product launch event",
        "Organize team training sessions",
        "Create annual budget plan",
        "Start new fitness routine",
        "Learn Spanish in 6 months",
        "Renovate kitchen and bathroom",
        "Write a novel about time travel",
        "Develop online course curriculum",
    ];
    let resource_names = vec![
        "Design Mockups",
        "Research Notes",
        "Meeting Minutes",
        "Budget Spreadsheet",
        "Project Plan",
        "Code Documentation",
        "User Stories",
        "Test Cases",
        "API Documentation",
        "Presentation Slides",
        "Video Tutorial",
        "Reference Material",
    ];
    let event_titles = vec![
        "Team Meeting",
        "Client Presentation",
        "Doctor Appointment",
        "Gym Session",
        "Lunch with Colleagues",
        "Project Review",
        "Workshop",
        "Conference Call",
        "Birthday Party",
        "Dentist Appointment",
        "Interview",
        "Networking Event",
    ];
    let locations = vec![
        "Office",
        "Home",
        "Coffee Shop",
        "Conference Room",
        "Gym",
        "Restaurant",
        "Online",
        "Park",
        "Library",
        "Studio",
        "Hotel",
        "Campus",
    ];

    let statuses = vec!["Inbox", "Planned", "Progress", "Done"];
    let priorities = vec!["High", "Medium", "Low"];

    // Create Areas
    println!("\nCreating areas...");
    let mut area_ids = Vec::new();
    for name in area_names.iter().take(5) {
        let area_id = generate_id();
        let created_at = now - rng.random_range(30..90) * 24 * 3600; // 30-90 days ago
        let updated_at = created_at + rng.random_range(0..30) * 24 * 3600;

        conn.execute(
            "INSERT INTO areas (id, user_id, name, image_url, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            rusqlite::params![area_id, user_id, name, None::<String>, created_at, updated_at],
        )?;
        area_ids.push(area_id);
        println!("  ✓ Created area: {}", name);
    }

    // Create Projects
    println!("\nCreating projects...");
    let mut project_ids = Vec::new();
    for i in 0..10 {
        let project_id = generate_id();
        let area_id = &area_ids[rng.random_range(0..area_ids.len())];
        let title = project_titles[i % project_titles.len()];
        let description = project_descriptions[i % project_descriptions.len()];
        let status = statuses[rng.random_range(0..statuses.len())];
        let priority = if rng.random_bool(0.7) {
            Some(priorities[rng.random_range(0..priorities.len())])
        } else {
            None
        };

        let start_date = now - rng.random_range(0..60) * 24 * 3600;
        let end_date = if rng.random_bool(0.6) {
            Some(start_date + rng.random_range(7..90) * 24 * 3600)
        } else {
            None
        };

        let created_at = start_date - rng.random_range(0..30) * 24 * 3600;
        let updated_at = created_at + rng.random_range(0..30) * 24 * 3600;

        conn.execute(
            "INSERT INTO projects (id, user_id, area_id, title, description, status, priority, start_date, end_date, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            rusqlite::params![project_id, user_id, area_id, title, description, status, priority, start_date, end_date, created_at, updated_at],
        )?;
        project_ids.push(project_id);
        println!("  ✓ Created project: {} ({})", title, status);
    }

    // Create Resources
    println!("\nCreating resources...");
    for i in 0..15 {
        let resource_id = generate_id();
        let project_id = &project_ids[rng.random_range(0..project_ids.len())];
        let name = resource_names[i % resource_names.len()];

        // Mix of text and file resources
        let (content, file_data, file_type, file_size) = if rng.random_bool(0.6) {
            // Text resource
            (
                Some(format!(
                    "This is sample content for {}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                    name
                )),
                None::<String>,
                None::<String>,
                None::<i64>,
            )
        } else {
            // File resource (simulated)
            (
                None::<String>,
                Some("base64encodedfiledata".to_string()),
                Some("application/pdf".to_string()),
                Some(rng.random_range(1000..5000000)),
            )
        };

        let created_at = now - rng.random_range(0..60) * 24 * 3600;
        let updated_at = created_at + rng.random_range(0..30) * 24 * 3600;

        conn.execute(
            "INSERT INTO resources (id, user_id, project_id, name, content, file_data, file_type, file_size, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            rusqlite::params![resource_id, user_id, project_id, name, content, file_data, file_type, file_size, created_at, updated_at],
        )?;
        println!("  ✓ Created resource: {}", name);
    }

    // Create Events
    println!("\nCreating events...");
    for i in 0..20 {
        let event_id = generate_id();
        let title = event_titles[i % event_titles.len()];
        let description = if rng.random_bool(0.5) {
            Some(format!("Description for {}", title))
        } else {
            None
        };

        let project_id = if rng.random_bool(0.4) {
            Some(project_ids[rng.random_range(0..project_ids.len())].clone())
        } else {
            None
        };

        let all_day = rng.random_bool(0.3);

        // Generate start time (some in past, some in future)
        let days_offset = rng.random_range(-30..60); // -30 to +60 days
        let start_time = now + days_offset * 24 * 3600;

        let (start_time, end_time) = if all_day {
            // All-day event
            let start = start_time;
            let end = if rng.random_bool(0.3) {
                Some(start + rng.random_range(1..3) * 24 * 3600) // Multi-day event
            } else {
                None
            };
            (start, end)
        } else {
            // Timed event
            let hour = rng.random_range(9..18);
            let minute = rng.random_range(0..4) * 15; // 0, 15, 30, 45
            let start = start_time + hour * 3600 + minute * 60;
            let duration = rng.random_range(1..4) * 3600; // 1-4 hours
            (start, Some(start + duration))
        };

        let location = if rng.random_bool(0.5) {
            Some(locations[rng.random_range(0..locations.len())].to_string())
        } else {
            None
        };

        let created_at = start_time - rng.random_range(0..7) * 24 * 3600;
        let updated_at = created_at;

        conn.execute(
            "INSERT INTO events (id, user_id, project_id, title, description, start_time, end_time, location, all_day, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            rusqlite::params![event_id, user_id, project_id, title, description, start_time, end_time, location, if all_day { 1 } else { 0 }, created_at, updated_at],
        )?;
        println!(
            "  ✓ Created event: {} ({})",
            title,
            if all_day { "all-day" } else { "timed" }
        );
    }

    println!("\n✅ Successfully populated fake data!");
    println!("   - {} areas", area_ids.len());
    println!("   - {} projects", project_ids.len());
    println!("   - 15 resources");
    println!("   - 20 events");

    Ok(())
}
