
import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Card, Input, Button } from '../components/UI';
import { MockService } from '../services/mockService';
import { Save, User as UserIcon, Camera, Home, MapPin, CheckCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [neighborhoodName, setNeighborhoodName] = useState('Carregando...');
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    lat: user?.lat?.toString() || '',
    lng: user?.lng?.toString() || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    phone: user?.phone || '+55 ',
    photoUrl: user?.photoUrl || ''
  });

  const roleNames: Record<string, string> = {
    ADMIN: 'Administrador',
    INTEGRATOR: 'Integrador',
    SCR: 'Motovigia',
    RESIDENT: 'Morador'
  };

  useEffect(() => {
    const loadNeighborhood = async () => {
        if (user?.neighborhoodId) {
            const hood = await MockService.getNeighborhoodById(user.neighborhoodId);
            setNeighborhoodName(hood?.name || 'Bairro Desconhecido');
        } else if (user?.role === 'ADMIN') {
            setNeighborhoodName('Administrador Global');
        } else {
            setNeighborhoodName('Não vinculado');
        }
    };
    loadNeighborhood();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        await updateProfile({
            name: formData.name,
            // Email usually isn't editable for auth reasons in simple demos, but logic is here
            // email: formData.email, 
            lat: parseFloat(formData.lat) || undefined,
            lng: parseFloat(formData.lng) || undefined,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            phone: formData.phone,
            photoUrl: formData.photoUrl
        });
        
        // Show success state
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
        console.error(error);
        alert('Erro ao salvar perfil.');
    } finally {
        setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
            <p className="text-gray-400">Gerencie suas informações pessoais e de localização.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Photo & Basic Info */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="p-6 text-center">
                    <div className="relative inline-block mb-6 group">
                        <div className="w-32 h-32 rounded-full border-2 border-atalaia-neon p-1 mx-auto bg-black overflow-hidden relative">
                             {formData.photoUrl ? (
                                 <img src={formData.photoUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                             ) : (
                                 <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-4xl text-gray-600 font-bold">
                                     {formData.name.charAt(0)}
                                 </div>
                             )}
                             
                             {/* Overlay for upload */}
                             <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                             >
                                 <Camera className="text-white" size={24} />
                             </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        <p className="text-xs text-gray-500 mt-2">Clique para alterar foto</p>
                    </div>

                    <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                    <p className="text-atalaia-neon text-sm font-medium mb-4">
                        {user?.role ? roleNames[user.role] : ''}
                    </p>

                    <div className="text-left space-y-4 pt-4 border-t border-white/5">
                        <div>
                            <label className="text-xs text-gray-500 uppercase">Plano Atual</label>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-bold ${user?.plan === 'FREE' ? 'text-gray-400' : 'text-yellow-500'}`}>
                                    {user?.plan === 'FREE' ? 'Gratuito' : user?.plan === 'FAMILY' ? 'Família' : 'Prêmio'}
                                </span>
                                {user?.plan === 'FREE' && (
                                    <span className="text-xs text-atalaia-neon cursor-pointer hover:underline">Fazer Upgrade</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase">ID de Usuário</label>
                            <p className="text-sm font-mono text-gray-300 truncate" title={user?.id}>{user?.id}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Right Col: Forms */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 md:p-8">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <UserIcon className="text-atalaia-neon" size={20} />
                        Dados Pessoais
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <Input 
                            label="Nome Completo"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                         <Input 
                            label="E-mail"
                            value={formData.email}
                            disabled
                            className="opacity-50 cursor-not-allowed"
                        />
                    </div>
                    
                    <div className="mb-6">
                         <Input 
                            label="WhatsApp"
                            placeholder="+55 11 99999-9999"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                        <p className="text-xs text-gray-500 mt-1">Formato: +55 DDD Número</p>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Home className="text-atalaia-neon" size={20} />
                            Endereço
                        </h3>

                        {/* NEIGHBORHOOD - FIXED */}
                        <div className="mb-6">
                            <Input 
                                label="Bairro / Comunidade (Vinculado)"
                                value={neighborhoodName}
                                disabled
                                className="opacity-80 cursor-not-allowed bg-atalaia-neon/5 border-atalaia-neon/30 text-atalaia-neon font-bold"
                            />
                            <p className="text-xs text-gray-600 mt-1">Definido no momento do cadastro. Contate o administrador para alterar.</p>
                        </div>

                        <div className="mb-6">
                            <Input 
                                label="Logradouro Completo"
                                placeholder="Rua, Número, Complemento"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 mb-6">
                             <Input 
                                label="Cidade"
                                value={formData.city}
                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                            />
                             <Input 
                                label="Estado (UF)"
                                placeholder="SC"
                                value={formData.state}
                                maxLength={2}
                                onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <MapPin className="text-atalaia-neon" size={20} />
                            Localização Geográfica
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Necessário para o Mapa Comunitário.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            <Input 
                                label="Latitude"
                                placeholder="-27.5969"
                                value={formData.lat}
                                onChange={(e) => setFormData({...formData, lat: e.target.value})}
                            />
                            <Input 
                                label="Longitude"
                                placeholder="-48.5495"
                                value={formData.lng}
                                onChange={(e) => setFormData({...formData, lng: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-8 flex items-center justify-end gap-4">
                        {showSuccess && (
                            <div className="flex items-center gap-2 text-green-500 animate-in fade-in slide-in-from-right-2">
                                <CheckCircle size={18} />
                                <span className="font-bold text-sm">Dados atualizados com sucesso!</span>
                            </div>
                        )}
                        <Button 
                            type="submit" 
                            disabled={saving}
                            className={`px-8 py-3 transition-all duration-300 ${showSuccess ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20' : ''}`}
                        >
                            {showSuccess ? (
                                <>
                                    <CheckCircle size={18} /> Salvo!
                                </>
                            ) : (
                                <>
                                    <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        </form>
      </div>
    </Layout>
  );
};

export default Profile;
