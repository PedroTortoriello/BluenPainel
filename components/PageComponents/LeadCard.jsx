'use client'

import { Info } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function LeadCard({ lead }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lead.id })
  const [open, setOpen] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="relative p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md transition cursor-move"
      >
        <div className="text-sm font-semibold text-gray-900 truncate">{lead.Nome}</div>
        <div className="text-xs text-gray-500 truncate">{lead.Empresa || '-'}</div>
        <div className="text-xs text-gray-500">Ticket: {lead.Ticket || '-'}</div>

        <button
          onClick={() => setOpen(true)}
          className="absolute bottom-2 right-2 p-1.5 bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <Info className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Nome:</strong> {lead.Nome}</p>
            <p><strong>Empresa:</strong> {lead.Empresa}</p>
            <p><strong>Email:</strong> {lead.Email}</p>
            <p><strong>Telefone:</strong> {lead.Telefone}</p>
            <p><strong>Status:</strong> {lead.status}</p>
            <p><strong>Ticket:</strong> {lead.Ticket}</p>
            <p><strong>Observações:</strong> {lead.Observacoes}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
