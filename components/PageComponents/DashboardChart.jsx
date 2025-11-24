'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const chartData = [
  { month: 'Jan', agendamentos: 300, propostas: 120, vendas: 50 },
  { month: 'Fev', agendamentos: 450, propostas: 220, vendas: 80 },
  { month: 'Mar', agendamentos: 500, propostas: 260, vendas: 110 },
  { month: 'Abr', agendamentos: 700, propostas: 310, vendas: 150 },
];

export default function DashboardChart() {
  return (
    <Card className="p-6 mt-8">
      <CardTitle className="mb-2 font-semibold">📈 Evolução Mensal</CardTitle>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />

          <Line type="monotone" dataKey="agendamentos" stroke="#5B8DF6" strokeWidth={3} />
          <Line type="monotone" dataKey="propostas" stroke="#F6A95B" strokeWidth={3} />
          <Line type="monotone" dataKey="vendas" stroke="#5BF6A3" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
