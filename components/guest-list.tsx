"use client";

import { useState, useEffect } from "react";
import { Users, Mail, Clock, CheckCircle2, Search, ExternalLink } from "lucide-react";

interface Guest {
  id: string;
  email: string | null;
  selfiePath: string;
  status: string;
  createdAt: string;
  _count: {
    matches: number;
  };
}

interface GuestListProps {
  eventId: string;
}

export function GuestList({ eventId }: GuestListProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchGuests() {
      try {
        const res = await fetch(`/api/events/${eventId}/guests`);
        if (res.ok) {
          const data = await res.json();
          setGuests(data.guests || []);
        }
      } catch (err) {
        console.error("Failed to fetch guests:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGuests();
  }, [eventId]);

  const filteredGuests = guests.filter(guest => 
    guest.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 border border-zinc-800 w-full sm:w-64">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Rechercher par email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm text-zinc-300 outline-none w-full"
          />
        </div>
        <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
          {guests.length} Invités au total
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/20">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900/40 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4">Invité</th>
              <th className="px-6 py-4">Email / Lead</th>
              <th className="px-6 py-4">Photos trouvées</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Selfie</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {filteredGuests.length > 0 ? (
              filteredGuests.map((guest) => (
                <tr key={guest.id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-zinc-200">#{guest.id.slice(-4)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-zinc-500" />
                      {guest.email ? (
                        <span className="text-zinc-300">{guest.email}</span>
                      ) : (
                        <span className="text-zinc-600 italic">Non renseigné</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${guest._count.matches > 0 ? 'text-emerald-500' : 'text-zinc-600'}`} />
                      <span className={guest._count.matches > 0 ? 'text-zinc-200 font-bold' : 'text-zinc-500'}>
                        {guest._count.matches} matches
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Clock className="h-3 w-3" />
                      {new Date(guest.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a 
                      href={guest.selfiePath} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group/link inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400"
                    >
                      Voir le selfie
                      <ExternalLink className="h-3 w-3 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  {searchTerm ? "Aucun invité ne correspond à votre recherche." : "Aucun invité n'a encore scanné le QR code."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
