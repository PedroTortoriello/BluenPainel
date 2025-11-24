"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CheckSquare, DollarSign, Activity } from "lucide-react";

/**
 * Componente que exibe cards resumidos no dashboard
 * @param {{stats?: {leads: number, contatos: number, propostas: number, atividades: number}}} props
 */
export default function DashboardCards({ stats = { leads: 0, contatos: 0, propostas: 0, atividades: 0 } }) {
  const cards = [
    { title: "Leads", value: stats.leads, icon: Users, color: "bg-blue-500" },
    { title: "Contatos", value: stats.contatos, icon: CheckSquare, color: "bg-green-500" },
    { title: "Propostas", value: stats.propostas, icon: DollarSign, color: "bg-yellow-500" },
    { title: "Atividades", value: stats.atividades, icon: Activity, color: "bg-purple-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${card.color}`} />
                {card.title}
              </CardTitle>
              <CardDescription className="text-xl font-bold">{card.value}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Aqui você pode adicionar mais detalhes se quiser */}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
