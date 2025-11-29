
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { UserRole, Neighborhood, CameraProtocol, Plan } from '../types';
import { MockService } from '../services/mockService';
import { Card, Button, Input, Modal, Badge } from '../components/UI';
import { Video, Plus, Code, Eye, Lock, Check, MousePointerClick, Send, MapPin, Search, Trash2, AlertCircle, Settings, List, ShieldCheck } from 'lucide-react';

const Cameras: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'view' | 'manage' | 'protocol'>('view');
  
  // Data State
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [newHoodName, setNewHoodName] = useState('');
  const [newHoodIframe, setNewHoodIframe] = useState(''); // Stores raw HTML or URL
  const [newHoodLat, setNewHoodLat] = useState('');
  const [newHoodLng, setNewHoodLng] = useState('');

  // Protocol State
  const [protocolCameraName, setProtocolCameraName] = useState('');
  const [protocolLat, setProtocolLat] = useState('');
  const [protocolLng, setProtocolLng] = useState('');
  const [generatedProtocol, setGeneratedProtocol] = useState<CameraProtocol | null>(null);

  // Upgrade Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [processingUpgrade, setProcessingUpgrade] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Load Plans for modal
      const availablePlans = await MockService.getPlans();
      setPlans(availablePlans.filter(p => p.id !== 'FREE'));

      if (user?.role === UserRole.ADMIN) {
        const hoods = await MockService.getNeighborhoods(true); // Force refresh for admin
        setNeighborhoods(hoods);
      } else if (user?.neighborhoodId) {
        const hood = await MockService.getNeighborhoodById(user.neighborhoodId);
        if (hood) {
            setNeighborhoods([hood]);
            setSelectedNeighborhood(hood);
        }
      }
    };
    loadData();
  }, [user, activeTab]); // Reload when tab changes

  // Helper to extract SRC from iframe code
  const extractSrcFromIframe = (input: string): string => {
      // If it contains <iframe, try to find src="..."
      if (input.includes('<iframe')) {
          const srcMatch = input.match(/src=["'](.*?)["']/);
          if (srcMatch && srcMatch[1]) {
              return srcMatch[1];
          }
      }
      // If no iframe tag or no match, assume it's just a URL
      return input.trim();
  };

  const handleCreateNeighborhood = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = newHoodLat ? parseFloat(newHoodLat) : undefined;
    const lng = newHoodLng ? parseFloat(newHoodLng) : undefined;
    
    // Extract clean URL from the pasted code
    const cleanUrl = extractSrcFromIframe(newHoodIframe);

    try {
        await MockService.createNeighborhood(newHoodName, cleanUrl, lat, lng);
        const hoods = await MockService.getNeighborhoods(true);
        setNeighborhoods(hoods);
        
        // Reset form
        setNewHoodName('');
        setNewHoodIframe('');
        setNewHoodLat('');
        setNewHoodLng('');
        
        alert('Bairro cadastrado com sucesso!');
    } catch (error: any) {
        alert('Erro ao criar bairro: ' + error.message);
    }
  };

  const handleDeleteNeighborhood = async (id: string, name: string) => {
      // Confirmação dupla para segurança
      const confirm1 = window.confirm(`ATENÇÃO: Deseja realmente excluir o bairro "${name}"?`);
      if (!confirm1) return;

      const confirm2 = window.confirm(`Isso apagará o histórico de alertas e chats deste bairro. Os moradores ficarão sem vínculo. Confirmar exclusão?`);
      if (!confirm2) return;
      
      setDeletingId(id);
      try {
          await MockService.deleteNeighborhood(id);
          
          // Update local state immediately
          setNeighborhoods(prev => prev.filter(h => h.id !== id));
          
          if (selectedNeighborhood?.id === id) {
              setSelectedNeighborhood(null);
          }
          alert('Bairro excluído com sucesso.');
      } catch (error: any) {
          console.error("Erro na exclusão:", error);
          alert('Erro ao excluir: ' + (error.message || 'Verifique se rodou o Script SQL de Permissões no Supabase.'));
      } finally {
          setDeletingId(null);
      }
  };

  const handleGenerateProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!protocolCameraName) return;
    
    const lat = protocolLat ? parseFloat(protocolLat) : undefined;
    const lng = protocolLng ? parseFloat(protocolLng) : undefined;

    const protocol = await MockService.generateProtocol(protocolCameraName.toLowerCase(), lat, lng);
    setGeneratedProtocol(protocol);
  };

  const handleSendToAdmin = async () => {
      if (generatedProtocol && user) {
          await MockService.sendProtocolToAdmin(generatedProtocol, user.name);
          alert('Protocolo enviado com sucesso!');
          setGeneratedProtocol(null);
          setProtocolCameraName('');
          setProtocolLat('');
          setProtocolLng('');
      }
  };

  const handleUpgradePlan = async (planId: string) => {
      if (!user) return;
      setProcessingUpgrade(planId);
      try {
          await MockService.updateUserPlan(user.id, planId);
          alert('Plano atualizado com sucesso! O sistema será recarregado para aplicar as mudanças.');
          window.location.reload(); // Reload to refresh AuthContext and unlock features
      } catch (error: any) {
          alert('Erro ao assinar plano: ' + error.message);
          setProcessingUpgrade(null);
      }
  };

  // Filter Neighborhoods
  const filteredNeighborhoods = neighborhoods.filter(h => 
      h.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedNeighborhoods = searchTerm 
      ? filteredNeighborhoods 
      : filteredNeighborhoods.slice(0, 4);

  // Admin always has access, otherwise check plan
  // Correction: If user is ADMIN, ignore plan check
  const isLocked = user?.role !== UserRole.ADMIN && user?.plan === 'FREE';

  const UniversalPlayer = ({ url }: { url: string }) => {
    // Basic detection for direct video files vs embeds
    const isDirectVideo = url.match(/\.(mp4|webm|ogg|m3u8)$/i);
    
    return (
        <div className="w-full bg-black rounded-xl overflow-hidden border border-atalaia-border relative shadow-[0_0_30px_rgba(0,0,0,0.5)] aspect-video group">
             {isDirectVideo ? (
                 <video 
                    src={url} 
                    controls 
                    autoPlay 
                    muted 
                    loop 
                    className="w-full h-full object-cover"
                 />
             ) : (
                <iframe 
                    src={url}
                    className="w-full h-full bg-black"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title="Camera Feed"
                />
             )}
            
            <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse shadow-lg z-10">
                AO VIVO
            </div>
        </div>
    );
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white">Monitoramento</h1>
           <p className="text-gray-400">Sistema de vigilância visual integrado.</p>
        </div>
        
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex bg-[#111] p-1 rounded-lg border border-atalaia-border w-max md:w-auto">
                <button 
                    onClick={() => setActiveTab('view')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'view' ? 'bg-atalaia-neon text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2"><Eye size={16} /> Visualizar</div>
                </button>
                
                {user?.role === UserRole.ADMIN && (
                    <button 
                        onClick={() => setActiveTab('manage')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'manage' ? 'bg-atalaia-neon text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2"><Settings size={16} /> Gestão de Bairros</div>
                    </button>
                )}
                
                {user?.role === UserRole.INTEGRATOR && (
                    <button 
                        onClick={() => setActiveTab('protocol')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'protocol' ? 'bg-atalaia-neon text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2"><Code size={16} /> Protocolos</div>
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* VIEW MODE */}
      {activeTab === 'view' && (
          <div className="space-y-6">
              {isLocked ? (
                <div className="flex flex-col items-center justify-center p-16 border border-atalaia-border border-dashed rounded-2xl bg-[#0a0a0a] text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-atalaia-neon/5 blur-[100px]" />
                    <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mb-6 border border-gray-800 relative z-10">
                        <Lock size={40} className="text-gray-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Recurso Bloqueado</h2>
                    <p className="text-gray-400 mb-6 max-w-md relative z-10">
                        O monitoramento de câmeras está disponível apenas para os planos Família e Prêmio.
                    </p>
                    <Button onClick={() => setShowUpgradeModal(true)} className="relative z-10 px-8 py-3">
                        <ShieldCheck size={18} className="mr-2" />
                        Fazer Upgrade Agora
                    </Button>
                </div>
              ) : (
                <>
                  {user?.role === UserRole.ADMIN && (
                      <div className="mb-6 space-y-4">
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                              <input 
                                  type="text" 
                                  placeholder="Buscar bairro..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="w-full bg-black/50 border border-atalaia-border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-atalaia-neon"
                              />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {displayedNeighborhoods.map(hood => (
                                  <div 
                                    key={hood.id}
                                    onClick={() => setSelectedNeighborhood(hood)}
                                    className={`
                                        relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all
                                        ${selectedNeighborhood?.id === hood.id 
                                            ? 'bg-atalaia-neon/10 border-atalaia-neon' 
                                            : 'bg-[#111] border-white/5 hover:bg-[#151515]'
                                        }
                                    `}
                                  >
                                      <div className="flex items-center gap-3 mb-2">
                                          <Video size={20} className={selectedNeighborhood?.id === hood.id ? 'text-atalaia-neon' : 'text-gray-400'} />
                                          <h3 className="font-bold truncate text-white">{hood.name}</h3>
                                      </div>
                                      <p className="text-xs text-gray-500">Clique para visualizar</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {selectedNeighborhood ? (
                      <div className="animate-in fade-in zoom-in duration-300 mt-4">
                          <div className="flex items-center justify-between mb-4">
                              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                                  <Video className="text-atalaia-neon" /> {selectedNeighborhood.name}
                              </h2>
                              <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded uppercase animate-pulse">Ao Vivo</span>
                          </div>
                          <UniversalPlayer url={selectedNeighborhood.iframeUrl} />
                      </div>
                  ) : (
                      <div className="h-40 flex items-center justify-center border border-dashed border-gray-800 rounded-xl bg-black/20">
                          <p className="text-gray-500">Selecione uma câmera acima.</p>
                      </div>
                  )}
                </>
              )}
          </div>
      )}

      {/* MANAGE MODE (ADMIN - NEW STRUCTURE) */}
      {activeTab === 'manage' && user?.role === UserRole.ADMIN && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Create Form */}
              <div className="lg:col-span-1">
                  <Card className="p-6 sticky top-4">
                      <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                          <Plus size={18} className="text-atalaia-neon" /> Novo Bairro
                      </h2>
                      <form onSubmit={handleCreateNeighborhood} className="space-y-4">
                          <Input 
                            label="Nome" 
                            value={newHoodName} 
                            onChange={e => setNewHoodName(e.target.value)} 
                            placeholder="Ex: Centro"
                            required
                          />
                          <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block uppercase">Código Iframe da Câmera</label>
                            <textarea 
                                className="w-full bg-black/50 border border-atalaia-border rounded-lg px-3 py-2 text-white text-xs h-32 focus:border-atalaia-neon focus:outline-none resize-none font-mono"
                                placeholder='<iframe src="https://..."></iframe>'
                                value={newHoodIframe}
                                onChange={e => setNewHoodIframe(e.target.value)}
                                required
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Cole o código completo do Iframe ou apenas a URL.</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                              <Input label="Lat" value={newHoodLat} onChange={e => setNewHoodLat(e.target.value)} type="number" step="any"/>
                              <Input label="Lng" value={newHoodLng} onChange={e => setNewHoodLng(e.target.value)} type="number" step="any"/>
                          </div>
                          <Button type="submit" className="w-full">Cadastrar</Button>
                      </form>
                  </Card>
              </div>

              {/* Right: Management Table (Better for Deletion) */}
              <div className="lg:col-span-2">
                  <Card className="p-0 overflow-hidden">
                      <div className="p-4 border-b border-white/10 bg-[#151515] flex justify-between items-center">
                          <h2 className="font-bold text-white flex items-center gap-2">
                              <List size={18} className="text-atalaia-neon" /> Bairros Cadastrados
                          </h2>
                          <span className="text-xs text-gray-500">{neighborhoods.length} registros</span>
                      </div>
                      
                      <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm text-gray-400">
                              <thead className="bg-black text-gray-200 uppercase text-xs">
                                  <tr>
                                      <th className="px-6 py-3 font-medium">Nome do Bairro</th>
                                      <th className="px-6 py-3 font-medium">Câmera</th>
                                      <th className="px-6 py-3 font-medium text-right">Ações</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                  {neighborhoods.map((hood) => (
                                      <tr key={hood.id} className="hover:bg-white/5 transition-colors">
                                          <td className="px-6 py-4 font-medium text-white">{hood.name}</td>
                                          <td className="px-6 py-4">
                                              {hood.iframeUrl ? (
                                                  <span className="text-green-500 text-xs flex items-center gap-1"><Check size={12}/> Configurada</span>
                                              ) : (
                                                  <span className="text-red-500 text-xs">Pendente</span>
                                              )}
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                              <button 
                                                  onClick={() => handleDeleteNeighborhood(hood.id, hood.name)}
                                                  disabled={deletingId === hood.id}
                                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all text-xs font-bold border border-red-500/20"
                                                  title="Excluir Bairro"
                                              >
                                                  {deletingId === hood.id ? (
                                                      <span className="animate-spin">...</span>
                                                  ) : (
                                                      <>
                                                          <Trash2 size={14} /> EXCLUIR
                                                      </>
                                                  )}
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                                  {neighborhoods.length === 0 && (
                                      <tr>
                                          <td colSpan={3} className="px-6 py-8 text-center text-gray-600 italic">
                                              Nenhum bairro cadastrado. Utilize o formulário ao lado.
                                          </td>
                                      </tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </Card>
              </div>
          </div>
      )}

      {/* PROTOCOL MODE (INTEGRATOR) */}
      {activeTab === 'protocol' && user?.role === UserRole.INTEGRATOR && (
          <Card className="max-w-2xl mx-auto p-8">
              <h2 className="text-xl font-bold mb-6 text-white">Gerador de Protocolos</h2>
              <form onSubmit={handleGenerateProtocol} className="space-y-6">
                  <Input 
                    label="Nome da Câmera" 
                    placeholder="cam01portaria"
                    value={protocolCameraName}
                    onChange={e => setProtocolCameraName(e.target.value.toLowerCase())}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                      <Input label="Latitude" value={protocolLat} onChange={e => setProtocolLat(e.target.value)} type="number" step="any" />
                      <Input label="Longitude" value={protocolLng} onChange={e => setProtocolLng(e.target.value)} type="number" step="any" />
                  </div>
                  <Button type="submit" className="w-full">Gerar e Revisar</Button>
              </form>
              {generatedProtocol && (
                  <div className="mt-8 p-6 bg-black/40 rounded-xl border border-atalaia-border animate-in slide-in-from-bottom-2">
                       <h3 className="font-bold text-atalaia-neon mb-4">Gerado:</h3>
                       <div className="space-y-2 mb-4 font-mono text-xs text-gray-300">
                           <div className="bg-black p-2 border border-gray-800 rounded">{generatedProtocol.rtmp}</div>
                           <div className="bg-black p-2 border border-gray-800 rounded">{generatedProtocol.rtsp}</div>
                       </div>
                       <Button onClick={handleSendToAdmin} variant="secondary" className="w-full flex items-center justify-center gap-2">
                          <Send size={18} /> Enviar para Admin
                      </Button>
                  </div>
              )}
          </Card>
      )}

      {/* UPGRADE MODAL */}
      <Modal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)}>
        <div className="p-2">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Desbloquear Monitoramento</h2>
            <p className="text-gray-400 mb-6 text-center text-sm">Escolha um plano para acessar as câmeras em tempo real.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map(plan => (
                    <div 
                        key={plan.id} 
                        className={`
                            border rounded-xl p-6 relative flex flex-col justify-between transition-all hover:-translate-y-1
                            ${plan.id === 'FAMILY' ? 'bg-[#0f1a12] border-atalaia-neon/50 shadow-[0_0_15px_rgba(0,255,102,0.1)]' : 'bg-[#111] border-white/10 hover:border-white/30'}
                        `}
                    >
                        {plan.id === 'FAMILY' && (
                             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-atalaia-neon text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                 Mais Escolhido
                             </div>
                        )}
                        
                        <div>
                            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                            <div className="flex items-end gap-1 my-3">
                                <span className={`text-3xl font-bold ${plan.id === 'FAMILY' ? 'text-atalaia-neon' : 'text-white'}`}>
                                    R$ {plan.price}
                                </span>
                                <span className="text-xs text-gray-500 mb-1">/mês</span>
                            </div>
                            <ul className="space-y-2 text-xs text-gray-300 mb-6">
                                {plan.features.slice(0, 4).map((f, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <Check size={12} className="text-atalaia-neon" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button 
                            onClick={() => handleUpgradePlan(plan.id)}
                            disabled={!!processingUpgrade}
                            variant={plan.id === 'FAMILY' ? 'primary' : 'outline'}
                            className="w-full text-sm"
                        >
                            {processingUpgrade === plan.id ? 'Processando...' : `Assinar ${plan.name}`}
                        </Button>
                    </div>
                ))}
            </div>
            {plans.length === 0 && (
                <p className="text-center text-gray-500 py-8">Carregando planos...</p>
            )}
        </div>
      </Modal>

    </Layout>
  );
};

export default Cameras;
