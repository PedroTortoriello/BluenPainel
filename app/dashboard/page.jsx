'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Users,
  TrendingUp,
  Search,
  Plus,
  BarChart3,
  LogOut,
  Edit,
  Trash2,
  Target,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  CalendarIcon
} from 'lucide-react'
import KanbanBoard from '@/components/PageComponents/Kanban'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import InboxChat from '@/components/PageComponents/InboxChat'
import DashboardChart from '@/components/PageComponents/DashboardChart'
import ScheduleCalendar from '@/components/PageComponents/AppointmentChart'

export default function CRMDashboard() {
  const [leads, setLeads] = useState([])
  const [companies, setCompanies] = useState([])
  const [metrics, setMetrics] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [activeTab, setActiveTab] = useState('kanban')

  // Filters
  const [searchFilter, setSearchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ from: null, to: null })
// ESTADO ÚNICO PARA A AGENDA
const [agenda, setAgenda] = useState({
  horaInicio: "09:00",
  horaFim: "18:00",
  intervalo: 20,
  diasSelecionados: []
})
const [showSuggestionModal, setShowSuggestionModal] = useState(false)
const [suggestionText, setSuggestionText] = useState("")
const [sending, setSending] = useState(false)


const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const toggleDia = (index) => {
  setAgenda((prev) => ({
    ...prev,
    diasSelecionados: prev.diasSelecionados.includes(index)
      ? prev.diasSelecionados.filter((d) => d !== index)
      : [...prev.diasSelecionados, index],
  }))
}

const gerarHorarios = async () => {
  const { horaInicio, horaFim, intervalo, diasSelecionados } = agenda;

  try {
    // 1. Limpa horários antigos (se quiser resetar tudo sempre)
    await supabaseAdmin.from("agenda_horarios_detalhados").delete().neq("id", "");

    // 2. Gerar horários nos próximos 7 dias
    const hoje = new Date();
    const horariosParaInserir = [];

    for (let i = 0; i < 15; i++) {
      const dia = new Date();
      dia.setDate(hoje.getDate() + i);

      const diaSemana = dia.getDay(); // 0=Dom ... 6=Sat

      if (!diasSelecionados.includes(diaSemana)) continue;

      const [hI, mI] = horaInicio.split(":").map(Number);
      const [hF, mF] = horaFim.split(":").map(Number);

      let inicioMin = hI * 60 + mI;
      const fimMin = hF * 60 + mF;

      while (inicioMin < fimMin) {
        const hora = String(Math.floor(inicioMin / 60)).padStart(2, "0");
        const minuto = String(inicioMin % 60).padStart(2, "0");

        horariosParaInserir.push({
          dia: dia.toISOString().split("T")[0], // yyyy-mm-dd
          horario: `${hora}:${minuto}`,
          status: "livre",
        });

        inicioMin += intervalo;
      }
    }

    // 3. Inserir no banco
    const { error } = await supabaseAdmin
      .from("agenda_horarios_detalhados")
      .insert(horariosParaInserir);

    if (error) {
      console.error(error);
      alert("Erro ao salvar horários detalhados: " + error.message);
      return;
    }

    alert("Horários gerados com sucesso! 🎉");

  } catch (e) {
    console.error(e);
    alert("Erro inesperado: " + e.message);
  }
};



  const handleDateChange = (range) => {
    setDateRange(range)
    if (range?.from && range?.to) loadLeads(range.from, range.to)
  }

  const handleDateChange2 = (range) => {
    setDateRange(range)
    if (range?.from && range?.to) loadData(range.from, range.to)
  }

  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    cargo: '',
    source: '',
    status: 'novo',
    notes: '',
    priority: 'medio'
  })

  useEffect(() => {
    loadData()
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crm_token')
      localStorage.removeItem('crm_user')
    }
    setLeads([])
    setMetrics({})
  }

    // 🔹 Carregar todos os dados (métricas, leads, empresas)
