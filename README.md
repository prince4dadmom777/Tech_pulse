# FlowPilot AI — Autonomous Business Workflow Manager

> **"Turn Business Complexity into Autonomous Action"**  
> An intelligent business workflow automation platform powered by multi-agent collaboration, dependency-aware task scheduling, strict tool sandboxing, and cryptographically verified human approval gates.

---

## 1. System Overview & Architecture

FlowPilot AI solves operational bottlenecks in businesses struggling with fragmented coordination, stockout delays, and repetitive manual decision-making. 

```
                                      +------------------------+
                                      | Natural Language Goal  |
                                      +-----------+------------+
                                                  |
                                                  v
                                      +------------------------+
                                      |   Orchestrator Agent   |
                                      +-----------+------------+
                                                  |
                  +-------------------------------+-------------------------------+
                  |                               |                               |
                  v                               v                               v
      +------------------------+      +------------------------+      +------------------------+
      | Business Analyst Agent |      |     Planning Agent     |      |    Operations Agent    |
      | - Order item lookup    |      | - Dependency DAG graph |      | - Inventory alert tool |
      | - Shortfall detection  |      | - Cycle detection      |      | - Staged PO generation |
      +------------------------+      +------------------------+      +-----------+------------+
                  |                               |                               |
                  +-------------------------------+-------------------------------+
                                                  |
                                                  v
                                      +------------------------+
                                      | Human Approval Center  |
                                      | - SHA-256 payload hash |
                                      | - Risk-gated execution |
                                      +-----------+------------+
                                                  | (Approved)
                                                  v
                                      +------------------------+
                                      | Quality & Risk Agent   |
                                      | - State verification   |
                                      +-----------+------------+
                                                  |
                                                  v
                                      +------------------------+
                                      |   Final Report Agent   |
                                      | - Grounded outcomes    |
                                      +------------------------+
```

### Specialized Agents:
1. **Orchestrator Agent**: Deconstructs high-level natural language objectives into structured plans.
2. **Business Analyst Agent**: Inspects database records, audits order fulfillment delays, and quantifies stock shortfalls.
3. **Planning Agent**: Constructs topological task execution DAGs, verifying that no circular dependencies exist.
4. **Operations Agent**: Executes authorized application tools (e.g. inventory alerts, warehouse work orders).
5. **Customer Communication Agent**: Drafts empathetic, fact-verified delay notifications without making unverified promises.
6. **Quality & Risk Agent**: Verifies actual database mutations against completion criteria before marking tasks done.
7. **Final Report Agent**: Formulates evidence-based completion reports with time savings and remaining risk assessments.

---

## 2. Features Implemented

- [x] **Natural-Language Workflow Creation**: Transforms plain English requests into validated multi-step plans.
- [x] **Autonomous Planning & DAG Validation**: Uses Kahn's algorithm for topological sorting and cycle detection.
- [x] **Multi-Agent Collaboration**: Specialized agent handoffs via a deterministic state machine and `@google/genai`.
- [x] **Typed Tool Registry**: Strictly sandboxed tools (`read_order`, `read_inventory`, `search_customers`, `read_supplier_records`, `create_internal_task`, `update_permitted_internal_records`, `generate_inventory_alert`, `draft_customer_communication`, `request_approval`, `generate_final_report`).
- [x] **Human Approval Center**: Gates consequential financial actions and customer-facing messages behind immutable SHA-256 payload review.
- [x] **Live Workflow Monitoring**: Server-Sent Events (SSE) streaming at `/api/workflows/:id/events`.
- [x] **Interactive Task Queue**: Switch between a real-time Kanban Board and Table view with retry controls.
- [x] **Business Data Management**: Searchable and editable tables for Orders, Inventory, Customers, and Suppliers.
- [x] **Workflow Templates**: Built-in reusable blueprints with instant execution triggers.
- [x] **Analytics & Telemetry**: Dynamic charts (Recharts) detailing completion velocity, agent performance, and manual time saved.
- [x] **Activity Audit Trail**: Immutable logging of every system event, actor, tool execution, and outcome.
- [x] **High-Fidelity Demo Mode**: Runs deterministically without an API key against real application database records.

---

## 3. Project Structure

