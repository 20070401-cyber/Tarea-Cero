/**
 * Tipos de datos para Tarea Cero
 * Diseñado específicamente para estudiantes de bachillerato.
 */

export type Prioridad = 'Alta' | 'Media' | 'Baja';

export type FiltroEstado = 'pendientes' | 'completadas' | 'todas';

/**
 * Sub-paso individual dentro de la lista de verificación generada por Gemini
 */
export interface PasoDesglose {
  id: string;
  texto: string;
  completado: boolean;
}

/**
 * Plan de estudio inteligente generado por Gemini
 */
export interface PlanIA {
  pasos: PasoDesglose[];
  tiempoEstimadoMinutos: number;
  consejoEstudio: string;
  generadoEn: string;
}

/**
 * Estructura fija de respuesta esperada de Gemini API (responseSchema)
 */
export interface RespuestaGeminiDesglose {
  pasos: string[];
  tiempoEstimadoMinutos: number;
  consejoEstudio: string;
}

export interface Tarea {
  id: string;
  materia: string;
  titulo: string;
  fechaEntrega: string; // 'YYYY-MM-DD'
  prioridad: Prioridad;
  completada: boolean;
  completadaEn?: string;
  creadaEn: string;

  /**
   * Desglose pedagógico generado por la IA de Gemini
   */
  planIA?: PlanIA;
}

export interface MetricasTareas {
  totalPendientes: number;
  vencidas: number;
  entregadasHoy: number;
  paraHoy: number;
}
