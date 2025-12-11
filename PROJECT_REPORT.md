# Project Report: Recall - Personal Knowledge Base

## 1. Project Task Selection

The team selected **Recall**, a personal knowledge base application for organizing work, projects, tasks, and resources in a unified desktop application. Key factors in this selection:

1. **Practical Utility**: Addresses a real need for personal organization and knowledge management.

2. **Technical Diversity**: Required learning multiple technologies across the full stack.

3. **Scope Manageability**: Well-defined scope with flexibility for iterative development.

4. **Local-First Architecture**: Local data storage and privacy aligned with data sovereignty concerns.

In retrospect, the team would still select this task. The project provided good opportunities to work with modern technologies while building something practical. The complexity fit the timeline, and the modular architecture supported incremental development.

## 2. User Stories

### Milestone 2 User Stories

The team implemented the following user stories for Milestone 2:

1. **Successful User Login**
   - **Original Story**: "As a user, I want to log in with my username and password, so that I can access my dashboard and personal data."
   - **Refinement**: Added token-based authentication, session management, bcrypt password hashing, and error handling for invalid credentials.

2. **Unified Life Management**
   - **Original Story**: "As a student with a part time job, I want to be able to manage both areas of my life in a single app, So that I don't have to use many different platforms."
   - **Refinement**: Implemented via the Areas feature, enabling users to create separate contexts (Work, Personal, School) with associated projects and resources.

3. **Save Video Resources**
   - **Original Story**: "As a content creator, I want to be able to save good videos on the Resource page, So that I can come back and use those videos as sources of inspiration when I need them."
   - **Refinement**: Expanded to support text documents (TipTap editor) and file uploads (5MB limit), suitable for various resource types.

4. **New Note Metadata Menu**
   - **Original Story**: "As a user, I want to create notes with status (inbox, draft, final), project association, and description, so that I can organize and categorize my notes effectively."
   - **Refinement**: Notes feature structure was established but full implementation was deferred in favor of the Calendar and Event Management system.

### Additional User Story (Milestone 3)

1. **Calendar and Event Management**
   - **New Story**: "As a user, I want to create and manage events with dates, times, locations, and project associations, so that I can track my schedule and deadlines in one place."
   - **Implementation**: Complete calendar view with month navigation, event creation/editing/deletion, project associations, all-day event support, and integration with the dashboard for today's schedule.

### Story Refinement Process

We refined stories by clarifying acceptance criteria with specific technical requirements and edge cases. We also evaluated each story against our technology stack and timeline to make sure it was feasible. User experience was important to us, so we made sure workflows were intuitive and error handling was solid. Finally, we planned how each story would integrate with existing features.

## 3. Source Code Location and Modifications

### Repository Information

- **Repository**: <https://github.com/recallexe/recall> (branch: main)

### Major Files Modified and Added

#### Backend (Rust - `src-tauri/src/`)

**New Files:**

- `events.rs`: Complete event management API with CRUD operations (`create_event`, `get_events`, `get_event_by_id`, `update_event`, `delete_event`)
- `bin/populate_data.rs`: Utility script for populating test data

**Modified Files:**

- `lib.rs`: Added events module registration and command handlers
- `main.rs`: Added events schema to database initialization
- `areas.rs`: Enhanced with image URL auto-fetching support
- `resources.rs`: File size validation (5MB limit) enforcement

**SQL Schema Files (`src-tauri/sql/`):**

- `events.sql`: New schema for events table with proper foreign key relationships

#### Frontend (TypeScript/React - `src/`)

**New Files:**

- `app/dashboard/calendar/page.tsx`: Calendar month view with event display
- `app/dashboard/events/page.tsx`: Events list view with filtering
- `components/events/NewEventDialog.tsx`: Event creation/editing dialog
- `components/dashboard/Today'sSchedule.tsx`: Today's events component for dashboard
- `components/dashboard/RecentUpcoming.tsx`: Recent activity display component

**Modified Files:**

- `app/dashboard/page.tsx`: Enhanced with live data, colorful design, events count fetching, areas preview section with images, and enhanced Today's Schedule and Recent Activity cards
- `components/dashboard/Stat.tsx`: Added Events support and color-coded gradients
- `components/layout/AppSidebar.tsx`: Added dynamic event count badge
- `components/area/NewAreaDialog.tsx`: Added automatic image fetching from Picsum Photos API
- `components/projects/DatePicker.tsx`: Fixed default date and placeholder issues
- `components/ui/shadcn-io/editor/index.tsx`: Fixed controlled/uncontrolled input issue in EditorLinkSelector

