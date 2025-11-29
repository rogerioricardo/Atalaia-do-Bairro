
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MockService } from '../services/mockService';
import { User, Neighborhood } from '../types';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { Layers, Sun, Moon, Globe, Video } from 'lucide-react';

// Fix Leaflet Default Icon in React using CDN URLs
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Camera Icon for map markers
const CameraIcon = L.divIcon({
    className: 'custom-camera-marker',
    html: `<div style="background-color: #00FF66; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(0,255,102,0.6); border: 2px solid #000;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

const MAP_STYLES = {
    dark: {
        name: 'Escuro',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        icon: Moon
    },
    light: {
        name: 'Claro',
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        icon: Sun
    },
    satellite: {
        name: 'Satélite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        icon: Globe
    }
};

const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

const MapPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [currentLayer, setCurrentLayer] = useState<keyof typeof MAP_STYLES>('dark');
  
  const centerPos: [number, number] = user?.lat && user?.lng ? [user.lat, user.lng] : [-27.5969, -48.5495];

  const roleNames: Record<string, string> = {
    ADMIN: 'Administrador',
    INTEGRATOR: 'Integrador',
    SCR: 'Motovigia',
    RESIDENT: 'Morador'
  };

  useEffect(() => {
    const fetchData = async () => {
        const usersData = await MockService.getUsers();
        setUsers(usersData);
        const hoodsData = await MockService.getNeighborhoods();
        setNeighborhoods(hoodsData);
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="h-[calc(100vh-100px)] flex flex-col">
        <div className="mb-4 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-white">Mapa Comunitário</h1>
                <p className="text-gray-400">Visualize a rede de proteção em tempo real.</p>
            </div>
        </div>

        <div className="flex-1 rounded-xl overflow-hidden border border-atalaia-border shadow-2xl relative z-0 group">
             <MapContainer 
                center={centerPos} 
                zoom={14} 
                style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
                scrollWheelZoom={true}
            >
                <MapResizer />
                <TileLayer
                    key={currentLayer}
                    attribution={MAP_STYLES[currentLayer].attribution}
                    url={MAP_STYLES[currentLayer].url}
                />

                {/* User Markers */}
                {users.map((u) => (
                    u.lat && u.lng && (
                        <Marker key={`user-${u.id}`} position={[u.lat, u.lng]}>
                            <Popup className="text-black">
                                <strong className="block text-sm mb-1">{u.name}</strong>
                                <span className="text-xs uppercase bg-gray-200 px-1 rounded">
                                    {u.role ? roleNames[u.role] : u.role}
                                </span>
                            </Popup>
                        </Marker>
                    )
                ))}

                {/* Camera Markers */}
                {neighborhoods.map((h) => (
                    h.lat && h.lng && (
                        <Marker key={`cam-${h.id}`} position={[h.lat, h.lng]} icon={CameraIcon}>
                             <Popup className="text-black">
                                <div className="flex items-center gap-2 mb-1">
                                    <Video size={16} />
                                    <strong className="text-sm">Câmera: {h.name}</strong>
                                </div>
                                <span className="text-xs text-green-600 font-bold animate-pulse">● EM OPERAÇÃO</span>
                            </Popup>
                        </Marker>
                    )
                ))}

            </MapContainer>

            {/* Map Style Controller */}
            <div className="absolute top-4 right-4 bg-black/90 backdrop-blur border border-white/20 p-2 rounded-lg z-[1000] shadow-xl flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 px-2 mb-1 flex items-center gap-1">
                    <Layers size={10} /> Camadas
                </span>
                {(Object.keys(MAP_STYLES) as Array<keyof typeof MAP_STYLES>).map((styleKey) => {
                    const StyleIcon = MAP_STYLES[styleKey].icon;
                    const isActive = currentLayer === styleKey;
                    return (
                        <button
                            key={styleKey}
                            onClick={() => setCurrentLayer(styleKey)}
                            className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all ${
                                isActive 
                                ? 'bg-atalaia-neon text-black shadow-[0_0_10px_rgba(0,255,102,0.3)]' 
                                : 'text-gray-300 hover:bg-white/10'
                            }`}
                        >
                            <StyleIcon size={14} />
                            {MAP_STYLES[styleKey].name}
                        </button>
                    );
                })}
            </div>

            {/* Overlay Legend */}
            <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-white/10 z-[1000] text-xs pointer-events-none">
                <h4 className="font-bold text-white mb-2 uppercase">Legenda</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <img src={iconUrl} className="w-4 h-6 opacity-80" alt="marker" />
                        <span className="text-gray-300">Usuários Ativos</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-atalaia-neon border border-black flex items-center justify-center shadow-[0_0_5px_rgba(0,255,102,0.5)]">
                             <div className="w-1 h-1 bg-black rounded-full" />
                        </div>
                        <span className="text-gray-300">Câmeras / Bairros</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default MapPage;
