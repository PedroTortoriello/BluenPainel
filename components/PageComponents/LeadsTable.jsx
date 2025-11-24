"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Building, Edit, Trash2 } from "lucide-react";

/**
 * @typedef {Object} Lead
 * @property {string|number} id
 * @property {string} name
 * @property {string} email
 * @property {string} [phone]
 * @property {string} [company]
 * @property {string} status
 * @property {string} [priority]
 * @property {string} [source]
 */

/**
 * @param {{
 *   leads: Lead[],
 *   loading: boolean,
 *   getStatusColor: (status: string) => string,
 *   getPriorityColor: (priority: string) => string,
 *   openLeadModal: (lead: Lead) => void,
 *   handleDeleteLead: (id: string | number) => void
 * }} props
 */
export default function LeadsTable({
  leads,
  loading,
  getStatusColor,
  getPriorityColor,
  openLeadModal,
  handleDeleteLead,
}) {
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando leads...</div>;
  }

  if (!leads || leads.length === 0) {
    return <div className="p-8 text-center text-gray-500">Nenhum lead encontrado</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origem</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Mail className="h-3 w-3" /> {lead.email}
                  </div>
                  {lead.phone && (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Phone className="h-3 w-3" /> {lead.phone}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-400" />
                <div className="text-sm text-gray-900">{lead.company || '-'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                {lead.priority && (
                  <Badge className={`${getPriorityColor(lead.priority)} ml-1`} variant="outline">
                    {lead.priority}
                  </Badge>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.source || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openLeadModal(lead)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteLead(lead.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
