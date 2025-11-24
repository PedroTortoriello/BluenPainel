"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LeadModal({ showLeadModal, setShowLeadModal, leadForm, setLeadForm, handleSaveLead, loading, selectedLead }) {
  return (
    <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedLead ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSaveLead} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome *</Label>
              <Input value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} required />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} required />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} />
            </div>
            <div>
              <Label>Empresa</Label>
              <Input value={leadForm.company} onChange={e => setLeadForm({...leadForm, company: e.target.value})} />
            </div>
            <div>
              <Label>Cargo</Label>
              <Input value={leadForm.position} onChange={e => setLeadForm({...leadForm, position: e.target.value})} />
            </div>
            <div>
              <Label>Origem</Label>
              <Select value={leadForm.source} onValueChange={value => setLeadForm({...leadForm, source: value})}>
                <SelectTrigger><SelectValue placeholder="Selecione a origem" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="site">Site</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="telefone">Telefone</SelectItem>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                  <SelectItem value="n8n">N8N</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={leadForm.status} onValueChange={value => setLeadForm({...leadForm, status: value})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="contatado">Contatado</SelectItem>
                  <SelectItem value="qualificado">Qualificado</SelectItem>
                  <SelectItem value="proposta">Proposta</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={leadForm.priority} onValueChange={value => setLeadForm({...leadForm, priority: value})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">Baixa</SelectItem>
                  <SelectItem value="medio">Média</SelectItem>
                  <SelectItem value="alto">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={leadForm.notes} onChange={e => setLeadForm({...leadForm, notes: e.target.value})} rows={3} />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowLeadModal(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
