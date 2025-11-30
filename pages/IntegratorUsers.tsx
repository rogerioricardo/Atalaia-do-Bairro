
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';
import { MockService } from '../services/mockService';
import { Card, Button, Input, Modal, Badge } from '../components/UI';
import { UserPlus, Trash2, Mail, Phone, MapPin, Users, Search, Lock, CreditCard, Save, Key, Crown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const IntegratorUsers: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [residents, setResidents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Payment Config State
  const [mpPublicKey, setMpPublicKey] = useState('');
  const [mpAccessToken, setMpAccessToken] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchResidents = async () => {
    setLoading(true);
    // Fetch only residents from my neighborhood
    if (user?.neighborhoodId) {
        const allUsers = await MockService.getUsers(user.neighborhoodId);
        // Filter roles client side just in case, though service handles it
        const myResidents = allUsers.filter(u => u.role === UserRole.RESIDENT);
        setResidents(myResidents);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === UserRole.INTEGRATOR || user?.role === UserRole.ADMIN) {
        fetchResidents();
        if (user.role === UserRole.INTEGRATOR) {
            // Load current config
            setMpPublicKey(user.mpPublicKey || '');
            setMpAccessToken(user.mpAccessToken || '');
        }
    }
  }, [user]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.neighborhoodId) return;

    try {
        await MockService.createResident({
            name: newName,
            email: newEmail,
            phone: newPhone,
            address: newAddress,
        }, user.neighborhoodId);

        // Reset form
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setNewAddress('');
        setIsModalOpen(false);
        
        // Refresh list
        await fetchResidents();
        alert('Morador cadastrado com sucesso! Quando ele criar a conta no App com este email, os dados serão vinculados automaticamente.');
    } catch (error: any) {
        console.error(error);
        alert('Erro ao cadastrar morador: ' + error.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
      if (window.confirm('Tem certeza que deseja remover este morador?')) {
          await MockService.deleteUser(id);
          await fetchResidents();
      }
  };

  const handleTogglePlan = async (resident: User) => {
      const newPlan = resident.plan === 'PREMIUM' ? 'FREE' : 'PREMIUM';
      const action = resident.plan === 'PREMIUM' ? 'remover o Premium de' : 'dar Premium para';
      
      if (window.confirm(`Deseja manualmente ${action} ${resident.name}?`)) {
          try {
              await MockService.updateUserPlan(resident.id, newPlan);
              await fetchResidents();
          } catch (e: any) {
              alert('Erro ao alterar plano: ' + e.message);
          }
      }
  };

  const handleSavePaymentConfig = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setSavingConfig(true);
      try {
          await MockService.updateIntegratorConfig(user.id, mpPublicKey, mpAccessToken);
          // Update context locally
          await updateProfile({ mpPublicKey, mpAccessToken });
          alert('Configurações de pagamento salvas com sucesso! Agora você pode receber doações.');
      } catch (e: any) {
          alert('Erro ao salvar configurações: ' + e.message);
      } finally {
          setSavingConfig(false);
      }
  };

  const filteredResidents = residents.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Painel do Integrador</h1>
                <p className="text-gray-400">Gerencie moradores e configurações de recebimento.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
                <UserPlus size={18} className="mr-2" /> Novo Morador
            </Button>
        </div>

        {/* Payment Configuration Card - Only visible to actual Integrators (not Admins viewing the page) */}
        {user?.role === UserRole.INTEGRATOR && (
            <Card className="p-6 border-atalaia-neon/30 bg-atalaia-neon/5">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="text-atalaia-neon" size={24} />
                    Configuração de Recebimento (Mercado Pago)
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                    Insira suas credenciais de API do Mercado Pago para receber doações diretas dos moradores.
                    Os pagamentos cairão diretamente na sua conta.
                </p>
                <form onSubmit={handleSavePaymentConfig} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <Input 
                        label="Public Key"
                        placeholder="APP_USR-..."
                        value={mpPublicKey}
                        onChange={e => setMpPublicKey(e.target.value)}
                        type="password"
                    />
                    <Input 
                        label="Access Token"
                        placeholder="APP_USR-..."
                        value={mpAccessToken}
                        onChange={e => setMpAccessToken(e.target.value)}
                        type="password"
                    />
                    <div className="md:col-span-2 flex justify-end">
                        <Button type="submit" disabled={savingConfig}>
                            <Save size={18} className="mr-2" />
                            {savingConfig ? 'Salvando...' : 'Salvar Configurações'}
                        </Button>
                    </div>
                </form>
            </Card>
        )}

        <div className="border-t border-white/10 pt-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="text-gray-400" size={24} />
                Gestão de Moradores
            </h2>
            
            {/* Stats / Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-gray-800 text-white rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold">Total</p>
                        <p className="text-2xl font-bold text-white">{residents.length}</p>
                    </div>
                </Card>
                
                <div className="md:col-span-2">
                    <div className="relative h-full">
                        <Search className="absolute left-4 top-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar por nome ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-full bg-[#111] border border-atalaia-border rounded-xl pl-12 pr-4 text-white focus:outline-none focus:border-atalaia-neon transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {loading ? (
                    <p className="text-gray-500">Carregando...</p>
                ) : filteredResidents.length === 0 ? (
                    <div className="col-span-2 text-center py-12 border border-dashed border-gray-700 rounded-xl">
                        <p className="text-gray-500">Nenhum morador encontrado.</p>
                    </div>
                ) : (
                    filteredResidents.map(resident => (
                        <Card key={resident.id} className="p-5 flex items-start justify-between group hover:border-atalaia-neon/50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-400 border border-gray-700">
                                    {resident.photoUrl ? (
                                        <img src={resident.photoUrl} alt={resident.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        resident.name.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{resident.name}</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge color={resident.plan === 'FREE' ? 'blue' : 'yellow'}>
                                            {resident.plan === 'FREE' ? 'GRATUITO' : 'PREMIUM'}
                                        </Badge>
                                        {/* Botão de Troca Manual de Plano (Upgrade/Downgrade) */}
                                        <button 
                                            onClick={() => handleTogglePlan(resident)}
                                            className="text-xs text-gray-500 hover:text-atalaia-neon flex items-center gap-1 bg-gray-800 px-2 py-0.5 rounded border border-gray-700 hover:border-atalaia-neon transition-colors"
                                            title="Alterar Plano Manualmente"
                                        >
                                            {resident.plan === 'FREE' ? <ArrowUpCircle size={12}/> : <ArrowDownCircle size={12}/>}
                                            {resident.plan === 'FREE' ? 'Dar Premium' : 'Remover'}
                                        </button>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-400">
                                        <div className="flex items-center gap-2"><Mail size={14} /> {resident.email}</div>
                                        <div className="flex items-center gap-2"><Phone size={14} /> {resident.phone || 'Não informado'}</div>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDeleteUser(resident.id)}
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Remover Morador"
                            >
                                <Trash2 size={20} />
                            </button>
                        </Card>
                    ))
                )}
            </div>
        </div>

        {/* Modal Create */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Cadastrar Novo Morador</h2>
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <Input 
                        label="Nome Completo"
                        placeholder="Ex: João da Silva"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                    />
                    <Input 
                        label="E-mail"
                        type="email"
                        placeholder="joao@email.com"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="WhatsApp"
                            placeholder="+55 48 99999-9999"
                            value={newPhone}
                            onChange={e => setNewPhone(e.target.value)}
                        />
                         <Input 
                            label="Endereço"
                            placeholder="Rua, Número"
                            value={newAddress}
                            onChange={e => setNewAddress(e.target.value)}
                        />
                    </div>
                    
                    {/* Locked Plan Field */}
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 flex items-center justify-between opacity-80 cursor-not-allowed">
                        <div className="flex items-center gap-2">
                             <Lock size={16} className="text-gray-500" />
                             <div>
                                 <label className="text-xs text-gray-500 block uppercase">Plano Inicial</label>
                                 <span className="text-sm font-bold text-white">GRATUITO</span>
                             </div>
                        </div>
                        <span className="text-xs text-gray-500">Upgrade apenas pelo Admin</span>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Cadastrar</Button>
                    </div>
                </form>
            </div>
        </Modal>

      </div>
    </Layout>
  );
};

export default IntegratorUsers;
