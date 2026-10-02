/**
 * Ejemplo de respuesta JSON de prueba y utilidades para Gemini API en Tarea Cero
 * Permite probar el desglose y la lista de verificación sin gastar cuota de API.
 */

import { RespuestaGeminiDesglose } from '../types/tarea';

/**
 * Ejemplo fijo de respuesta JSON que cumple estrictamente con el responseSchema
 */
export const EJEMPLO_RESPUESTA_PRUEBA_JSON: RespuestaGeminiDesglose = {
  pasos: [
    "Revisar los apuntes de clase y la teoría del tema durante 10 minutos.",
    "Resolver los primeros ejercicios guiados paso a paso anotando las fórmulas.",
    "Completar los ejercicios restantes y verificar los resultados finales.",
    "Guardar la tarea en la mochila o carpeta para tenerla lista mañana."
  ],
  tiempoEstimadoMinutos: 45,
  consejoEstudio: "Divide el tiempo en bloques de 20 minutos con 5 de descanso (técnica Pomodoro) y mantén el celular en silencio."
};
