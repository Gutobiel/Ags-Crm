'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para os ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  onLocationChange: (location: { lat: number; lng: number; address: string }) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  initialAddress?: string;
  searchAddress?: string;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function MapPicker({ onLocationChange, initialLatitude, initialLongitude, initialAddress, searchAddress }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number]>([
    typeof initialLatitude === 'number' ? initialLatitude : -15.7942,
    typeof initialLongitude === 'number' ? initialLongitude : -47.8822,
  ]);
  const [searchQuery, setSearchQuery] = useState(initialAddress || '');
  
  // Atualizar searchQuery quando searchAddress mudar e buscar automaticamente
  useEffect(() => {
    if (searchAddress) {
      setSearchQuery(searchAddress);
      // Buscar automaticamente quando receber um novo searchAddress
      setTimeout(() => {
        performSearch(searchAddress);
      }, 100);
    }
  }, [searchAddress]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function performSearch(query: string) {
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Busca livre para endereço ou CEP
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&countrycodes=br&limit=1`;

      const response = await fetch(url);
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const displayName = data[0].display_name;

        setPosition([lat, lng]);
        onLocationChange({ lat, lng, address: displayName });
        setError('');
      } else {
        setError('Localização não encontrada. Tente outro endereço ou CEP.');
      }
    } catch (err) {
      setError('Erro ao buscar localização. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    performSearch(searchQuery);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Buscar Localização do Poço
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            placeholder="Digite o endereço ou CEP do poço..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>

      <div className="h-64 sm:h-80 rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
          <ChangeView center={position} />
        </MapContainer>
      </div>
      <p className="text-xs text-gray-500">
        📍 Coordenadas: {typeof position[0] === 'number' ? position[0].toFixed(6) : '-'}, {typeof position[1] === 'number' ? position[1].toFixed(6) : '-'}
      </p>
    </div>
  );
}
