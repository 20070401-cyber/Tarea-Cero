/**
 * Tipos de datos para Tarea Cero
 * Diseñado específicamente para estudiantes de bachillerato.
 */

export type Prioridad = 'Alta' | 'Media' | 'Baja';

export type FiltroEstado = 'pendientes' | 'completadas' | 'todas';

export interface Tarea {
  /**
   * Identificador único.
   * CUIDADO: Usar siempre IDs de tipo string generados por UUID o crypto.randomUUID()
   * en lugar de índices de arreglo (0, 1, 2...), ya que al eliminar o reordenar tareas
   * los índices cambian y provocan bugs en React al renderizar las keys.
   */
  id: string;

  /**
   * Asignatura o materia escolar (ej: Matemáticas, Historia, Física).
   */
  materia: string;

  /**
   * Título o descripción concreta de la tarea (ej: Ejercicios del 1 al 15 página 82).
   */
  titulo: string;

  /**
   * Fecha de entrega en formato ISO estándar 'YYYY-MM-DD' (ej: '2026-10-05').
   * CUIDADO: No almacenar como objeto Date directamente en localStorage
   * porque JSON.stringify lo convierte a string y JSON.parse no lo deserializa
   * de vuelta a Date automáticamente.
   */
  fechaEntrega: string;

  /**
   * Nivel de urgencia o relevancia escolar.
   */
  prioridad: Prioridad;

  /**
   * Estado de la tarea: true si el estudiante ya la terminó.
   */
  completada: boolean;

  /**
   * Fecha y hora exacta (string ISO) en la que se marcó como completada.
   * Sirve para calcular con precisión las tareas "entregadas hoy".
   */
  completadaEn?: string;

  /**
   * Fecha de creación en formato ISO string.
   */
  creadaEn: string;
}

export interface MetricasTareas {
  /** Total de tareas aún no completadas */
  totalPendientes: number;
  /** Tareas pendientes cuya fecha de entrega es anterior a hoy */
  vencidas: number;
  /** Tareas que se marcaron como completadas durante el día de hoy */
  entregadasHoy: number;
  /** Tareas pendientes que vencen específicamente hoy */
  paraHoy: number;
}
