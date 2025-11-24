'use client'

import { useEffect, useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Loader2, Search } from 'lucide-react'

export default function InboxChat() {
  const [contacts, setContacts] = useState([])
  const [selectedJid, setSelectedJid] = useState(null)
  const [messages, setMessages] = useState([])
  const [groupParticipants, setGroupParticipants] = useState({})
  const [messageInput, setMessageInput] = useState('')
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef(null)

  const API_URL = 'https://evolution.iabluen.com.br'
  const API_KEY = 'EB014F87BA9C-4762-B328-78C028106E4D'
  const INSTANCE = 'Bluen'

  // ===================== CONTATOS =====================
  const loadContacts = async () => {
    try {
      setLoadingContacts(true)

      // 1️⃣ Busca contatos salvos
      const resContacts = await fetch(`${API_URL}/chat/findContacts/${INSTANCE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: API_KEY },
        body: JSON.stringify({ where: {} }),
      })
      const dataContacts = await resContacts.json()
      let contatos = Array.isArray(dataContacts)
        ? dataContacts
        : dataContacts?.data || dataContacts?.contacts || []

      // 2️⃣ Busca mensagens recentes (garante que contatos com mensagens apareçam)
      const resMessages = await fetch(`${API_URL}/chat/findMessages/${INSTANCE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: API_KEY },
        body: JSON.stringify({ limit: 1000 }),
      })
      const dataMessages = await resMessages.json()
      const mensagens = Array.isArray(dataMessages?.messages)
        ? dataMessages.messages
        : dataMessages?.messages?.records || []

      // 3️⃣ Agrupa mensagens por JID (contatos reais)
      const mensagensMap = {}
      for (const msg of mensagens) {
        const jid = msg.key?.remoteJid
        if (jid?.endsWith('@s.whatsapp.net')) {
          if (!mensagensMap[jid] || msg.messageTimestamp > mensagensMap[jid].messageTimestamp) {
            mensagensMap[jid] = msg
          }
        }
      }

      // 4️⃣ Combina mensagens + contatos
      const contatosComMensagens = Object.keys(mensagensMap).map((jid) => ({
        remoteJid: jid,
        lastMessage: mensagensMap[jid].message,
        lastMessageTimestamp: mensagensMap[jid].messageTimestamp,
      }))

      // 5️⃣ Junta os contatos existentes com os que vieram das mensagens
      const todos = [...contatos, ...contatosComMensagens]
      const unicos = []
      const vistos = new Set()

      for (const c of todos) {
        const jid = c.remoteJid || ''
        if (jid.endsWith('@s.whatsapp.net') && !vistos.has(jid)) {
          vistos.add(jid)
          unicos.push(c)
        }
      }

      // 6️⃣ Ordena do mais recente pro mais antigo
      unicos.sort((a, b) => {
        const getTimestamp = (c) =>
          c.lastMessage?.messageTimestamp ||
          c.lastMessageTimestamp ||
          (c.updatedAt ? new Date(c.updatedAt).getTime() / 1000 : 0) ||
          0
        return getTimestamp(b) - getTimestamp(a)
      })

      setContacts(unicos)
    } catch (e) {
      console.error('Erro ao carregar contatos:', e)
    } finally {
      setLoadingContacts(false)
    }
  }

  // ===================== PARTICIPANTES DE GRUPO =====================
  const loadGroupParticipants = async (groupJid) => {
    if (groupParticipants[groupJid]) return

    try {
      const res = await fetch(
        `${API_URL}/group/participants/${INSTANCE}?groupJid=${encodeURIComponent(groupJid)}`,
        {
          method: 'GET',
          headers: { apikey: API_KEY },
        }
      )
      const data = await res.json()
      if (data?.participants) {
        setGroupParticipants((prev) => ({
          ...prev,
          [groupJid]: data.participants,
        }))
      }
    } catch (e) {
      console.error('Erro ao buscar participantes do grupo:', e)
    }
  }

  // ===================== MENSAGENS =====================
  const loadMessages = async (remoteJid) => {
    try {
      setLoadingMessages(true)
      setMessages([])
      setSelectedJid(remoteJid)

      if (remoteJid.endsWith('@g.us')) {
        await loadGroupParticipants(remoteJid)
      }

      const res = await fetch(`${API_URL}/chat/findMessages/${INSTANCE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: API_KEY },
        body: JSON.stringify({
          where: { key: { remoteJid } },
        }),
      })

      const data = await res.json()
      let mensagens = []
      if (Array.isArray(data)) mensagens = data
      else if (Array.isArray(data?.messages?.records)) mensagens = data.messages.records
      else if (Array.isArray(data?.messages)) mensagens = data.messages

      mensagens = mensagens.filter((m) => m?.key?.remoteJid === remoteJid)
      mensagens.sort((a, b) => (a.messageTimestamp || 0) - (b.messageTimestamp || 0))
      setMessages(mensagens)
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err)
    } finally {
      setLoadingMessages(false)
    }
  }

  // ===================== ENVIO DE MENSAGEM =====================
  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedJid) return

    const optimistic = {
      key: { fromMe: true, remoteJid: selectedJid },
      message: { conversation: messageInput },
      messageTimestamp: Math.floor(Date.now() / 1000),
    }
    setMessages((prev) => [...prev, optimistic])
    const textToSend = messageInput
    setMessageInput('')

    try {
      await fetch(`${API_URL}/message/sendText/${INSTANCE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: API_KEY },
        body: JSON.stringify({
          number: selectedJid.replace('@s.whatsapp.net', ''),
          text: textToSend,
        }),
      })
    } catch (e) {
      console.error('Erro ao enviar mensagem:', e)
    }
  }

  // ===================== SCROLL E INICIALIZAÇÃO =====================
  useEffect(() => { loadContacts() }, [])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const displayNameFromJid = (jid) =>
    jid?.replace('@s.whatsapp.net', '').replace('@g.us', '')

  // ===================== RENDER =====================
  return (
    <div className="flex h-[80vh] bg-white rounded-xl shadow border overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-3 border-b flex items-center gap-2">
          <Search className="text-gray-400 h-4 w-4" />
          <Input placeholder="Buscar contatos..." className="text-sm" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingContacts ? (
            <div className="p-4 text-center text-gray-500">Carregando contatos...</div>
          ) : contacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Nenhum contato encontrado</div>
          ) : (
            contacts.map((contact, idx) => (
              <div
                key={idx}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-100 transition ${
                  selectedJid === contact.remoteJid ? 'bg-blue-50' : ''
                }`}
                onClick={() => loadMessages(contact.remoteJid)}
              >
                <div className="font-medium text-gray-800">
                  {contact.name ||
                    contact.pushName ||
                    displayNameFromJid(contact.remoteJid)}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {contact.lastMessage?.conversation || 'Sem mensagens'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col">
        {selectedJid ? (
          <>
            {/* CABEÇALHO */}
            <div className="border-b px-4 py-3 flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="font-semibold text-gray-800">
                  {contacts.find((c) => c.remoteJid === selectedJid)?.name ||
                    contacts.find((c) => c.remoteJid === selectedJid)?.pushName ||
                    displayNameFromJid(selectedJid)}
                </h2>
                <p className="text-xs text-gray-500">Contato • Conversa ativa</p>
              </div>
            </div>

            {/* MENSAGENS */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
              {loadingMessages ? (
                <div className="text-center text-gray-500 mt-10">
                  <Loader2 className="animate-spin mx-auto mb-2" />
                  Carregando mensagens...
                </div>
              ) : messages.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">
                  Nenhuma mensagem ainda
                </p>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex mb-3 ${
                      msg.key?.fromMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-xs text-sm ${
                        msg.key?.fromMe
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none shadow'
                      }`}
                    >
                      {msg.message?.conversation ||
                        msg.body ||
                        (msg.message?.audioMessage
                          ? '🎵 Áudio'
                          : '📎 Mensagem sem texto')}
                      <div className="text-[10px] text-gray-400 mt-1 text-right">
                        {msg.messageTimestamp
                          ? new Date(msg.messageTimestamp * 1000).toLocaleTimeString(
                              'pt-BR',
                              { hour: '2-digit', minute: '2-digit' }
                            )
                          : ''}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* CAMPO DE ENVIO */}
            <div className="border-t p-3 bg-white flex gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage} className="bg-blue-600 text-white">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Selecione um contato para visualizar a conversa
          </div>
        )}
      </div>
    </div>
  )
}
