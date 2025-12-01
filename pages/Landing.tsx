
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, MessageSquare, Users, MapPin, Bell, Clock, BarChart3, MessageCircle, Menu, X, Lock, CreditCard, Smartphone, Download, Printer, Video } from 'lucide-react';
import { Button, Modal } from '../components/UI';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [plateModalOpen, setPlateModalOpen] = useState(false);

  // Lógica para pular a Landing Page se estiver rodando dentro do App (Capacitor)
  useEffect(() => {
    const isApp = (window as any).Capacitor?.isNativePlatform();
    if (isApp) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogin = () => navigate('/login');

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrintPlate = () => {
      window.print();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#050505]/90 backdrop-blur-md border-b border-white/10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-atalaia-neon h-6 w-6" />
              <span className="text-xl font-bold tracking-tight text-white">ATALAIA</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
              <button onClick={() => scrollToSection('como-funciona')} className="text-gray-300 hover:text-white transition-colors">Como funciona</button>
              <button onClick={() => scrollToSection('funcionalidades')} className="text-gray-300 hover:text-white transition-colors">Funcionalidades</button>
              <button onClick={() => scrollToSection('planos')} className="text-gray-300 hover:text-white transition-colors">Planos</button>
              <button onClick={() => setPlateModalOpen(true)} className="flex items-center gap-2 text-atalaia-neon hover:text-white transition-colors border border-atalaia-neon/30 px-3 py-1.5 rounded-full hover:bg-atalaia-neon hover:border-atalaia-neon hover:text-black">
                  <Download size={14} /> Baixar Placa
              </button>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
               {/* Botão de Login transformado em botão principal verde */}
               <Button onClick={handleLogin} variant="primary" className="px-6 py-2 text-sm font-bold">
                 Login
               </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Menu Principal"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-[#0a0a0a] border-b border-white/10 px-4 py-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-5">
             <button onClick={() => scrollToSection('como-funciona')} className="text-left text-base font-medium text-gray-300 hover:text-atalaia-neon py-2">Como funciona</button>
             <button onClick={() => scrollToSection('funcionalidades')} className="text-left text-base font-medium text-gray-300 hover:text-atalaia-neon py-2">Funcionalidades</button>
             <button onClick={() => scrollToSection('planos')} className="text-left text-base font-medium text-gray-300 hover:text-atalaia-neon py-2">Planos</button>
             <button onClick={() => { setPlateModalOpen(true); setMobileMenuOpen(false); }} className="text-left text-base font-medium text-atalaia-neon py-2 flex items-center gap-2">
                 <Download size={18} /> Baixar Modelo de Placa
             </button>
             <hr className="border-white/10 my-2" />
             <Button onClick={handleLogin} variant="primary" className="w-full justify-center py-3 font-bold">
                 Login
             </Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center pt-20 overflow-hidden print:hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://locacess.com.br/wp-content/uploads/2024/11/Cameras-de-bairro-aumentando-a-Seguranca-Comunitaria.jpg" 
            alt="Rua residencial à noite com vigilância" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6 max-w-3xl">
            Atalaia — <span className="text-atalaia-neon">Segurança</span><br />
            <span className="text-atalaia-neon">Colaborativa</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed">
            Vigie sua rua. Proteja sua comunidade. Sistema de alertas comunitários com mapas em tempo real e integração com WhatsApp.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Redireciona para Planos em vez de cadastrar direto */}
            <Button onClick={() => scrollToSection('planos')} className="h-12 sm:h-14 px-8 text-sm sm:text-base font-bold uppercase tracking-wide w-full sm:w-auto">
              Entrar no Grupo do meu Bairro
            </Button>
            <button 
                onClick={handleLogin}
                className="h-12 sm:h-14 px-8 text-sm sm:text-base font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 hover:border-white transition-all uppercase tracking-wide w-full sm:w-auto"
            >
              Entrar no Sistema
            </button>
          </div>
        </div>
      </section>

      {/* Seção Como Funciona */}
      <section id="como-funciona" className="py-16 md:py-24 bg-[#0a0a0a] print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Como funciona?</h2>
            <p className="text-gray-400">Um ciclo simples para uma segurança poderosa.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Users, 
                title: "Cadastro", 
                desc: "O integrador cadastra sua rua e moradores e se inscreve em poucos passos." 
              },
              { 
                icon: Zap, 
                title: "Alerta Instantâneo", 
                desc: "Moradores contam alertas de perigo ou suspeitas que são divulgadas em tempo real." 
              },
              { 
                icon: MessageSquare, 
                title: "Notificação: sem WhatsApp", 
                desc: "O alerta vai instantaneamente para o WhatsApp da comunidade inteira via chatbot." 
              },
              { 
                icon: ShieldCheck, 
                title: "Comunidade Segura", 
                desc: "Ajuda rápida e coordenada em menos a segurança de todos os moradores." 
              }
            ].map((item, i) => (
              <div key={i} className="bg-[#111] p-6 md:p-8 rounded-2xl border border-white/5 hover:border-atalaia-neon/30 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-atalaia-neon mb-6 border border-white/5">
                  <item.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção Funcionalidades */}
      <section id="funcionalidades" className="py-16 md:py-24 bg-[#050505] border-t border-white/5 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Funcionalidades</h2>
            <p className="text-gray-400">Ferramentas para uma vigilância completa e colaborativa.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: MapPin, title: "Mapa Interativo", desc: "Visualize todos os alertas em tempo real na tela do seu celular." },
              { icon: Bell, title: "Botão de Alerta", desc: "Envie alertas de Perigo, Suspeita ou Tudo OK com apenas um toque." },
              { icon: Clock, title: "Histórico de Eventos", desc: "Acesse um histórico completo das ocorrências em seu bairro." },
              { icon: ShieldCheck, title: "Painel Administrativo", desc: "Gerencia completa de usuários, regiões e alertas para administradores." },
              { icon: BarChart3, title: "Estatísticas de Segurança", desc: "Gráficos e relatórios sobre a frequência e tipo de alertas do bairro." },
              { icon: MessageCircle, title: "Bate-papo em Tempo Real", desc: "Comunique-se instantaneamente com todos os vizinhos para coordenar e ajudar." },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl bg-[#0a0a0a] border border-white/5 flex items-start gap-4 hover:bg-[#111] transition-colors">
                <div className="p-3 rounded-lg bg-atalaia-neon/10 text-atalaia-neon shrink-0">
                  <feature.icon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- ANÚNCIO DO APP ANDROID ---- */}
      <section className="py-12 bg-gradient-to-r from-[#0d1410] to-[#0a0a0a] border-y border-atalaia-neon/20 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-atalaia-neon/10 border border-atalaia-neon/30 text-atalaia-neon text-xs font-bold uppercase tracking-wider mb-4">
                        <Smartphone size={14} /> Novo Aplicativo
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Leve a segurança no seu bolso.
                    </h2>
                    <p className="text-gray-400 text-lg mb-6 max-w-xl">
                        Baixe agora o aplicativo oficial do <strong>Atalaia</strong> para Android. 
                        Acesso rápido ao botão de pânico, notificações push e monitoramento em tempo real sem abrir o navegador.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a 
                            href="/atalaia.apk"
                            download="Atalaia-App.apk"
                            className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            <Download size={20} />
                            <span>Baixar APK Android</span>
                        </a>
                    </div>
                </div>
                
                {/* Visual Mockup - REAL LOGIN SCREEN SIMULATION */}
                <div className="relative w-full max-w-sm md:w-1/3 aspect-[9/16] bg-[#050505] border-[8px] border-[#1a1a1a] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                    {/* Status Bar / Notch */}
                    <div className="w-full h-8 bg-black z-20 flex justify-center shrink-0">
                        <div className="w-1/3 h-5 bg-[#1a1a1a] rounded-b-xl"></div>
                    </div>
                    
                    {/* Screen Content: REAL LOGIN INTERFACE */}
                    <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full">
                        {/* Background Blur Effect */}
                        <div className="absolute top-[-20%] right-[-10%] w-[200px] h-[200px] bg-atalaia-neon/10 rounded-full blur-[50px]" />
                        
                        {/* Logo Area */}
                        <div className="w-14 h-14 rounded-2xl bg-atalaia-neon/10 text-atalaia-neon flex items-center justify-center mb-4 border border-atalaia-neon/20 shadow-[0_0_15px_rgba(0,255,102,0.2)]">
                             <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Acesso Atalaia</h3>
                        <p className="text-gray-500 text-[10px] mb-8">Entre para monitorar.</p>

                        {/* Fake Form */}
                        <div className="w-full space-y-4 mb-6">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Email</label>
                                <div className="h-10 w-full bg-[#111] border border-gray-800 rounded-lg flex items-center px-3 text-xs text-gray-400">usuario@atalaia.com</div>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Senha</label>
                                <div className="h-10 w-full bg-[#111] border border-gray-800 rounded-lg flex items-center px-3 text-xs text-gray-400">••••••••</div>
                            </div>
                        </div>

                        {/* Fake Button */}
                        <div className="h-12 w-full bg-atalaia-neon rounded-lg shadow-[0_0_15px_rgba(0,255,102,0.3)] flex items-center justify-center mb-6">
                             <span className="text-black font-bold text-sm">Entrar no Sistema</span>
                        </div>
                        
                        <p className="text-[10px] text-gray-600">Não tem conta? <span className="text-gray-400">Crie agora</span></p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-16 md:py-24 bg-[#0a0a0a] print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Escolha seu Plano</h2>
            <p className="text-gray-400">Atualizar para desbloquear recursos avançados de segurança</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start mb-16">
            {/* Gratuito */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-2">Gratuito</h3>
              <p className="text-xs text-gray-500 mb-6">Para começar a proteger</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold text-atalaia-neon">R$ 0</span>
                <span className="text-sm text-gray-500 mb-1">/mens</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm">
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-atalaia-neon">✓</span> Monitoramento básico limitado
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-atalaia-neon">✓</span> Até 5 alertas por mês
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-atalaia-neon">✓</span> Histórico de 7 dias
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-atalaia-neon">✓</span> Suporte por e-mail
                </li>
              </ul>
              <button onClick={() => navigate('/login?mode=register&plan=FREE')} className="w-full py-3 rounded-lg border border-white/10 text-white hover:border-atalaia-neon hover:text-atalaia-neon transition-colors text-sm font-medium">
                Começar
              </button>
            </div>

            {/* Família */}
            <div className="bg-[#111] border border-atalaia-neon rounded-2xl p-8 relative transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-atalaia-neon text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Popular</div>
              <h3 className="text-xl font-bold text-white mb-2">Família</h3>
              <p className="text-xs text-gray-500 mb-6">Acesso para famílias</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold text-atalaia-neon">R$ 39,90</span>
                <span className="text-sm text-gray-500 mb-1">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm">
                <li className="flex items-center gap-3 text-white">
                  <span className="text-atalaia-neon">✓</span> Monitoramento básico de segurança
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-atalaia-neon">✓</span> Alertas em tempo real
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-atalaia-neon">✓</span> Bate-papo
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-atalaia-neon">✓</span> Estatísticas personalizadas
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-atalaia-neon">✓</span> Histórico de 30 dias
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-atalaia-neon">✓</span> Prioritário
                </li>
                <li className="flex items-center gap-3 text-white">
                  <span className="text-atalaia-neon">✓</span> Backup em Nuvem
                </li>
              </ul>
              <Button onClick={() => navigate('/login?mode=register&plan=FAMILY')} className="w-full py-3">
                Selecione Família
              </Button>
            </div>

            {/* Prêmio */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-2">Prêmio</h3>
              <p className="text-xs text-gray-500 mb-6">Segurança máxima para seu bairro</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold text-atalaia-neon">R$ 79,90</span>
                <span className="text-sm text-gray-500 mb-1">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm">
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-atalaia-neon">✓</span> Tudo do plano Família
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-atalaia-neon">✓</span> Câmeras ilimitadas
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-atalaia-neon">✓</span> IA para detecção de anomalias
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-atalaia-neon">✓</span> Relatórios personalizados
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-atalaia-neon">✓</span> Suporte 24 horas por dia
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-atalaia-neon">✓</span> Integração com sistemas externos
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="text-atalaia-neon">✓</span> Acesso antecipado a novos recursos
                </li>
              </ul>
              <button onClick={() => navigate('/login?mode=register&plan=PREMIUM')} className="w-full py-3 rounded-lg border border-white/10 text-white hover:border-atalaia-neon hover:text-atalaia-neon transition-colors text-sm font-medium">
                Premium
              </button>
            </div>
          </div>

          {/* Mercado Pago Badge Melhorado */}
          <div className="max-w-2xl mx-auto bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
               <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest font-semibold flex items-center gap-2">
                   <Lock size={14} className="text-atalaia-neon" /> Pagamentos Processados com Segurança
               </p>
               
               <div className="bg-white px-8 py-4 rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.05)] mb-6 transition-transform hover:scale-105">
                   <img 
                        src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo.png" 
                        alt="Mercado Pago" 
                        className="h-8 object-contain"
                   />
               </div>

               <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                        <span className="text-atalaia-neon">💠</span> Pix (Aprovação Imediata)
                    </span>
                    <span className="flex items-center gap-2">
                        <CreditCard size={16} className="text-atalaia-neon" /> Cartão de Crédito
                    </span>
                    <span className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-atalaia-neon" /> Ambiente Criptografado
                    </span>
               </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-[#050505] to-[#0a1f0a] border-t border-white/5 print:hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Transforme sua rua em um território seguro.<br/>
            Seja um <span className="text-atalaia-neon">Atalaia</span>.
          </h2>
          <Button onClick={() => scrollToSection('planos')} className="h-14 px-8 text-lg mt-4 w-full md:w-auto">
            Criar Grupo da Minha Comunidade Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0e0e0e] border-t border-white/5 text-gray-400 text-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-atalaia-neon h-5 w-5" />
              <span className="font-bold text-white">ATALAIA</span>
            </div>
            <p className="text-xs leading-relaxed">Sua comunidade mais segura, de tempo em espaço, prevenindo e reagindo a incidentes.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Navegação</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-atalaia-neon">Como funciona</a></li>
              <li><a href="#" className="hover:text-atalaia-neon">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-atalaia-neon">por</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Contato</h4>
            <ul className="space-y-2 text-xs">
              <li>contato@atalaia.com.br</li>
              <li>(48) 99999-9999</li>
              <li>Santa Catarina, SC - Brasil</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Jurídico</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-atalaia-neon">Termos de serviço</a></li>
              <li><a href="#" className="hover:text-atalaia-neon">Política de</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/5 text-center text-xs">
          © 2025 ATALAIA – Segurança Colaborativa. Por Alien Monitoramento Eletrônico Ltada Todos os direitos reservados.
        </div>
      </footer>

      {/* MODAL DE PLACA DE SEGURANÇA */}
      <Modal isOpen={plateModalOpen} onClose={() => setPlateModalOpen(false)}>
          {/* Print CSS Injection */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #security-plate, #security-plate * {
                visibility: visible;
              }
              #security-plate {
                position: fixed;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 100%;
                max-width: 20cm; /* Approx size */
                height: auto;
                margin: 0;
                padding: 2rem;
                background-color: black !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                z-index: 9999;
                border: 6px solid #00FF66 !important;
              }
            }
          `}</style>

          <div className="flex flex-col items-center justify-center p-8 bg-[#0a0a0a]">
              <h2 className="text-2xl font-bold text-white mb-2 print:hidden">Modelo de Placa</h2>
              <p className="text-gray-400 text-sm mb-4 text-center print:hidden">
                  Utilize este design para imprimir em placas de PS ou Metal.
              </p>
              
              <div className="mb-6 flex items-center justify-center gap-2 bg-atalaia-neon/10 border border-atalaia-neon/30 text-atalaia-neon px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider print:hidden">
                  ⚠ Padrão de Impressão: 20cm x 30cm (Proporção 2:3)
              </div>

              {/* AREA DE IMPRESSÃO - PLACA FUTURISTA 20x30cm (2:3 aspect) */}
              <div 
                  id="security-plate"
                  className="w-full max-w-[300px] aspect-[2/3] bg-black border-[6px] border-atalaia-neon rounded-xl flex flex-col items-center justify-between p-6 relative shadow-[0_0_60px_rgba(0,255,102,0.2)] overflow-hidden"
              >
                  {/* Scanline Effect - hidden in print usually but kept just in case */}
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,102,0.05)_50%)] bg-[length:100%_4px] pointer-events-none print:hidden" />
                  
                  {/* Top Warning */}
                  <div className="w-full text-center relative z-10 mt-2">
                      <div className="inline-block bg-atalaia-neon text-black font-black text-lg px-6 py-1 rounded-sm mb-3 tracking-[0.2em] uppercase transform -skew-x-12 print:bg-[#00FF66]">
                          ATENÇÃO
                      </div>
                      <h3 className="text-white font-black text-3xl uppercase tracking-tighter leading-none mb-2">ÁREA<br/><span className="text-atalaia-neon text-4xl">PROTEGIDA</span></h3>
                  </div>

                  {/* FRASE DE MONITORAMENTO */}
                  <div className="relative z-10 bg-atalaia-neon/10 w-[120%] py-1.5 transform -skew-x-12 border-y border-atalaia-neon/30 mb-2">
                      <p className="text-atalaia-neon font-black text-[11px] text-center uppercase tracking-[0.15em] transform skew-x-12 px-6">
                          ÁREA MONITORADA POR MORADORES
                      </p>
                  </div>

                  {/* Central Icon */}
                  <div className="relative z-10 my-2">
                      <div className="w-24 h-24 border-4 border-atalaia-neon rounded-full flex items-center justify-center bg-black/50 backdrop-blur shadow-[0_0_30px_rgba(0,255,102,0.4)] print:bg-black print:shadow-none">
                          <ShieldCheck size={48} className="text-atalaia-neon" />
                      </div>
                  </div>

                  {/* Bottom Info with QR */}
                  <div className="w-full text-center relative z-10 flex flex-col items-center justify-end flex-1">
                      <h4 className="text-white font-bold text-2xl tracking-[0.3em] mb-3">ATALAIA</h4>
                      
                      <div className="bg-white p-2 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.2)] mb-1">
                          <img 
                            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://atalaia.cloud" 
                            alt="QR Code" 
                            className="w-16 h-16"
                          />
                      </div>
                      <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold mt-1">Acesse para Monitorar</p>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-3 left-3 w-2 h-2 bg-atalaia-neon rounded-full" />
                  <div className="absolute top-3 right-3 w-2 h-2 bg-atalaia-neon rounded-full" />
                  <div className="absolute bottom-3 left-3 w-2 h-2 bg-atalaia-neon rounded-full" />
                  <div className="absolute bottom-3 right-3 w-2 h-2 bg-atalaia-neon rounded-full" />
              </div>

              <div className="mt-8 w-full flex gap-4 max-w-md print:hidden">
                  <Button variant="outline" onClick={() => setPlateModalOpen(false)} className="flex-1">
                      Fechar
                  </Button>
                  <Button onClick={handlePrintPlate} className="flex-1">
                      <Printer size={18} className="mr-2" /> Imprimir
                  </Button>
              </div>
          </div>
      </Modal>

    </div>
  );
};

export default Landing;