```
flowpilot-ai/
├── apps/
│   ├── web/                          # React + TypeScript + Vite + Tailwind CSS
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── layout/           # AppLayout, Sidebar, TopNavigation
│   │   │   │   └── ui/               # StatusBadge, MetricCard
│   │   │   ├── pages/                # 14 Full Application Routes
│   │   │   ├── lib/                  # API client & fetch wrappers
│   │   │   ├── App.tsx               # Client-side routing
│   │   │   └── main.tsx
│   │   └── package.json
│   │
│   └── api/                          # Node.js + Express + TypeScript
│       ├── src/
│       │   ├── ai/                   # @google/genai client & response validators
│       │   ├── database/             # Persistent ACID-safe store & seed generator
│       │   ├── logging/              # Centralized structured logger
│       │   ├── middleware/           # Auth, Workspace isolation, Rate limiting, Error handler
│       │   ├── orchestration/        # Workflow engine, DAG validator, SSE events
│       │   ├── routes/               # REST API endpoints (Workflows, Tasks, Approvals, etc.)
│       │   ├── tools/                # Typed Tool Registry & handlers
│       │   ├── test/                 # Automated unit & integration tests
│       │   ├── app.ts                # Express app setup
│       │   └── server.ts             # Server entry point (Port 3001)
│       └── package.json
│
├── packages/
│   └── shared/                       # Shared Zod schemas, constants & TypeScript types
│       ├── src/
│       │   ├── constants.ts
│       │   ├── schemas.ts
│       │   ├── types.ts
│       │   └── index.ts
│       └── package.json
│
├── supabase/
│   ├── migrations/                   # Production PostgreSQL migrations with RLS & Triggers
│   └── seed.sql                      # Seed data for agents, templates, orders, & inventory
│
├── .env.example
├── package.json                      # Monorepo root with npm workspaces
└── README.md
```

---

## 4. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

```dotenv
# Application
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173
API_BASE_URL=http://localhost:3001/api

# Google Gemini (Optional: If omitted, deterministic high-fidelity agent simulation is used)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

# Supabase PostgreSQL (Optional: Local persistent database active by default)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Security & Limits
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
WORKFLOW_MAX_TASKS=25
WORKFLOW_MAX_STEPS=50
WORKFLOW_MAX_RETRIES=3
WORKFLOW_TASK_TIMEOUT_MS=60000

# Demo
ENABLE_DEMO_MODE=true
```

---

## 5. Quick Start Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Shared Schemas & Packages
```bash
npm run build --workspace=@flowpilot/shared
npm run build --workspace=@flowpilot/api
npm run build --workspace=@flowpilot/web
```

### 3. Run Automated Tests
```bash
npm run test --workspace=@flowpilot/api
```

### 4. Start the Application
You can run both backend and frontend concurrently:
```bash
# Terminal 1: Backend API (Port 3001)
npm run dev --workspace=@flowpilot/api

# Terminal 2: Frontend Web (Port 5173)
npm run dev --workspace=@flowpilot/web
```

Open **`http://localhost:5173`** in your browser.

---

## 6. End-to-End Hackathon Demonstration Scenario

To demonstrate FlowPilot AI's full capabilities:

1. Click **"Launch Demo Workflow"** from the top navigation or visit **`/workflows/new`** and select the pre-filled template:  
   *"Delayed Customer Order & Stock Deficit Resolution"*.
2. **Analysis & Planning**:
   - The **Business Analyst Agent** detects that order `ORD-2025-089` is delayed due to insufficient stock of `SKU-PRO-01` (Current Quantity: 2; Required: 10).
   - The **Planning Agent** generates a 4-step dependency DAG with cycle detection.
3. **Autonomous Execution**:
   - The **Operations Agent** triggers `generate_inventory_alert`, logs an internal warehouse ticket, and stages a $750 purchase order replenishment.
   - The **Customer Communication Agent** drafts an honest delay notice for `Apex Global Logistics`.
4. **Human Approval Gate**:
   - Sensitive actions are held in status `awaiting_approval`.
   - Navigate to **`/approvals`** to review the SHA-256 verified action payload and click **"Approve & Execute Action"**.
5. **Quality Verification & Reporting**:
   - The **Quality & Risk Agent** confirms the inventory addition and email dispatch.
   - The **Final Report Agent** publishes a verifiable completion report with estimated time savings (45 minutes).

---

## 7. Security Controls

- **Zero Client Credential Exposure**: Gemini API keys and sensitive credentials reside strictly on the server.
- **Payload Hash Protection**: All approval requests generate a canonical SHA-256 hash. If the action payload is tampered with, approval fails.
- **Strict Allowlist Tool Sandboxing**: Agents can only execute pre-registered typed tools with Zod input validation; arbitrary code/query execution is prevented.
- **Database Isolation**: PostgreSQL Row Level Security (RLS) ensures complete workspace multi-tenancy isolation.
