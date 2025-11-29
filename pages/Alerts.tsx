
import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI';
import { AlertTriangle, ShieldAlert, CheckCircle, Eye, Phone, Shield, Ambulance, Flame, Headset, Camera } from 'lucide-react';
import { MockService } from '../services/mockService';

const Alerts: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handlePanic = async (type: 'PANIC' | 'DANGER' | 'SUSPICIOUS' | 'OK', imageBase64?: string) => {
      if(!user) return;
      setLoading(true);
      
      try {
        await MockService.createAlert({
            type,
            userId: user.id,
            userName: user.name,
            neighborhoodId: user.neighborhoodId || undefined,
            userRole: user.role,
            image: imageBase64
        });
        
        if (imageBase64) {
            alert('Alerta com foto enviado com sucesso!');
        } else {
            alert('Alerta enviado com sucesso!');
        }
      } catch (e) {
        console.error(e);
        alert('Erro ao enviar alerta.');
      } finally {
        setLoading(false);
      }
  };

  const handleButtonClick = (type: 'PANIC' | 'DANGER' | 'SUSPICIOUS' | 'OK') => {
      if (type === 'SUSPICIOUS') {
          // Trigger camera input for suspicious activity
          cameraInputRef.current?.click();
      } else {
          // Normal flow for others
          handlePanic(type);
      }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = reader.result as string;
              // Once image is captured, trigger the alert
              handlePanic('SUSPICIOUS', base64String);
          };
          reader.readAsDataURL(file);
      }
      // Reset input so it can be triggered again even if same file
      e.target.value = '';
  };

  const PanicButton = ({ type, icon: Icon, label, color, bg }: any) => (
      <button
        onClick={() => handleButtonClick(type)}
        disabled={loading}
        className={`relative overflow-hidden group p-6 rounded-2xl border transition-all duration-300 hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-4 h-40 w-full shadow-lg ${bg} ${color}`}
      >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Icon size={40} className="z-10" />
          <span className="font-bold text-xl z-10 text-center leading-tight">{label}</span>
          {type === 'SUSPICIOUS' && <Camera size={16} className="absolute bottom-4 right-4 opacity-50" />}
      </button>
  );

  return (
    <Layout>
        <div className="max-w-5xl mx-auto h-full flex flex-col justify-center min-h-[80vh]">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-white mb-2">Central de Alertas</h1>
                <p className="text-gray-400 text-lg">Acione a rede de proteção da sua comunidade.</p>
            </div>
            
            {/* Hidden Input for Camera */}
            <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={cameraInputRef} 
                onChange={handleCameraCapture}
                className="hidden" 
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <PanicButton 
                    type="PANIC" 
                    icon={ShieldAlert} 
                    label="PÂNICO" 
                    bg="bg-red-600 border-red-500" 
                    color="text-white shadow-[0_0_30px_rgba(220,38,38,0.5)]" 
                />
                <PanicButton 
                    type="DANGER" 
                    icon={AlertTriangle} 
                    label="PERIGO" 
                    bg="bg-orange-600 border-orange-500" 
                    color="text-white shadow-[0_0_30px_rgba(234,88,12,0.5)]" 
                />
                <PanicButton 
                    type="SUSPICIOUS" 
                    icon={Eye} 
                    label="SUSPEITA" 
                    bg="bg-yellow-500 border-yellow-400" 
                    color="text-black shadow-[0_0_30px_rgba(234,179,8,0.5)]" 
                />
                <PanicButton 
                    type="OK" 
                    icon={CheckCircle} 
                    label="ESTOU BEM" 
                    bg="bg-atalaia-neon border-green-400" 
                    color="text-black shadow-[0_0_30px_rgba(0,255,102,0.5)]" 
                />
            </div>

            <Card className="p-8">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-white">
                    <Phone className="text-atalaia-neon" size={24} />
                    Contatos de Emergência
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Polícia */}
                    <a href="tel:190" className="flex items-center gap-4 p-5 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors border border-gray-800 group">
                        <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <Shield size={28} />
                        </div>
                        <div>
                            <span className="block font-bold text-white uppercase tracking-wide">Polícia Militar</span>
                            <span className="text-gray-400 font-mono text-2xl group-hover:text-white transition-colors">190</span>
                        </div>
                    </a>

                    {/* SAMU */}
                    <a href="tel:192" className="flex items-center gap-4 p-5 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors border border-gray-800 group">
                        <div className="p-3 rounded-full bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                            <Ambulance size={28} />
                        </div>
                        <div>
                            <span className="block font-bold text-white uppercase tracking-wide">SAMU</span>
                            <span className="text-gray-400 font-mono text-2xl group-hover:text-white transition-colors">192</span>
                        </div>
                    </a>

                    {/* Bombeiros */}
                    <a href="tel:193" className="flex items-center gap-4 p-5 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors border border-gray-800 group">
                        <div className="p-3 rounded-full bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            <Flame size={28} />
                        </div>
                        <div>
                            <span className="block font-bold text-white uppercase tracking-wide">Bombeiros</span>
                            <span className="text-gray-400 font-mono text-2xl group-hover:text-white transition-colors">193</span>
                        </div>
                    </a>

                        {/* Central 24h */}
                        <a href="tel:08009999999" className="flex items-center gap-4 p-5 bg-atalaia-neon/5 rounded-xl hover:bg-atalaia-neon/10 transition-colors border border-atalaia-neon/30 group shadow-[0_0_15px_rgba(0,255,102,0.05)]">
                        <div className="p-3 rounded-full bg-atalaia-neon/20 text-atalaia-neon group-hover:bg-atalaia-neon group-hover:text-black transition-colors">
                            <Headset size={28} />
                        </div>
                        <div>
                            <span className="block font-bold text-white uppercase tracking-wide">Central 24h</span>
                            <span className="text-atalaia-neon font-mono text-2xl">0800 999 9999</span>
                        </div>
                    </a>
                </div>
            </Card>
        </div>
    </Layout>
  );
};

export default Alerts;