### Summary of Modifications Since Milestone 2

**Calendar and Event Management System**: Full CRUD operations, calendar visualization, and dashboard integration. **Dashboard Enhancements**: Transformed from static to dynamic interface with live data, color-coded stat cards, areas preview, Today's Schedule, and Recent Activity components. **Automatic Image Fetching**: Picsum Photos API integration for areas when no URL provided. **Accessibility Improvements**: Toned down colors while maintaining visual appeal. **Bug Fixes**: Resolved controlled/uncontrolled input issues, date picker defaults, and hardcoded values.

## 4. Functions, Classes, and Design Elements

### Backend Architecture (Rust)

#### Core Traits and Utilities

**`HasId` Trait** (`lib.rs`): Defines interface for models with optional ID fields; used by all database models. `generate_id()` Function (`lib.rs`): Generates 8-character alphanumeric IDs using custom character set; called by `try_insert_thing()` for new records. `try_insert_thing()` Function (`lib.rs`): Generic function for inserting models with retry logic; handles UNIQUE constraint violations by regenerating IDs; used by all create operations. `get_user_id_from_token()` Function (`lib.rs`): Validates session tokens and retrieves user IDs; called by all authenticated endpoints; returns error if token is invalid or expired.

#### Event Management Module (`events.rs`)

**Structs:** `Event`, `CreateEventRequest`, `UpdateEventRequest`, `EventResponse`, `EventInfo` (with project names), `EventsListResponse`. **Functions:** `create_event()` (validates end_time > start_time), `get_events()` (date range/project filtering, joins with projects), `get_event_by_id()`, `update_event()`, `delete_event()`. **Relationships:** Events → Users (many-to-one, `user_id`), Events → Projects (many-to-one optional, `project_id`, ON DELETE SET NULL).

#### Area Management Module (`areas.rs`)

**Structs:** `Area` (core model), `CreateAreaRequest`, `UpdateAreaRequest`, `AreaResponse`, `AreaInfo`. **Functions:** `create_area()`, `get_areas()` (all areas for user), `get_area_by_id()`, `update_area()`, `delete_area()` (cascades to projects).

#### Project Management Module (`projects.rs`)

**Structs:** `Project` (core model with status, priority, dates), `CreateProjectRequest`, `UpdateProjectRequest`, `ProjectResponse`, `ProjectInfo`. **Functions:** `create_project()` (within areas), `get_projects()` (area filtering), `update_project()`, `delete_project()` (cascades to resources).

#### Resource Management Module (`resources.rs`)

**Structs:** `Resource` (core model), `CreateResourceRequest`, `UpdateResourceRequest`, `ResourceResponse`. **Functions:** `create_resource()` (5MB file size limit), `get_resources()` (project filtering), `update_resource()` (size validation), `delete_resource()`.

### Frontend Architecture (TypeScript/React)

#### Component Hierarchy

**Dashboard Components:**

- `Dashboard` (`app/dashboard/page.tsx`): Main dashboard container that calls `fetchCounts()` to load statistics, renders `Stat` components, `TodaysSchedule`, `RecentUpcoming`, and displays areas preview grid

- `Stat` (`components/dashboard/Stat.tsx`): Statistic card component (receives title, value, icon, url, onAddSuccess; renders color-coded cards with gradients; integrates with dialog components)

- `TodaysSchedule` (`components/dashboard/Today'sSchedule.tsx`): Today's events display that fetches events for current day via `get_events` Tauri command, filters to today's date, and displays events with time, location, project information

- `RecentUpcoming` (`components/dashboard/RecentUpcoming.tsx`): Recent activity display that fetches recent projects and resources, provides tabbed interface, and displays items with timestamps

**Event Management Components:**

- `Calendar` (`app/dashboard/calendar/page.tsx`): Month view calendar that fetches events and project deadlines, renders calendar grid with event indicators, provides month navigation, and links to event details

- `EventsList` (`app/dashboard/events/page.tsx`): Events list view that fetches all events with optional project filtering, groups events by date, provides create/edit/delete actions, and integrates with `NewEventDialog`

- `NewEventDialog` (`components/events/NewEventDialog.tsx`): Event creation/editing form with title, description, project, location, dates, times; validates end date >= start date; supports all-day events; calls `create_event` or `update_event` Tauri commands

**Area Management Components:**

