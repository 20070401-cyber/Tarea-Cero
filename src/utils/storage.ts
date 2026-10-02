/**
 * Manejo seguro de persistencia en localStorage para Tarea Cero
 * 
 * ⚠️ PUNTOS DONDE LA GENTE SUELE EQUIVOCARSE:
 * 1. Acceso a `window.localStorage` sin bloque `try / catch`: Si el estudiante usa modo
 *    incógnito en ciertos navegadores móviles (como Safari iOS) o si la memoria está llena,
 *    localStorage.setItem() lanzará una excepción fatal "QuotaExceededError" o "SecurityError".
 *    Sin try/catch, toda la aplicación se rompe en una pantalla en blanco.
 * 2. Asumir que JSON.parse(null) da error: JSON.parse("null") devuelve null, no un arreglo.
 *    Hay que validar que el resultado sea realmente un Array antes de hacer .map() o .filter().
 */

import { Tarea } from '../types/tarea';
import { obtenerFechaHoyISO } from './dateUtils';

const CLAVE_STORAGE = 'tarea_cero_datos_v1';

/**
 * Tareas de ejemplo iniciales para que el estudiante de bachillerato
 * entienda de inmediato la interfaz y el valor de la app.
 */
function generarTareasIniciales(): Tarea[] {
  const hoyStr = obtenerFechaHoyISO();
  
  // Calcular una fecha para mañana
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const mYear = manana.getFullYear();
  const mMonth = String(manana.getMonth() + 1).padStart(2, '0');
  const mDay = String(manana.getDate()).padStart(2, '0');
  const mananaStr = `${mYear}-${mMonth}-${mDay}`;

  return [
    {
      id: 'tarea-demo-1',
      materia: 'Matemáticas',
      titulo: 'Resolver guía de funciones cuadráticas (ejercicios 4 al 12)',
      fechaEntrega: hoyStr,
      prioridad: 'Alta',
      completada: false,
      creadaEn: new Date().toISOString()
    },
    {
      id: 'tarea-demo-2',
      materia: 'Física',
      titulo: 'Reporte del laboratorio sobre movimiento rectilíneo uniforme',
      fechaEntrega: mananaStr,
      prioridad: 'Media',
      completada: false,
      creadaEn: new Date().toISOString()
    }
  ];
}

/**
 * Carga las tareas desde el almacenamiento local.
 */
export function cargarTareasDesdeStorage(): Tarea[] {
  try {
    const datosRaw = localStorage.getItem(CLAVE_STORAGE);
    if (!datosRaw) {
      // Primera vez abriendo la app: sembramos ejemplos útiles
      const iniciales = generarTareasIniciales();
      guardarTareasEnStorage(iniciales);
      return iniciales;
    }

    const parseado = JSON.parse(datosRaw);
    if (Array.isArray(parseado)) {
      return parseado;
    }
    return [];
  } catch (error) {
    console.warn('No se pudo leer de localStorage (posible modo privado o cookies bloqueadas):', error);
    return generarTareasIniciales();
  }
}

/**
 * Guarda el arreglo de tareas en el almacenamiento local.
 */
export function guardarTareasEnStorage(tareas: Tarea[]): void {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(tareas));
  } catch (error) {
    console.error('Error al persistir tareas en localStorage:', error);
  }
}
