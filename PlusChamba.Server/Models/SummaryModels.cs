// =============================================================================
// Summary Models
// =============================================================================
// DTOs para el endpoint de generación de resumen AI
// =============================================================================

namespace PlusChamba.Server.Models;

/// <summary>
/// Datos de una tarea para el resumen
/// </summary>
public record TaskData(
    string Title,
    string? Description,
    string Status,
    string Urgency,
    string Importance,
    bool IsBlocked,
    string? BlockedReason,
    string UpdatedAt,
    List<TaskComment>? Comments
);

/// <summary>
/// Comentario de una tarea para el resumen
/// </summary>
public record TaskComment(
    string Text,
    string? AuthorName,
    string Timestamp
);

/// <summary>
/// Request para generar el resumen
/// </summary>
public record SummaryRequest(
    /// <summary>
    /// Tareas completadas (del último día activo)
    /// </summary>
    List<TaskData> CompletedTasks,
    
    /// <summary>
    /// Tareas pendientes (Todo + InProgress)
    /// </summary>
    List<TaskData> PendingTasks
);

/// <summary>
/// Response con el resumen generado
/// </summary>
public record SummaryResponse(
    string Summary,
    bool Success,
    string? Error = null
);
