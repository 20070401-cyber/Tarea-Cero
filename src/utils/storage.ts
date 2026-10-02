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
 * 3. Descarga de archivos sin revocar la URL del Blob (`URL.revokeObjectURL`):
 *    Al exportar archivos JSON repetidamente en dispositivos móviles, no revocar
 *    las Object URLs puede provocar fugas de memoria en el navegador del celular.
 */

import { Tarea } from '../types/tarea';
import { obtenerFechaHoyISO } from './dateUtils';

export const CLAVE_STORAGE = 'tarea_cero_datos_v1';

/**
 * Tres tareas de ejemplo cargadas por defecto la primera vez que se abre la app
 * adaptadas a la realidad de un estudiante de bachillerato.
 */
export function generarTareasIniciales(): Tarea[] {
  const hoyStr = obtenerFechaHoyISO();
  
  // Tarea 2: Mañana (+1 día)
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const mYear = manana.getFullYear();
  const mMonth = String(manana.getMonth() + 1).padStart(2, '0');
  const mDay = String(manana.getDate()).padStart(2, '0');
  const mananaStr = `${mYear}-${mMonth}-${mDay}`;

  // Tarea 3: Próxima semana (+5 días)
  const proxSemana = new Date();
  proxSemana.setDate(proxSemana.getDate() + 5);
  const psYear = proxSemana.getFullYear();
  const psMonth = String(proxSemana.getMonth() + 1).padStart(2, '0');
  const psDay = String(proxSemana.getDate()).padStart(2, '0');
  const proxSemanaStr = `${psYear}-${psMonth}-${psDay}`;

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
    },
    {
      id: 'tarea-demo-3',
      materia: 'Historia',
      titulo: 'Leer páginas 45 a 60 sobre la Revolución Industrial y elaborar cuadro sinóptico',
      fechaEntrega: proxSemanaStr,
      prioridad: 'Baja',
      completada: false,
      creadaEn: new Date().toISOString()
    }
  ];
}

/**
 * 1. LEER: Obtiene las tareas desde el almacenamiento local del navegador.
 */
export function cargarTareasDesdeStorage(): Tarea[] {
  try {
    const datosRaw = localStorage.getItem(CLAVE_STORAGE);
    if (!datosRaw) {
      // Primera vez abriendo la app: sembramos las 3 tareas iniciales
      const iniciales = generarTareasIniciales();
      guardarTareasEnStorage(iniciales);
      return iniciales;
    }

    const parseado = JSON.parse(datosRaw);
    if (Array.isArray(parseado)) {
      // Filtrar y validar integridad para no romper la app si el almacenamiento está alterado
      const tareasValidas = parseado.filter(
        (item): item is Tarea =>
          item !== null &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.materia === 'string' &&
          typeof item.titulo === 'string' &&
          typeof item.fechaEntrega === 'string' &&
          typeof item.completada === 'boolean'
      );
      return tareasValidas;
    }
    return [];
  } catch (error) {
    console.warn('No se pudo leer de localStorage (posible modo privado o cookies bloqueadas):', error);
    return generarTareasIniciales();
  }
}

/**
 * 2. GUARDAR: Persiste el arreglo actualizado de tareas en el navegador.
 */
export function guardarTareasEnStorage(tareas: Tarea[]): void {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(tareas));
  } catch (error) {
    console.error('Error al persistir tareas en localStorage:', error);
  }
}

/**
 * 3. BORRAR: Elimina completamente los datos guardados en el almacenamiento local.
 */
export function borrarTareasDeStorage(): void {
  try {
    localStorage.removeItem(CLAVE_STORAGE);
  } catch (error) {
    console.error('Error al borrar datos de localStorage:', error);
  }
}

/**
 * 4. EXPORTAR: Genera y descarga un archivo .json con todas las tareas para respaldo.
 */
export function exportarTareasAJSON(tareas: Tarea[]): void {
  try {
    const jsonString = JSON.stringify(tareas, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `tarea-cero-respaldo-${obtenerFechaHoyISO()}.json`;
    document.body.appendChild(enlace);
    enlace.click();
    
    // Limpieza de memoria
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar tareas a archivo JSON:', error);
  }
}
