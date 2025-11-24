'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/app/api/api'


export default function ChatwootInbox() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    setLoading(true)
    try {
      // Chama sua rota única /api/chatwoot
      const res = await api.get('/api/chatwoot')
      setConversations(res.data.conversations || [])
    } catch (err) {
      console.error('Erro ao carregar conversas:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Caixa de Entrada</h2>
      {loading ? (
        <p>Carregando conversas...</p>
      ) : conversations.length === 0 ? (
        <p>Nenhuma conversa encontrada.</p>
      ) : (
        <div className="space-y-4">
          {conversations.map(conv => (
            <Card key={conv.id}>
              <CardHeader>
                <CardTitle>{conv.contact_inbox?.contact?.name || 'Sem nome'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Status: {conv.status}</p>
                <p>Prioridade: {conv.priority}</p>
                <p>Última mensagem: {conv.messages?.[conv.messages.length - 1]?.content || '-'}</p>
                <Button size="sm" onClick={() => alert('Abrir conversa')}>Abrir</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