/** @param {Date} [fromDate] @param {Date} [toDate] */
const loadData = async (fromDate, toDate) => {
  setLoading(true)
  try {
    let query = supabaseAdmin
      .from('BluenSDR')
      .select('*')
      .order('created_at', { ascending: false })

    // 🧩 Se datas forem passadas, aplica o filtro
    if (fromDate && toDate) {
      query = query
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString())
    }

    const { data: leadsData, error } = await query
    if (error) throw error

    const mappedLeads = leadsData.map((lead) => ({
      id: lead.id,
      name: lead['Nome'] || '—',
      email: lead['Email'] || '—',
      phone: lead['numero'] || '—',
      company: lead['Empresa'] || '—',
      cargo: lead['cargo'] || '—',
      status: lead['status'] || 'Novo',
      notes: lead['observacoes'] || '—',
      followUp: lead['FollowUp'] || false,
      date: lead['Data'] || lead['created_at'],
      ticket: lead['Ticket'] || null,
      whatCompanyDoes: lead['o_que_a_empresa_faz'] || '—',
      customerProblem: lead['problema_do_cliente'] || '—',
      needs: lead['necessidades'] || null,
    }))

    setLeads(mappedLeads)

    // 🧮 Recalcula métricas com base no filtro
    const statusCounts = mappedLeads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {})

    setMetrics({
      totalLeads: mappedLeads.length,
      statusCounts,
    })

    const companiesData = [...new Set(mappedLeads.map((l) => l.company).filter(Boolean))]
    setCompanies(companiesData)
  } catch (error) {
    console.error('Erro ao carregar leads:', error.message)
  } finally {
    setLoading(false)
  }
}


/** @param {Date} [fromDate] @param {Date} [toDate] */
const loadLeads = async (fromDate, toDate) => {
  setLoading(true)
  try {
    let query = supabaseAdmin
      .from('BluenSDR')
      .select('*')
      .order('created_at', { ascending: false })

    if (fromDate && toDate) {
      query = query
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString())
    }

    const { data, error } = await query
    if (error) throw error

  const mappedLeads = data.map((lead) => {
  let necessidades = null
  let necessidade_principal = null
  let servico_interesse = null
  let detalhamento = null

  if (lead.necessidades) {
    try {
      // remove aspas extras externas, se existirem
      let cleaned = lead.necessidades.trim()

      // caso venha como "\"{...}\"", remove aspas do início e fim
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1)
      }

      // tenta fazer o primeiro parse
      let parsed = JSON.parse(cleaned)

      // se ainda assim for string (dupla codificação), parse de novo
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed)
      }

      necessidades = parsed
      necessidade_principal = parsed.necessidade_principal || null
      servico_interesse = parsed.servico_interesse || null
      detalhamento = parsed.detalhamento || null
    } catch (e) {
      console.warn('Erro ao parsear necessidades:', e.message, lead.necessidades)
    }
  }

  return {
    id: lead.id,
    name: lead['Nome'] || '—',
    email: lead['Email'] || '—',
    phone: lead['numero'] || '—',
    company: lead['Empresa'] || '—',
    cargo: lead['cargo'] || '—',
    status:
    lead['status'] === 'novo' ? 'Novo' :
    lead['status'] === 'agendado' ? 'Agendado' :
    lead['status'] === 'proposta' ? 'Proposta' :
    lead['status'] === 'fechado' ? 'Fechado' :
    lead['status'] === 'recusado' ? 'Recusado' :
    lead['status'] || 'Novo',

    followUp: lead['FollowUp'] || false,
    date: lead['Data'] || lead['created_at'],
    ticket: lead['Ticket'] || null,
    whatCompanyDoes: lead['o_que_a_empresa_faz'] || '—',
    customerProblem: lead['problema_do_cliente'] || '—',
    necessidades,
    necessidade_principal,
    servico_interesse,
    detalhamento,
  }
})


    setLeads(mappedLeads)
  } catch (error) {
    console.error('Erro ao carregar leads filtrados:', error.message)
  } finally {
    setLoading(false)
  }
}



  const handleSaveLead = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (selectedLead) {
        const { error } = await supabaseAdmin
          .from('BluenSDR')
          .update({
            nome: leadForm.name,
            e_mail: leadForm.email,
            numero: leadForm.phone,
            empresa: leadForm.company,
            cargo: leadForm.cargo,
            source: leadForm.source,
            status: leadForm.status,
            observacoes: leadForm.notes,
            priority: leadForm.priority,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedLead.id)

        if (error) throw error
      } else {
        const { error } = await supabaseAdmin.from('BluenSDR').insert({
          nome: leadForm.name,
          e_mail: leadForm.email,
          numero: leadForm.phone,
          empresa: leadForm.company,
          cargo: leadForm.cargo,
          source: leadForm.source,
          status: leadForm.status,
          observacoes: leadForm.notes,
          priority: leadForm.priority,
          created_at: new Date().toISOString()
        })

        if (error) throw error
      }

      setShowLeadModal(false)
      setSelectedLead(null)
      resetLeadForm()
      loadData()
    } catch (error) {
      alert('Erro ao salvar lead: ' + error.message)
    } finally {
      setLoading(false)
    }
  }
