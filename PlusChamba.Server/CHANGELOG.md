# PlusChamba Server Changelog

## [Unreleased]

### Added - Phase 4: AI Summary (Daily Stand-up)
- `POST /api/generate-summary` endpoint for AI-powered Daily Stand-up generation
- Integration with GitHub Copilot Models (Azure AI Inference API)
- System prompt optimized for concise, first-person Daily Stand-up format
- Support for blockers detection and inclusion in summary

---

## Project Setup Notes

This file explains how Visual Studio created the project.

The following steps were used to generate this project:
- Create new ASP\.NET Core Web API project.
- Update project file to add a reference to the frontend project and set SPA properties.
- Update `launchSettings.json` to register the SPA proxy as a startup assembly.
- Add project to the startup projects list.
- Write this file.

---

## Configuration: API Key Setup

### Option 1: User Secrets (Recommended for Development)

User Secrets keeps sensitive data outside of your project files and source control.

```bash
# Navigate to the server project folder
cd PlusChamba.Server

# Initialize user secrets (already configured in .csproj)
dotnet user-secrets init

# Set your GitHub Copilot API key
dotnet user-secrets set "OpenAI:ApiKey" "ghp_YOUR_GITHUB_TOKEN_HERE"
```

To view configured secrets:
```bash
dotnet user-secrets list
```

To remove a secret:
```bash
dotnet user-secrets remove "OpenAI:ApiKey"
```

### Option 2: Environment Variables (Recommended for Production)

Set environment variables with double underscore (`__`) as section separator:

**Windows (PowerShell):**
```powershell
$env:OpenAI__ApiKey = "ghp_YOUR_GITHUB_TOKEN_HERE"
```

**Windows (CMD):**
```cmd
set OpenAI__ApiKey=ghp_YOUR_GITHUB_TOKEN_HERE
```

**Linux/macOS:**
```bash
export OpenAI__ApiKey="ghp_YOUR_GITHUB_TOKEN_HERE"
```

**Docker/Container:**
```dockerfile
ENV OpenAI__ApiKey="ghp_YOUR_GITHUB_TOKEN_HERE"
```

### Configuration Hierarchy

ASP.NET Core loads configuration in this order (later overrides earlier):
1. `appsettings.json` (base config, committed to git)
2. `appsettings.{Environment}.json` (e.g., Development, Production)
3. User Secrets (Development only)
4. Environment Variables (highest priority)

### Verifying Configuration

The `/api/generate-summary` endpoint will return an error message if the API key is not configured:
```json
{
  "summary": "",
  "success": false,
  "error": "API key no configurada. Configura OpenAI:ApiKey en User Secrets o variables de entorno."
}
```

