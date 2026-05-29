# Connect & Prep: Unified User-Flow Architecture

This diagram visualizes how the three core user roles (Student, Teacher, Parent) flow through the application interfaces (Web & Mobile), pass through Authentication, and query the synchronized Backend Services.

```mermaid
flowchart TD
    %% User Roles (Entry Points)
    subgraph Roles ["1. User Portals (Entry Points)"]
        Student["🎓 Student Portal"]
        Teacher["👨‍🏫 Teacher Portal"]
        Parent["👪 Parent Portal"]
    end

    %% Client Platforms
    subgraph Clients ["2. Client Platforms"]
        Flutter["📱 Flutter Mobile App"]
        NextJS["💻 Next.js Web App"]
    end

    %% Authentication & Gateways
    subgraph AuthGate ["3. Authentication Gate"]
        SupaAuth["🔑 Supabase Auth (JWT Validation)"]
        LocalMock["fallback Local Mock Auth (Demo Mode)"]
    end

    %% Features & Module Flow
    subgraph Features ["4. Core Module Engines"]
        %% Student Features
        subgraph StudentFlow ["Student Flow"]
            S1["Prepcare AI Prep"]
            S2["Ask Doubts"]
            S3["Submit Assignments"]
            S4["Project Commits"]
        end

        %% Teacher Features
        subgraph TeacherFlow ["Teacher Flow"]
            T1["Generate Test Papers"]
            T2["Resolve Student Doubts"]
            T3["Upload Lectures & Notes"]
            T4["Approve/Remark Projects"]
        end

        %% Parent Features
        subgraph ParentFlow ["Parent Flow"]
            P1["View GPA & Performance"]
            P2["Check Attendance %"]
            P3["Pay Fee Balances"]
            P4["Monitor Gate check-ins"]
        end
    end

    %% Backend Database & Logic
    subgraph Backend ["5. Backend & AI Engine"]
        DB[(PostgreSQL Database)]
        Storage[(Supabase Storage CDN)]
        Gemini[(Gemini AI API)]
    end

    %% Flow Connections
    Student --> Flutter
    Student --> NextJS
    Teacher --> NextJS
    Teacher --> Flutter
    Parent --> Flutter

    Flutter --> SupaAuth
    NextJS --> SupaAuth
    Flutter -.-> LocalMock
    
    SupaAuth --> S1 & S2 & S3 & S4
    SupaAuth --> T1 & T2 & T3 & T4
    SupaAuth --> P1 & P2 & P3 & P4

    LocalMock --> S1 & S2 & S3 & S4
    LocalMock --> T1 & T2 & T3 & T4
    LocalMock --> P1 & P2 & P3 & P4

    %% Features to Backend Connections
    S1 & T1 --> Gemini
    S2 & T2 --> DB
    S3 & T3 --> Storage
    S4 & T4 --> DB
    P1 & P2 & P3 & P4 --> DB
```
