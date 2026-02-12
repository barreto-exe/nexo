// =============================================================================
// Summary Controller
// =============================================================================
// Endpoint POST /api/generate-summary para generar Daily Stand-up con IA
// Utiliza GitHub Copilot Models (Azure AI Inference) para la generación
// =============================================================================

using Azure;
using Azure.AI.Inference;
using Microsoft.AspNetCore.Mvc;
using PlusChamba.Server.Models;
using System.Text.RegularExpressions;

namespace PlusChamba.Server.Controllers;

[ApiController]
[Route("api/generate-summary")]
public class GenerateSummaryController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<GenerateSummaryController> _logger;

    public GenerateSummaryController(IConfiguration configuration, ILogger<GenerateSummaryController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Genera un resumen para Daily Stand-up basado en tareas completadas y pendientes
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<SummaryResponse>> GenerateSummary([FromBody] SummaryRequest request)
    {
        try
        {
            var apiKey = _configuration["OpenAI:ApiKey"];
            var model = _configuration["OpenAI:Model"] ?? "gpt-4o";
            var baseUrl = _configuration["OpenAI:BaseUrl"] ?? "https://models.inference.ai.azure.com/";

            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("OpenAI API key not configured");
                return BadRequest(new SummaryResponse("", false, "API key no configurada. Configura OpenAI:ApiKey en User Secrets o variables de entorno."));
            }

            // Construir el prompt del usuario con las tareas
            var userPrompt = BuildUserPrompt(request);

            // Crear cliente de Azure AI Inference (compatible con GitHub Models)
            var client = new ChatCompletionsClient(
                new Uri(baseUrl),
                new AzureKeyCredential(apiKey)
            );

            var options = new ChatCompletionsOptions
            {
                Model = model,
                Temperature = 0.7f,
                MaxTokens = 500,
                Messages =
                {
                    new ChatRequestSystemMessage(SystemPrompt),
                    new ChatRequestUserMessage(userPrompt)
                }
            };

            var response = await client.CompleteAsync(options);
            var summary = NormalizeSummary(response.Value.Content);

            _logger.LogInformation("Summary generated successfully. Tokens used: {Tokens}", 
                response.Value.Usage?.TotalTokens ?? 0);

            return Ok(new SummaryResponse(summary, true));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating summary");
            return StatusCode(500, new SummaryResponse("", false, $"Error al generar resumen: {ex.Message}"));
        }
    }

    /// <summary>
    /// System prompt para generar Daily Stand-up
    /// </summary>
    private const string SystemPrompt = """
        Eres un asistente que genera textos concisos para Daily Stand-up meetings.
        
        INSTRUCCIONES:
        - Tu objetivo PRINCIPAL es estructurar la respuesta con listas de bullets.
        - NUNCA escribas texto en la misma línea que el título.
        - NUNCA escribas párrafos sin bullets.
        - SIEMPRE usa un guion (-) para cada item.
        
        FORMATO OBLIGATORIO:
        
        📋 **Ayer**
        - [Tarea completada 1]
        - [Tarea completada 2]
        
        🎯 **Hoy**
        - [Tarea planificada 1]
        - [Tarea planificada 2]
        
        🚧 **Bloqueos** (Solo si existen)
        - [Detalle del bloqueo]

        EJEMPLO: 
        📋 **Ayer**
        - Terminé un refactor completo de badges y tags junto con Ángel y Gabriel para corregir errores y eliminar código repetido.

        🎯 **Hoy**
        - Comenzaré con la optimización del uso de store rules y su implementación en nuevos endpoints del home.
        - Atenderé el canal de identificación de clientes.

        🚧 **Bloqueos**
        - Sin bloqueos.
        
        REGLAS ADICIONALES:
        - Linea de título y bullets SIEMPRE en líneas separadas.
        - Usa emojis para cada sección (Ayer: 📋, Hoy: 🎯, Bloqueos: 🚧)
        - Una linea en blanco entre secciones. Sin lineas en blanco dentro de secciones.
        - Si solo hay una tarea, TAMBIÉN usa un bullet (-).
        - Si la sección de Bloqueos está vacía, puedes omitirla o poner "Sin bloqueos".
        - Si no hay tareas en Ayer/Hoy, pon un bullet que diga "Sin tareas registradas".
        - Usa primera persona ("Terminé", "Haré").
        - Sé breve (máximo 2 oraciones por punto).
        - Incorpora en los bullets los avances o bloqueos descritos en los comentarios recientes.
        """;

    /// <summary>
    /// Construye el prompt del usuario con los datos de las tareas
    /// </summary>
    private static string BuildUserPrompt(SummaryRequest request)
    {
        var prompt = new System.Text.StringBuilder();

        prompt.AppendLine("=== TAREAS COMPLETADAS (último día activo) ===");
        if (request.CompletedTasks.Count == 0)
        {
            prompt.AppendLine("No hay tareas completadas recientemente.");
        }
        else
        {
            foreach (var task in request.CompletedTasks)
            {
                prompt.AppendLine($"- {task.Title}");
                if (!string.IsNullOrWhiteSpace(task.Description))
                {
                    prompt.AppendLine($"  Descripción: {task.Description}");
                }
                prompt.AppendLine($"  Prioridad: Urgencia={task.Urgency}, Importancia={task.Importance}");
                if (task.Comments is { Count: > 0 })
                {
                    prompt.AppendLine("  Comentarios recientes:");
                    foreach (var comment in task.Comments)
                    {
                        var authorLabel = string.IsNullOrWhiteSpace(comment.AuthorName) ? "Usuario" : comment.AuthorName;
                        prompt.AppendLine($"  - [{authorLabel}] {comment.Text}");
                    }
                }
            }
        }

        prompt.AppendLine();
        prompt.AppendLine("=== TAREAS PENDIENTES (Todo + En Progreso) ===");
        if (request.PendingTasks.Count == 0)
        {
            prompt.AppendLine("No hay tareas pendientes.");
        }
        else
        {
            foreach (var task in request.PendingTasks)
            {
                var statusLabel = task.Status == "InProgress" ? "[En Progreso]" : "[Por Hacer]";
                prompt.AppendLine($"- {statusLabel} {task.Title}");
                if (!string.IsNullOrWhiteSpace(task.Description))
                {
                    prompt.AppendLine($"  Descripción: {task.Description}");
                }
                prompt.AppendLine($"  Prioridad: Urgencia={task.Urgency}, Importancia={task.Importance}");
                if (task.Comments is { Count: > 0 })
                {
                    prompt.AppendLine("  Comentarios recientes:");
                    foreach (var comment in task.Comments)
                    {
                        var authorLabel = string.IsNullOrWhiteSpace(comment.AuthorName) ? "Usuario" : comment.AuthorName;
                        prompt.AppendLine($"  - [{authorLabel}] {comment.Text}");
                    }
                }
                
                if (task.IsBlocked)
                {
                    prompt.AppendLine($"  ⚠️ BLOQUEADA: {task.BlockedReason ?? "Sin motivo especificado"}");
                }
            }
        }

        prompt.AppendLine();
        prompt.AppendLine("NOTA: Los comentarios son entradas de bitácora. Úsalos para reflejar avances, decisiones y bloqueos cuando sean relevantes.");
        prompt.AppendLine("Genera el resumen para mi Daily Stand-up basado en esta información.");

        return prompt.ToString();
    }

    private static string NormalizeSummary(string summary)
    {
        if (string.IsNullOrWhiteSpace(summary))
        {
            return summary;
        }

        if (summary.Contains('\n'))
        {
            return summary.Replace("\r\n", "\n").Replace("\r", "\n");
        }

        var normalized = summary;
        normalized = normalized.Replace("📋 **Ayer**", "📋 **Ayer**\n");
        normalized = normalized.Replace("🎯 **Hoy**", "\n\n🎯 **Hoy**\n");
        normalized = normalized.Replace("🚧 **Bloqueos**", "\n\n🚧 **Bloqueos**\n");
        normalized = Regex.Replace(normalized, @"\s-\s", "\n- ");

        return normalized.Trim();
    }
}
