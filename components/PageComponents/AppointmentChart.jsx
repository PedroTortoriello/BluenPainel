"use client"

import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useEffect, useState } from "react"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

const locales = { "pt-BR": ptBR }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

export default function ScheduleCalendar() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // 🔹 controlar view e data explicitamente
  const [view, setView] = useState("week")
  const [currentDate, setCurrentDate] = useState(new Date())

  // ------------------------------------------------
  // 🔵 Carregar horários detalhados
  // ------------------------------------------------
  const loadAgenda = async () => {
    const { data, error } = await supabaseAdmin
      .from("agenda_horarios_detalhados")
      .select("*")
      .order("dia", { ascending: true })
      .order("horario", { ascending: true })

    if (error || !data) return []

    return data.map((item) => {
      // junta dia + horario em uma data válida
      const start = new Date(`${item.dia}T${item.horario}`)
      const end = new Date(start.getTime() + 30 * 60000) // 30min de slot

      return {
        id: item.id,
        title: item.status === "livre" ? "Disponível" : "Ocupado",
        start,
        end,
        type: item.status,
        color: item.status === "livre" ? "#22c55e" : "#ef4444",
      }
    })
  }

  const loadAll = async () => {
    try {
      setLoading(true)
      const disponiveis = await loadAgenda()
      setEvents(disponiveis)
    } catch (err) {
      console.error("Erro ao carregar calendário:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const handleOpenEvent = (event) => {
    if (event.type === "ocupado") {
      alert(`⛔ Ocupado\nInício: ${event.start}\nFim: ${event.end}`)
    } else {
      alert(`🟩 Disponível\nInício: ${event.start}\nFim: ${event.end}`)
    }
  }

  if (loading) {
    return <p className="p-4 text-gray-600">Carregando agenda...</p>
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        📅 Agenda (Horários Detalhados)
      </h2>

      <div style={{ height: "700px" }}>
        <Calendar
          localizer={localizer}
          events={events}
          // ✅ agora controlado
          view={view}
          onView={(newView) => setView(newView)}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          defaultView="week"
          views={["day", "week", "month"]}
          step={30}
          timeslots={1}
          popup
          onSelectEvent={handleOpenEvent}
          eventPropGetter={(event) => {
  const baseClass =
    event.type === "livre"
      ? "rbc-event-available"
      : "rbc-event-ocupado"

  return {
    className: baseClass,
    style: {
      borderRadius: "6px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
  }
}}

        />
      </div>
    </div>
  )
}
