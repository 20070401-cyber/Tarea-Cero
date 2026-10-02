/**
 * Componente: Indicadores Rápidos
 * Muestra el estado global de la carga académica del estudiante de bachillerato:
 * 1. Tareas pendientes totales
 * 2. Tareas vencidas (atención prioritaria)
 * 3. Tareas entregadas hoy (refuerzo positivo de productividad)
 */

import React from 'react';
import { AlertTriangle, CheckCircle, Clock, CalendarDays } from 'lucide-react';
import { MetricasTareas } from '../types/tarea';

interface IndicadoresRapidosProps {
  metricas: MetricasTareas;
  filtroActivo: 'pendientes' | 'completadas' | 'todas';
  alSeleccionarFiltro: (filtro: 'pendientes' | 'completadas' | 'todas') => void;
}

export const IndicadoresRapidos: React.FC<IndicadoresRapidosProps> = ({
  metricas,
  filtroActivo,
  alSeleccionarFiltro
}) => {
  return (
    <section aria-label="Indicadores rápidos de tareas" className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Tarjeta 1: Pendientes Totales */}
        <button
          type="button"
          onClick={() => alSeleccionarFiltro('pendientes')}
          className={`flex flex-col p-3.5 rounded-2xl text-left transition-all border ${
            filtroActivo === 'pendientes'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pendientes
            </span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {metricas.totalPendientes}
            </span>
            <span className="text-xs text-slate-500 font-medium">por hacer</span>
          </div>
        </button>

        {/* Tarjeta 2: Vencidas (Alerta) */}
        <div
          className={`flex flex-col p-3.5 rounded-2xl border transition-all ${
            metricas.vencidas > 0
              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
              : 'bg-white border-slate-200/80 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              metricas.vencidas > 0 ? 'text-rose-700' : 'text-slate-500'
            }`}>
              Vencidas
            </span>
            <AlertTriangle className={`w-4 h-4 ${
              metricas.vencidas > 0 ? 'text-rose-600' : 'text-slate-400'
            }`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${
              metricas.vencidas > 0 ? 'text-rose-700' : 'text-slate-900'
            }`}>
              {metricas.vencidas}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {metricas.vencidas === 1 ? 'atrasada' : 'atrasadas'}
            </span>
          </div>
        </div>

        {/* Tarjeta 3: Vencen Hoy */}
        <div className="flex flex-col p-3.5 rounded-2xl bg-white border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Para Hoy
            </span>
            <CalendarDays className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {metricas.paraHoy}
            </span>
            <span className="text-xs text-slate-500 font-medium">entregan hoy</span>
          </div>
        </div>

        {/* Tarjeta 4: Entregadas Hoy */}
        <button
          type="button"
          onClick={() => alSeleccionarFiltro('completadas')}
          className={`flex flex-col p-3.5 rounded-2xl text-left transition-all border ${
            filtroActivo === 'completadas'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Entregadas hoy
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-700 tabular-nums">
              {metricas.entregadasHoy}
            </span>
            <span className="text-xs text-slate-500 font-medium">logradas</span>
          </div>
        </button>
      </div>
    </section>
  );
};
