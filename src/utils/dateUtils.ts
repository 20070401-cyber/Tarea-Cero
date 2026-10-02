/**
 * Utilidades para el manejo de fechas en Tarea Cero
 * 
 * ⚠️ ADVERTENCIA CRÍTICA SOBRE FECHAS EN JAVASCRIPT:
 * Uno de los errores más frecuentes en aplicaciones web es hacer:
 *   new Date("2026-10-02")
 * El estándar ECMAScript interpreta las cadenas en formato "YYYY-MM-DD"
 * como medianoche en Tiempo Universal Coordinado (UTC). En países de habla hispana
 * en América Latina (por ejemplo UTC-3 a UTC-8), esto se convierte a las 19:00 - 21:00
 * del DÍA ANTERIOR en hora local, provocando que la tarea aparezca un día antes
 * o se marque como vencida por error.
 */

/**
 * Obtiene la fecha actual del sistema en formato local 'YYYY-MM-DD'.
 */
export function obtenerFechaHoyISO(): string {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parsea una cadena 'YYYY-MM-DD' garantizando que se interprete en hora LOCAL,
 * fijando la hora a las 00:00:00 locales para comparaciones justas sin desfase horario.
 *
 * ⚠️ PUNTO DE ERROR COMÚN:
 * No uses `new Date(cadenaISO)` directamente para fechas sin hora; usa esta función.
 */
export function parsearFechaLocal(fechaStr: string): Date {
  const partes = fechaStr.split('-');
  if (partes.length !== 3) {
    // Si viene en otro formato inesperado, usar fecha actual como salvaguarda
    const fallback = new Date();
    fallback.setHours(0, 0, 0, 0);
    return fallback;
  }
  const year = parseInt(partes[0], 10);
  const month = parseInt(partes[1], 10) - 1; // En JS los meses van de 0 a 11
  const day = parseInt(partes[2], 10);

  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Determina si una tarea pendiente está vencida.
 * Una tarea está vencida SI Y SOLO SI su fecha de entrega es estrictamente
 * anterior al día de hoy a las 00:00:00.
 */
export function estaVencida(fechaEntregaStr: string): boolean {
  if (!fechaEntregaStr) return false;
  const fechaEntrega = parsearFechaLocal(fechaEntregaStr);
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return fechaEntrega.getTime() < hoy.getTime();
}

/**
 * Determina si la fecha de entrega de una tarea es exactamente hoy.
 */
export function esParaHoy(fechaEntregaStr: string): boolean {
  if (!fechaEntregaStr) return false;
  return fechaEntregaStr === obtenerFechaHoyISO();
}

/**
 * Determina si una fecha (en formato ISO completo o fecha local) ocurrió hoy.
 * Útil para calcular las tareas "entregadas hoy".
 */
export function esFechaDeHoy(isoTimestamp?: string): boolean {
  if (!isoTimestamp) return false;
  try {
    const fecha = new Date(isoTimestamp);
    if (isNaN(fecha.getTime())) return false;

    const hoy = new Date();
    return (
      fecha.getDate() === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()
    );
  } catch {
    return false;
  }
}

/**
 * Formatea una fecha 'YYYY-MM-DD' en texto amigable para un estudiante
 * (ej: "Hoy", "Mañana", "Ayer", "Jueves 15 de Octubre").
 */
export function formatearFechaAmigable(fechaStr: string): { texto: string; relativo: string } {
  if (!fechaStr) return { texto: 'Sin fecha', relativo: '' };

  const fechaObj = parsearFechaLocal(fechaStr);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Diferencia en días completos
  const unDiaMs = 1000 * 60 * 60 * 24;
  const difDias = Math.round((fechaObj.getTime() - hoy.getTime()) / unDiaMs);

  let relativo = '';
  if (difDias < -1) {
    relativo = `Venció hace ${Math.abs(difDias)} días`;
  } else if (difDias === -1) {
    relativo = 'Venció ayer';
  } else if (difDias === 0) {
    relativo = '¡Entrega hoy!';
  } else if (difDias === 1) {
    relativo = 'Entrega mañana';
  } else if (difDias <= 7) {
    relativo = `En ${difDias} días`;
  }

  // Formato legible en español
  const opciones: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  };
  const texto = fechaObj.toLocaleDateString('es-ES', opciones);

  return { texto, relativo };
}