- `NewAreaDialog` (`components/area/NewAreaDialog.tsx`): Area creation/editing
  - Auto-fetches images from Picsum Photos API when no URL provided
  - Calls `create_area` or `update_area` Tauri commands

#### Data Flow

**User Action** → React Component (e.g., `NewEventDialog`) → **Tauri Command** (e.g., `create_event`) → **Rust Function** (e.g., `create_event()`) → **SQLite Database** (via `rusqlite`) → **Response** (JSON serialization) → **Frontend** (State update → UI re-render)

#### Key Design Patterns

**Command Pattern**: All backend operations exposed as Tauri commands. **Repository Pattern**: Database operations encapsulated in module functions. **Component Composition**: Reusable UI components (Stat, Card, Dialog). **State Management**: React hooks (`useState`, `useEffect`, `useCallback`). **Error Handling**: Try-catch blocks with user-friendly error messages.

## 5. Sources of Additional Information

### Documentation and Official Resources

1. **Tauri Documentation** (<https://tauri.app/>): Primary resource for Tauri 2 API, command system, and best practices. Most helpful for understanding the command invocation system and state management.

2. **Next.js Documentation** (<https://nextjs.org/docs>): Essential for understanding App Router, server/client components, and routing patterns.

3. **React Documentation** (<https://react.dev/>): Critical for understanding hooks, component lifecycle, and controlled/uncontrolled components.

4. **Rust Book** (<https://doc.rust-lang.org/book/>): Fundamental resource for Rust language features, error handling, and ownership.

5. **SQLite Documentation** (<https://www.sqlite.org/docs.html>): Reference for SQL syntax and database design patterns.

6. **Shadcn UI Documentation** (<https://ui.shadcn.com/>): Component library documentation for UI components.

7. **TipTap Documentation** (<https://tiptap.dev/>): Rich text editor documentation for the resource editor feature.

### Community Resources

1. **Stack Overflow**: Helpful for specific error messages and edge cases.

2. **GitHub Issues**: Framework and library repositories provided insights into known issues and workarounds.

3. **Discord Communities**: Tauri Discord server for real-time help with Tauri-specific questions.

4. **Cursor Auto AI**: Cursor was helpful for bugs that were beyond GitHub issues, mostly related to configuration errors or dependency conflicts.

### Most Helpful Resources

The **Tauri Documentation** was the most helpful resource, providing comprehensive examples of command invocation, state management, and overall architecture. Framework documentation was also crucial for resolving component issues and understanding patterns.

## 6. Software Engineering Techniques

### Agile Development Practices

We developed features **iteratively**, starting with core functionality and adding enhancements. **User story-driven development** kept us focused on real user needs. We committed code **regularly** and tested throughout development. We **refactored** when patterns emerged, extracting common dialog patterns and standardizing API responses.

### Other Methodologies

We considered **test cases** when writing functions but didn't fully implement comprehensive unit testing due to time constraints. **Code reviews** were valuable for catching bugs and maintaining consistency. We organized code into **modules** (areas, projects, resources, events) with clear separation of concerns. We implemented **error handling** at both frontend and backend levels with user-friendly error messages.

### Techniques We Wish We Had Used

**Comprehensive unit testing** and **integration testing** would have caught bugs earlier and validated the full data flow. An **automated testing pipeline** with CI/CD would have caught issues before deployment. Better **code documentation** with more extensive inline comments would have improved maintainability. **Performance profiling** would have identified bottlenecks earlier, especially for database queries. **Automated accessibility testing** would have caught contrast and keyboard navigation issues earlier.

## 7. Technologies, Programming Techniques, and Libraries

### Technologies Learned

1. **Tauri 2**: Desktop application framework combining Rust backend with web frontend
   - Command system for frontend-backend communication
   - State management with `tauri::State`
   - File system access and native dialogs

2. **Next.js 15**: React framework with App Router
   - Server and client components
   - Routing with file-based system
   - API routes (though we used Tauri commands instead)

3. **React 19**: Latest React features
   - Hooks (`useState`, `useEffect`, `useCallback`, `useRef`)
   - Controlled vs uncontrolled components
   - Component composition patterns

4. **Rust**: Systems programming language
   - Ownership and borrowing
   - Error handling with `Result<T, E>`
   - Pattern matching
   - Traits and generics

5. **SQLite with rusqlite**: Embedded database
   - SQL schema design
   - Foreign key relationships
   - Connection pooling with r2d2

6. **TypeScript**: Type-safe JavaScript
   - Interface definitions
   - Type inference
   - Generic types

### Programming Techniques

**Async/Await**: Used extensively for Tauri command invocations and data fetching. **Error Propagation**: Rust's `?` operator and TypeScript try-catch blocks. **State Management**: React hooks for component state, Tauri state for shared backend state. **Database Transactions**: Used implicitly through rusqlite for data consistency. **Form Validation**: Client-side before API calls, server-side in Rust. **Date/Time Handling**: `date-fns` library for formatting and manipulation. **Image Processing**: Base64 encoding for file uploads, URL handling for display.

### Libraries and Dependencies

- **Backend (Rust):** `tauri` (desktop framework), `rusqlite` (SQLite driver), `r2d2` (connection pooling), `exemplar` (model validation), `serde` (serialization), `bcrypt` (password hashing), `chrono` (date/time), `rand` (ID generation), `anyhow` (error handling). 

- **Frontend (TypeScript/JavaScript):** `next` (React framework), `react` (UI library), `@tauri-apps/api` (Tauri API), `date-fns` (date manipulation), `lucide-react` (icons), `tailwindcss` (CSS), `@radix-ui/*` (UI primitives), `@tiptap/react` (rich text editor).

### Previous Experience That Was Useful

**Web Development Experience**: Accelerated UI implementation. **Database Design**: Prior SQL knowledge helped with schema design and query optimization. **API Design**: Informed the command structure. **Git Workflow**: Enabled smooth collaboration. **UI/UX Design**: Basic design principles helped create an intuitive interface.

## 8. Non-Technical Lessons and Advice

### Non-Technical Lessons Learned

**Communication was critical**. Regular team check-ins prevented us from doing duplicate work and kept everyone aligned on feature priorities.

We learned the hard way about **scope management**. Our initial feature list was too ambitious, and we had to cut things to meet deadlines. Learning to say "no" to features was tough but necessary.

**User experience matters** just as much as technical implementation. A feature that works perfectly but is confusing to use isn't really useful. We spent a lot of time making sure the UI was intuitive and accessible.

**Documentation saves time**. Well-documented code and clear commit messages made debugging and collaboration so much easier. When someone else had to work on your code, good documentation was a lifesaver.

**Incremental development** worked well for us. Building features incrementally and testing frequently caught issues early, which saved us a lot of debugging time later.

We also learned that **accessibility isn't optional**. Making the application accessible from the start was much easier than trying to retrofit it later.

**Error messages matter**. User-friendly error messages make a huge difference when something goes wrong. Technical error codes don't help users.

Finally, our **code review process** was really valuable. Regular reviews improved code quality and helped team members learn from each other.

### Advice for Future Teams

1. **Start with Architecture**: Spend time upfront designing the database schema and component structure. Changes later are more costly.

2. **Prioritize Core Features**: Focus on implementing core functionality well before adding non-essential features.

3. **Test Early and Often**: Do not wait until the end to test. Test each feature as it is implemented.

4. **Use Type Safety Strictly**: Enable strict mode and fix type errors immediately. They catch bugs before runtime.

5. **Document as You Go**: Write comments and documentation while the code is fresh in your mind, not at the end.

6. **Plan for Accessibility**: Consider accessibility from the beginning, not as an afterthought.

7. **Version Control Best Practices**: Write clear commit messages, use meaningful branch names, and review code before merging.

8. **Learn the Tools**: Invest time in learning the development tools thoroughly before starting implementation.

9. **User Testing**: Get feedback from potential users early, even if the feature is incomplete. It helps prioritize what matters.

10. **Maintain Work-Life Balance**: Avoid burnout by setting realistic deadlines and taking breaks. Sustainable development is more productive than crunch time.

11. **Error Handling from Day One**: Implement proper error handling from the start. It is significantly more difficult to add later.

12. **Keep Dependencies Updated**: Regularly update dependencies, but test thoroughly after updates to avoid breaking changes.

---

## Conclusion

The Recall project gave us valuable experience building a full-stack desktop application. Working with modern web technologies alongside systems programming was challenging but rewarding. Our iterative development process, guided by user stories, resulted in a functional application that actually addresses real organizational needs.

There are definitely areas for improvement: we wish we had done more testing, better documentation, and performance optimization. But overall, the project successfully demonstrates how to integrate multiple technologies and apply software engineering principles in a practical context. We're proud of what we built and learned a lot along the way.