const capitalize = (text) => {
  if (!text) return '-'
  return text.charAt(0).toUpperCase() + text.slice(1)
}

  const handleDeleteLead = async (leadId) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return

    try {
      const { error } = await supabaseAdmin.from('BluenSDR').delete().eq('id', leadId)
      if (error) throw error
      loadLeads()
    } catch (error) {
      alert('Erro ao excluir lead: ' + error.message)
    }
  }

  const getTicketStatus = (ticket) => {
    if (!ticket || ticket <= 40000)
      return { label: 'Frio', color: 'bg-blue-500', textColor: 'text-white', icon: Clock }
    if (ticket > 40000 && ticket <= 100000)
      return { label: 'Morno', color: 'bg-yellow-500', textColor: 'text-white', icon: Activity }
    if (ticket > 100000 && ticket <= 300000)
      return { label: 'Quente', color: 'bg-orange-500', textColor: 'text-white', icon: TrendingUp }
    if (ticket > 300000)
      return { label: 'Alta Prioridade', color: 'bg-red-500', textColor: 'text-white', icon: Target }

    return { label: 'Sem Faturamento', color: 'bg-gray-500', textColor: 'text-white', icon: AlertCircle }
  }

  const resetLeadForm = () => {
    setLeadForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      cargo: '',
      source: '',
      status: 'novo',
      notes: '',
      priority: 'medio'
    })
  }

const openLeadModal = (lead = null) => {
  if (lead) {
    setSelectedLead(lead)
    setLeadForm({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      cargo: lead.cargo || '',
      source: lead.source || '',
      status: lead.status || 'novo',
      notes: capitalize(lead.customerProblem) || '',
      priority: lead.priority || 'medio'
    })
  } else {
    setSelectedLead(null)
    resetLeadForm()
  }

  setShowLeadModal(true)
}


