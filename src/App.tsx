/**
 * Tarea Cero - Aplicación principal
 * 
 * Cumplimiento de requisitos de interfaz:
 * 1. Uso fluido desde 320 px de ancho con una sola mano, sin necesidad de hacer zoom.
 * 2. Contraste óptimo para exteriores y lectura bajo el sol; texto nunca menor a 16 px.
 * 3. Todos los campos de entrada cuentan con etiqueta visible.
 * 4. UN SOLO botón principal por pantalla: "+ Agregar Tarea"; los demás son secundarios.
 * 5. Estado vacío con la frase animada:
 *    "🎉 ¡Felicidades! No tienes tareas pendientes. Toca '+' para agregar una."
 * 6. Mensajes de éxito y error visibles, en español y sin terminología técnica.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CheckSquare, BookOpen, GraduationCap, Download, RotateCcw, CheckCircle2, X } from 'lucide-react';
import { Tarea, FiltroEstado, MetricasTareas } from './types/tarea';
import { estaVencida, esParaHoy, esFechaDeHoy } from './utils/dateUtils';
import {
  cargarTareasDesdeStorage,
  guardarTareasEnStorage,
  exportarTareasAJSON,
  borrarTareasDeStorage,
  generarTareasIniciales
} from './utils/storage';
import { IndicadoresRapidos } from './components/IndicadoresRapidos';
import { FormularioTarea } from './components/FormularioTarea';
import { ListaTareas } from './components/ListaTareas';

function generarIdSeguro(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `tarea-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function App() {
  const [tareas, setTareas] = useState<Tarea[]>(() => cargarTareasDesdeStorage());
  const [filtroActivo, setFiltroActivo] = useState<FiltroEstado>('pendientes');

  // Mensaje de éxito visible en español claro (desaparece a los 4 segundos o al cerrarlo)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    guardarTareasEnStorage(tareas);
  }, [tareas]);

  // Temporizador para limpiar el mensaje de éxito
  useEffect(() => {
    if (!mensajeExito) return;
    const timer = setTimeout(() => {
      setMensajeExito(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [mensajeExito]);

  const metricas: MetricasTareas = useMemo(() => {
    let totalPendientes = 0;
    let vencidas = 0;
    let entregadasHoy = 0;
    let paraHoy = 0;

    for (const tarea of tareas) {
      if (!tarea.completada) {
        totalPendientes++;
        if (estaVencida(tarea.fechaEntrega)) {
          vencidas++;
        } else if (esParaHoy(tarea.fechaEntrega)) {
          paraHoy++;
        }
      } else {
        if (esFechaDeHoy(tarea.completadaEn)) {
          entregadasHoy++;
        }
      }
    }

    return { totalPendientes, vencidas, entregadasHoy, paraHoy };
  }, [tareas]);

  /**
   * Registrar nueva tarea con mensaje de éxito visible
   */
  const agregarTarea = (datosNuevaTarea: Omit<Tarea, 'id' | 'completada' | 'creadaEn'>) => {
    // Evitar tareas idénticas duplicadas en pendientes
    const yaExiste = tareas.some(
      (t) =>
        !t.completada &&
        t.materia.toLowerCase() === datosNuevaTarea.materia.toLowerCase() &&
        t.titulo.toLowerCase() === datosNuevaTarea.titulo.toLowerCase() &&
        t.fechaEntrega === datosNuevaTarea.fechaEntrega
    );

    if (yaExiste) {
      setMensajeExito(`Aviso: Ya tienes anotada esta misma tarea de ${datosNuevaTarea.materia}.`);
      return;
    }

    const nueva: Tarea = {
      ...datosNuevaTarea,
      id: generarIdSeguro(),
      completada: false,
      creadaEn: new Date().toISOString()
    };

    setTareas((prev) => [nueva, ...prev]);
    setMensajeExito('¡Tarea guardada con éxito! Ya la puedes ver en tu lista.');

    if (filtroActivo === 'completadas') {
      setFiltroActivo('pendientes');
    }
  };

  /**
   * Alternar estado de completada con mensaje de éxito visible
   */
  const alternarCompletada = (id: string) => {
    setTareas((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        const nuevoEstado = !t.completada;
        if (nuevoEstado) {
          setMensajeExito(`¡Excelente trabajo! Marcaste como terminada la tarea de ${t.materia}.`);
        } else {
          setMensajeExito(`La tarea de ${t.materia} volvió a tu lista de pendientes.`);
        }

        return {
          ...t,
          completada: nuevoEstado,
          completadaEn: nuevoEstado ? new Date().toISOString() : undefined
        };
      })
    );
  };

  /**
   * Eliminar tarea con confirmación
   */
  const eliminarTarea = (id: string) => {
    setTareas((prev) => prev.filter((t) => t.id !== id));
    setMensajeExito('La tarea fue eliminada de tu lista.');
  };

  /**
   * Restablecer 3 tareas de ejemplo
   */
  const restablecerEjemplos = () => {
    borrarTareasDeStorage();
    const iniciales = generarTareasIniciales();
    setTareas(iniciales);
    guardarTareasEnStorage(iniciales);
    setMensajeExito('Se restablecieron las 3 tareas de ejemplo.');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* 
        Barra superior: Todos los botones son SECUNDARIOS para preservar 
        "+ Agregar Tarea" como único botón principal en pantalla.
      */}
      <header className="sticky top-0 z-30 bg-white/98 backdrop-blur-md border-b-2 border-slate-300">
        <div className="max-w-2xl mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-2">
          {/* Marca con alto contraste */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center shadow-xs">
              <CheckSquare className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-950 block leading-tight">
                TAREA CERO
              </span>
            </div>
          </div>

          {/* Acciones secundarias en barra superior */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-base text-slate-800 font-bold bg-slate-100 border border-slate-300 px-3 py-1 rounded-lg">
              <GraduationCap className="w-4 h-4 text-indigo-700" />
              <span>Bachillerato</span>
            </span>

            {/* Botón secundario para respaldar */}
            <button
              type="button"
              onClick={() => exportarTareasAJSON(tareas)}
              title="Descargar copia de seguridad en archivo JSON"
              className="text-base font-bold px-3 py-2 rounded-xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900 transition-colors flex items-center gap-1.5 min-h-[44px]"
            >
              <Download className="w-4 h-4 text-indigo-700" />
              <span>Respaldar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido centrado y totalmente accesible desde 320 px */}
      <main className="max-w-2xl mx-auto px-3 sm:px-5 pt-4 space-y-4">
        {/* REQUISITO 6: Mensaje de éxito visible en español claro */}
        {mensajeExito && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 p-4 bg-emerald-100 border-2 border-emerald-500 text-emerald-950 rounded-2xl shadow-sm text-base font-bold animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
              <span>{mensajeExito}</span>
            </div>
            <button
              type="button"
              onClick={() => setMensajeExito(null)}
              aria-label="Cerrar mensaje"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-emerald-800 hover:text-emerald-950 rounded-lg hover:bg-emerald-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Encabezado descriptivo con texto >= 16 px */}
        <section className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-300 shadow-xs">
          <div className="flex items-center gap-2 text-base font-extrabold text-indigo-800 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Organizador escolar</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 leading-tight">
            Tus tareas escolares al día
          </h1>
          <p className="text-base font-semibold text-slate-700 mt-1.5 leading-relaxed">
            Revisa qué debes entregar hoy y mantén tu lista de pendientes en cero.
          </p>
        </section>

        {/* Indicadores rápidos (2x2 en 320 px, texto >= 16 px, alto contraste) */}
        <IndicadoresRapidos
          metricas={metricas}
          filtroActivo={filtroActivo}
          alSeleccionarFiltro={(nuevoFiltro) => setFiltroActivo(nuevoFiltro)}
        />

        {/* Formulario con el ÚNICO botón principal ("+ Agregar Tarea") */}
        <FormularioTarea alGuardarTarea={agregarTarea} />

        {/* Lista visual con estado vacío animado y filtros secundarios */}
        <ListaTareas
          tareas={tareas}
          filtro={filtroActivo}
          alCambiarFiltro={setFiltroActivo}
          alAlternarCompletada={alternarCompletada}
          alEliminarTarea={eliminarTarea}
        />

        {/* Pie de página accesible */}
        <footer className="pt-6 pb-4 text-center flex flex-col sm:flex-row items-center justify-between gap-3 text-base text-slate-700 font-semibold border-t-2 border-slate-300">
          <span>Datos guardados en tu dispositivo</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={restablecerEjemplos}
              className="text-slate-800 hover:text-indigo-800 transition-colors flex items-center gap-1.5 underline decoration-slate-400 p-2 min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restablecer ejemplos</span>
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
