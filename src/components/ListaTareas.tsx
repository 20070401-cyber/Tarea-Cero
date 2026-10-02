/**
 * Componente: ListaTareas
 * Muestra la lista visual de tareas pendientes con:
 * - Opción de marcar como completada (o desmarcar)
 * - Opción de eliminar con confirmación preventiva
 * - Filtros rápidos: Pendientes / Completadas / Todas
 *
 * ⚠️ PUNTOS DONDE LA GENTE SUELE EQUIVOCARSE:
 * 1. Usar el índice del array como `key` en React (`key={index}`):
 *    Cuando el estudiante elimina una tarea o marca una como completada,
 *    React reutilizará los nodos del DOM por índice, provocando glitches visuales
 *    donde el checkbox de la tarea equivocada parece marcarse. Siempre usar `key={tarea.id}`.
 * 2. Mutar el arreglo original: En React nunca se debe hacer `tareas.splice()` o
 *    `tarea.completada = true` directamente. Siempre se debe crear una copia con
 *    `.map()` o `.filter()`.
 * 3. En pantallas táctiles móviles, los botones de eliminar muy pequeños se tocan por
 *    accidente mientras se hace scroll. Agregamos un hitbox generoso y un paso de confirmación.
 */

import React, { useState } from 'react';
import { Check, CheckCircle2, Circle, Trash2, Calendar, AlertTriangle, Layers, ArrowUpDown } from 'lucide-react';
import { FiltroEstado, Tarea } from '../types/tarea';
import { estaVencida, esParaHoy, formatearFechaAmigable, parsearFechaLocal } from '../utils/dateUtils';

interface ListaTareasProps {
  tareas: Tarea[];
  filtro: FiltroEstado;
  alCambiarFiltro: (filtro: FiltroEstado) => void;
  alAlternarCompletada: (id: string) => void;
  alEliminarTarea: (id: string) => void;
}