const LeadModal = () => {
  const capitalize = (text) => {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  const appointmentsData = [
  { dia: "01/02", total: 120, studio: 70, equipamento: 30, outros: 20 },
  { dia: "02/02", total: 110, studio: 60, equipamento: 35, outros: 15 },
  { dia: "03/02", total: 95, studio: 50, equipamento: 30, outros: 15 },
  { dia: "04/02", total: 160, studio: 90, equipamento: 50, outros: 20 },
  { dia: "05/02", total: 200, studio: 120, equipamento: 60, outros: 20 },
]





  return (
    
    <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Detalhes do Lead
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* Inputs SOMENTE LEITURA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'Nome' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Telefone' },
              { key: 'company', label: 'Empresa' },
              { key: 'cargo', label: 'Cargo' },
            ].map((field, i) => (
              <div key={i} className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">{field.label}</Label>

                <Input
                  readOnly
                  value={leadForm[field.key] || ''}
                  className="border-gray-300 bg-gray-100 cursor-not-allowed"
                />
              </div>
            ))}

            {/* Origem - somente leitura */}
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select disabled>
                <SelectTrigger className="bg-gray-100 cursor-not-allowed">
                  <SelectValue placeholder={leadForm.source || '—'} />
                </SelectTrigger>
              </Select>
            </div>

            {/* Status - somente leitura */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select disabled>
                <SelectTrigger className="bg-gray-100 cursor-not-allowed">
                  <SelectValue placeholder={leadForm.status || '—'} />
                </SelectTrigger>
              </Select>
            </div>
          </div>

          {/* Observações SOMENTE LEITURA */}
          <div>
            <Label>Observações</Label>
            <Textarea
              readOnly
              value={leadForm.notes || ''}
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => setShowLeadModal(false)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Fechar
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}

const SuggestionModal = () => (
  <Dialog open={showSuggestionModal} onOpenChange={setShowSuggestionModal}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">💡 Sugerir Melhorias</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <p className="text-gray-600">
          Conte o que podemos melhorar no sistema. Qualquer detalhe ajuda!
        </p>

        <div className="space-y-2">
          <Label>Sua Sugestão</Label>
          <Textarea
            placeholder="Explique sua sugestão aqui..."
            rows={5}
            value={suggestionText}
            onChange={(e) => setSuggestionText(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setShowSuggestionModal(false)}
          >
            Cancelar
          </Button>

          <Button
            disabled={sending || suggestionText.trim() === ""}
            onClick={async () => {
              setSending(true)

              try {
                // Salvar no Supabase (opcional — edite se já tiver tabela)
                await supabaseAdmin.from("Sugestoes").insert({
                  texto: suggestionText,
                  created_at: new Date().toISOString()
                })

                setSuggestionText("")
                setShowSuggestionModal(false)

                // Feedback ao usuário
                alert("Obrigada por enviar sua sugestão ❤️")
              } catch (error) {
                alert("Erro ao enviar sugestão: " + error.message)
              } finally {
                setSending(false)
              }
            }}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {sending ? "Enviando..." : "Enviar Sugestão"}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
        <header className="bg-blue-600 border-b shadow-sm sticky top-0 z-50">
          <div className="max-w-9xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* 🔹 Logo à esquerda */}
            <div className="flex items-center gap-3">
              <Image src='https://eaqifsfjoykjhcfcnibk.supabase.co/storage/v1/object/public/images/Logo.png' alt="Logo" width={180} height={180} className="cursor-pointer" />
            </div>
<div className="flex items-center gap-3">
<Button
  onClick={() => setShowSuggestionModal(true)}
  className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 px-3"
>
  ⭐ Sugerir melhoras
</Button>

      <Button
        variant="outline"
        onClick={handleLogout}
        className="flex items-center gap-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all"
      >
        <LogOut className="h-4 w-4" /> 
        <span className="font-medium">Sair</span>
      </Button>
    </div>
          </div>
        </header>

      <main className="max-w-9xl mx-auto px-6 py-10 space-y-8">
        <Tabs defaultValue="kanban" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 gap-1 bg-white border rounded-xl shadow-sm p-1">
            <TabsTrigger value="kanban" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" /> CRM
            </TabsTrigger>            
            <TabsTrigger value="inbox" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Atendimentos
            </TabsTrigger>   
            <TabsTrigger value="leads" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" /> Leads
            </TabsTrigger>  
            <TabsTrigger value="agendamentos" className="data-[state=active]:bg-blue-800 data-[state=active]:text-white">Agendamentos</TabsTrigger>
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-800 data-[state=active]:text-white">Indicadores</TabsTrigger>
          
          </TabsList>

            {/* ✅ DASHBOARD TAB */}
            <TabsContent value="dashboard" className="space-y-6">

              {/* 🔹 Filtro de Datas */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700">📅 Período de Análise</h2>
                  <p className="text-sm text-gray-500">Selecione um intervalo de tempo para atualizar os dados do dashboard.</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Opções rápidas */}
                  {[
                    { label: 'Hoje', range: { from: new Date(), to: new Date() } },
                    { label: 'Ontem', range: { from: new Date(Date.now() - 86400000), to: new Date(Date.now() - 86400000) } },
                    { label: 'Últimos 7 dias', range: { from: new Date(Date.now() - 6 * 86400000), to: new Date() } },
                    { label: 'Últimos 30 dias', range: { from: new Date(Date.now() - 29 * 86400000), to: new Date() } },
                  ].map((opt) => (
                    <Button
                      key={opt.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDateChange2(opt.range)}
                      className="text-sm"
                    >
                      {opt.label}
                    </Button>
                  ))}

                  {/* Calendário personalizado */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal border-gray-300"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from && dateRange?.to
                          ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                          : 'Selecionar período'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="end">
                      <Calendar
                        initialFocus
                        mode="range"
                        selected={dateRange}
                        onSelect={handleDateChange}
                        locale={ptBR}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* 🔹 Cards de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Total de Leads</CardTitle>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{metrics.totalLeads || 0}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-green-600 font-semibold">↗ +12%</span> vs. mês anterior
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Leads Qualificados</CardTitle>
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{metrics.statusCounts?.qualificado || 0}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-green-600 font-semibold">↗ +8%</span> vs. mês anterior
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Propostas</CardTitle>
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{metrics.statusCounts?.proposta || 0}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-green-600 font-semibold">↗ +15%</span> vs. mês anterior
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Fechados</CardTitle>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{metrics.statusCounts?.fechado || 0}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-green-600 font-semibold">↗ +20%</span> vs. mês anterior
                    </p>
                  </CardContent>
                </Card>
              </div>
              {/* 🔹 Gráfico de Indicadores */}
              <DashboardChart leads={leads} />

            </TabsContent>

            <TabsContent value="agendamentos" className="space-y-6">
              {/* <ScheduleCalendar/> */}
            </TabsContent>



          {/* ✅ LEADS TAB */}
          <TabsContent value="leads" className="space-y-6">
            {/* Filtros */}
            <Card className="shadow-sm border">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative sm:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar por nome, email ou empresa"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="contatado">Contatado</SelectItem>
                        <SelectItem value="qualificado">Qualificado</SelectItem>
                        <SelectItem value="proposta">Proposta</SelectItem>
                        <SelectItem value="fechado">Fechado</SelectItem>
                        <SelectItem value="perdido">Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Opções rápidas */}
                  {[
                    { label: 'Hoje', range: { from: new Date(), to: new Date() } },
                    { label: 'Ontem', range: { from: new Date(Date.now() - 86400000), to: new Date(Date.now() - 86400000) } },
                    { label: 'Últimos 7 dias', range: { from: new Date(Date.now() - 6 * 86400000), to: new Date() } },
                    { label: 'Últimos 30 dias', range: { from: new Date(Date.now() - 29 * 86400000), to: new Date() } },
                  ].map((opt) => (
                    <Button
                      key={opt.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDateChange2(opt.range)}
                      className="text-sm"
                    >
                      {opt.label}
                    </Button>
                  ))}

                  {/* Calendário personalizado */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal border-gray-300"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from && dateRange?.to
                          ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                          : 'Selecionar período'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="end">
                      <Calendar
                        initialFocus
                        mode="range"
                        selected={dateRange}
                        onSelect={handleDateChange}
                        locale={ptBR}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Leads */}
            <Card className="shadow-sm border">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-16 text-center text-gray-600">Carregando leads...</div>
                ) : leads.length === 0 ? (
                  <div className="p-16 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Nenhum lead encontrado</p>
                    <Button onClick={() => openLeadModal()} className="mt-4 bg-blue-600 text-white">
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Lead
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b text-xs uppercase tracking-wide text-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left">Nome</th>
                          <th className="px-6 py-3 text-left">Empresa</th>
                          <th className="px-6 py-3 text-left">Necessidade</th>
                          <th className="px-6 py-3 text-left">Status</th>
                          <th className="px-6 py-3 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {leads.map((lead) => {
                          const ticketStatus = getTicketStatus(lead.ticket)
                          const Icon = ticketStatus.icon
                          return (
                            <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-semibold">{lead.name}</div>
                                <div className="text-xs text-gray-500">{lead.email}</div>
                              </td>
                              <td className="px-6 py-4">{lead.company || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                <Badge>{capitalize(lead.customerProblem)}</Badge>
                              </td>
                              <td className="px-6 py-4">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${ticketStatus.color} ${ticketStatus.textColor}`}>
                                  <Icon className="h-4 w-4" />
                                  {ticketStatus.label}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <Button variant="ghost" onClick={() => openLeadModal(lead)}>
                                  <Edit className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button variant="ghost" onClick={() => handleDeleteLead(lead.id)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agendamentos">
            <ScheduleCalendar />

            <Card className="border shadow-sm mt-20">
    <CardHeader>
      <CardTitle>Gerar Horários Disponíveis</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Horário de início</Label>
          <Input
            type="time"
value={agenda.horaInicio}
onChange={(e) =>
  setAgenda({ ...agenda, horaInicio: e.target.value })
}
          />
        </div>

        <div>
          <Label>Horário de fim</Label>
          <Input
            type="time"
  value={agenda.horaFim}
  onChange={(e) =>
    setAgenda({ ...agenda, horaFim: e.target.value })
  }
          />
        </div>

        <div>
          <Label>Intervalo (minutos)</Label>
          <Input
            type="number"
           value={agenda.intervalo}
  onChange={(e) =>
    setAgenda({ ...agenda, intervalo: Number(e.target.value) })
  }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
        {diasSemana.map((dia, index) => (
<Button
  key={index}
  variant={agenda.diasSelecionados.includes(index) ? "default" : "outline"}
  onClick={() => toggleDia(index)}
>
  {dia}
</Button>
        ))}
      </div>

      <Button
        className="bg-blue-600 text-white"
        onClick={gerarHorarios}
      >
        Gerar horários e enviar para o calendário
      </Button>

    </CardContent>
  </Card>

          </TabsContent>

          <TabsContent value="inbox">
            <InboxChat />
          </TabsContent>

          <TabsContent value="kanban">
            <KanbanBoard leads={leads} onStatusChange={loadLeads} />
          </TabsContent>

        </Tabs>
      </main>
        <SuggestionModal />
      <LeadModal />
    </div>
  )
}
