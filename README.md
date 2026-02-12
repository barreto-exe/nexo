# NEXO 🚀

**Task management application with AI-powered Daily Stand-up summaries**

Full-stack app with React + Vite frontend and ASP.NET Core backend, featuring Kanban boards, Eisenhower Matrix prioritization, and AI-generated summaries using GitHub Copilot Models.

## ✨ Features

- **Kanban Board** - Drag-and-drop task management (Backlog → Todo → In Progress → Done)
- **Eisenhower Matrix** - Visual priority system (Urgency × Importance)
- **Task Blocking** - Mark tasks as blocked with reason tracking
- **Task History** - Automatic change tracking for all task modifications
- **AI Daily Summary** - Generate Daily Stand-up text using AI (Phase 4)
- **Real-time Sync** - Firebase Realtime Database for instant updates
- **Google OAuth** - Secure authentication via Firebase

## 🏗️ Architecture

```
PlusChamba/
├── pluschamba.client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/         # UI components (Kanban, Summary)
│   │   ├── contexts/           # Auth context
│   │   ├── hooks/              # Custom hooks (useTasks)
│   │   ├── services/           # Firebase + API services
│   │   └── pages/              # Dashboard
│   └── public/
└── PlusChamba.Server/          # ASP.NET Core backend
    ├── Controllers/            # API endpoints
    └── Models/                 # DTOs
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- .NET 10 SDK
- Firebase project with Realtime Database + Google Auth enabled

### Frontend Setup
```bash
cd pluschamba.client
npm install

# Create .env.local with Firebase config
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

npm run dev  # http://localhost:56243
```

### Backend Setup
```bash
cd PlusChamba.Server

# Configure API key in appsettings.json
# Edit OpenAI:ApiKey with your GitHub token

dotnet run  # https://localhost:7116
```

### Full Stack (with proxy)
```bash
# From solution root
dotnet run --project PlusChamba.Server
# Frontend auto-starts via SPA proxy
```

## 🤖 AI Summary Feature (Phase 4)

Generate Daily Stand-up summaries using GitHub Copilot Models:

1. Click the **"Resumen"** button in the Dashboard header
2. AI analyzes:
   - ✅ Completed tasks from last active day
   - 📋 Pending tasks (Todo + In Progress)
   - 🚧 Blocked tasks with reasons
3. Generates first-person summary in Spanish:
   ```
   📋 **Ayer:** Completé la integración de Firebase y el diseño del Kanban.
   🎯 **Hoy:** Voy a trabajar en las notificaciones push.
   🚧 **Bloqueos:** La tarea de deployment está bloqueada esperando credenciales de AWS.
   ```

### API Configuration

Configure in `PlusChamba.Server/appsettings.json`:
```json
{
  "OpenAI": {
    "ApiKey": "ghp_YOUR_GITHUB_TOKEN",
    "Model": "gpt-4o",
    "BaseUrl": "https://models.inference.ai.azure.com/"
  }
}
```

> ⚠️ **Security**: Don't commit real API keys. Use environment variables in production:
> ```bash
> $env:OpenAI__ApiKey = "ghp_your_token"
> ```

## 📚 Documentation

- [Backend CHANGELOG](PlusChamba.Server/CHANGELOG.md) - API documentation & setup
- [Frontend CHANGELOG](pluschamba.client/CHANGELOG.md) - Component updates
- [Copilot Instructions](.github/instructions/copilot-instructions.md) - Coding conventions

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, MUI v7, @hello-pangea/dnd |
| Backend | .NET 10, ASP.NET Core, Azure.AI.Inference |
| Database | Firebase Realtime Database |
| Auth | Firebase Auth (Google OAuth) |
| AI | GitHub Copilot Models (GPT-4o via Azure AI Inference) |

## 📄 License

MIT