export const ListaTareas: React.FC<ListaTareasProps> = ({
  tareas,
  filtro,
  alCambiarFiltro,
  alAlternarCompletada,
  alEliminarTarea
}) => {
  // Estado para confirmar eliminación en celular sin window.confirm (que está prohibido en iframes)
  const [tareaAEliminar, setTareaAEliminar] = useState<string | null>(null);

  // 1. Filtrado de las tareas según el estado seleccionado (todas / pendientes / completadas)
  const tareasFiltradas = tareas.filter((t) => {
    if (filtro === 'pendientes') return !t.completada;
    if (filtro === 'completadas') return t.completada;
    return true; // 'todas'
  });

  // 2. Ordenamiento estricto por fecha de entrega más cercana (cronológico ascendente)
  // CUIDADO: No usar resta simple de strings. Usar timestamps locales para evitar desfases.
  const tareasOrdenadas = [...tareasFiltradas].sort((a, b) => {
    const fechaA = parsearFechaLocal(a.fechaEntrega).getTime();
    const fechaB = parsearFechaLocal(b.fechaEntrega).getTime();

    if (fechaA !== fechaB) {
      return fechaA - fechaB; // La fecha más próxima/cercana aparece primero
    }

    // Criterio secundario de desempate: mayor prioridad primero
    const pesoPrioridad = { Alta: 1, Media: 2, Baja: 3 };
    return pesoPrioridad[a.prioridad] - pesoPrioridad[b.prioridad];
  });

  const conteoPendientes = tareas.filter((t) => !t.completada).length;
  const conteoCompletadas = tareas.filter((t) => t.completada).length;

  return (
    <section aria-label="Lista de tareas escolares" className="space-y-3">
      {/* Barra de control y filtros (Segmented control) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center flex-wrap gap-2">
          <Layers className="w-4 h-4 text-slate-500" />
          <h2 className="text-base font-bold text-slate-900">
            {filtro === 'pendientes' && 'Tareas Pendientes'}
            {filtro === 'completadas' && 'Tareas Completadas'}
            {filtro === 'todas' && 'Todas las Tareas'}
          </h2>
          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            ({tareasFiltradas.length})
          </span>

          {/* Indicador visual de ordenamiento por fecha más cercana */}
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
            <ArrowUpDown className="w-3 h-3 text-indigo-600" />
            <span>Fecha más cercana</span>
          </span>
        </div>

        {/* Control segmentado táctil para celulares */}
        <div className="flex items-center p-1 bg-slate-200/70 rounded-xl self-start sm:self-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => alCambiarFiltro('todas')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-lg transition-all ${
              filtro === 'todas'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({tareas.length})
          </button>
          <button
            type="button"
            onClick={() => alCambiarFiltro('pendientes')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-lg transition-all ${
              filtro === 'pendientes'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pendientes ({conteoPendientes})
          </button>
          <button
            type="button"
            onClick={() => alCambiarFiltro('completadas')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 min-h-[36px] text-xs font-semibold rounded-lg transition-all ${
              filtro === 'completadas'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completadas ({conteoCompletadas})
          </button>
        </div>
      </div>

      {/* Estado vacío cuando no hay tareas en la vista seleccionada */}
      {tareasOrdenadas.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {filtro === 'pendientes'
              ? '¡Objetivo Tarea Cero alcanzado!'
              : filtro === 'completadas'
              ? 'No tienes tareas completadas aún'
              : 'No hay ninguna tarea registrada'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
            {filtro === 'pendientes'
              ? 'Estás al día con todos tus deberes escolares de bachillerato. ¡Excelente trabajo!'
              : filtro === 'completadas'
              ? 'A medida que termines tus deberes y los marques como hechos, se guardarán aquí.'
              : 'Usa el formulario superior para registrar la primera tarea de tus materias.'}
          </p>
        </div>
      )}

      {/* Lista de tarjetas de tareas */}
      <div className="space-y-2.5">
        {tareasOrdenadas.map((tarea) => {
          const vencida = !tarea.completada && estaVencida(tarea.fechaEntrega);
          const paraHoy = !tarea.completada && esParaHoy(tarea.fechaEntrega);
          const fechaInfo = formatearFechaAmigable(tarea.fechaEntrega);
          const confirmandoEliminar = tareaAEliminar === tarea.id;

          return (
            <article
              key={tarea.id}
              className={`group bg-white rounded-2xl border transition-all p-3.5 sm:p-4 ${
                tarea.completada
                  ? 'border-slate-200/70 bg-slate-50/60 opacity-80'
                  : vencida
                  ? 'border-rose-300 bg-rose-50/30'
                  : paraHoy
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* 
                  Hitbox de marcado accesible (mínimo 44x44px en touch).
                  Permite al estudiante marcar su tarea rápidamente.
                */}
                <button
                  type="button"
                  onClick={() => alAlternarCompletada(tarea.id)}
                  aria-label={tarea.completada ? `Marcar ${tarea.titulo} como pendiente` : `Completar tarea ${tarea.titulo}`}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 -mt-1 rounded-xl text-slate-400 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0"
                >
                  {tarea.completada ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <Circle className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  )}
                </button>

                {/* Contenido principal de la tarea */}
                <div className="flex-1 min-w-0 pt-0.5">
                  {/* Fila de metadatos limpios (sin pill badges estáticos, según directriz de diseño) */}
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-900">
                      {tarea.materia}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className={`font-medium ${
                      tarea.prioridad === 'Alta' ? 'text-rose-600 font-semibold' :
                      tarea.prioridad === 'Media' ? 'text-amber-600 font-semibold' : 'text-slate-500'
                    }`}>
                      Prioridad {tarea.prioridad}
                    </span>
                  </div>

                  {/* Título de la tarea */}
                  <h3
                    className={`text-sm sm:text-base font-semibold leading-snug break-words ${
                      tarea.completada
                        ? 'line-through text-slate-400'
                        : 'text-slate-900'
                    }`}
                  >
                    {tarea.titulo}
                  </h3>

                  {/* Fecha de entrega y estados contextuales */}
                  <div className="flex items-center flex-wrap gap-2 mt-2 text-xs">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-600" />
                      <span>{fechaInfo.texto}</span>
                    </div>

                    {/* Alerta de Vencida o Entrega Hoy */}
                    {vencida && (
                      <div className="flex items-center gap-1 font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>¡Vencida! ({fechaInfo.relativo})</span>
                      </div>
                    )}

                    {paraHoy && !vencida && (
                      <div className="flex items-center gap-1 font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        <span>⚠️ ¡Se entrega hoy!</span>
                      </div>
                    )}

                    {tarea.completada && (
                      <span className="text-emerald-700 font-medium">
                        ✓ Completada
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones: Botón de Eliminar con confirmación táctil segura */}
                <div className="shrink-0 flex items-center">
                  {confirmandoEliminar ? (
                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          alEliminarTarea(tarea.id);
                          setTareaAEliminar(null);
                        }}
                        className="min-h-[36px] px-2.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => setTareaAEliminar(null)}
                        className="min-h-[36px] px-2 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setTareaAEliminar(tarea.id)}
                      aria-label={`Eliminar tarea ${tarea.titulo}`}
                      title="Eliminar tarea"
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
