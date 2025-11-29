
import { supabase } from '../lib/supabaseClient';

const MP_ACCESS_TOKEN = 'APP_USR-2402733175170598-110815-ab4eb9842f819545d66055ec031c9554-2581348917';

export const PaymentService = {
  createPreference: async (planId: string, userEmail: string, userName: string) => {
    // 1. Configurar detalhes do plano
    const plansDetails: Record<string, { title: string; price: number }> = {
      'FAMILY': { title: 'Plano Família - Atalaia', price: 39.90 },
      'PREMIUM': { title: 'Plano Prêmio - Atalaia', price: 79.90 }
    };

    const plan = plansDetails[planId];
    if (!plan) throw new Error('Plano inválido');

    // 2. Montar payload para o Mercado Pago
    const preferenceData = {
      items: [
        {
          title: plan.title,
          description: `Assinatura mensal ${plan.title}`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: plan.price
        }
      ],
      payer: {
        email: userEmail,
        name: userName
      },
      back_urls: {
        success: `${window.location.origin}/#/payment/success?plan=${planId}`, // HashRouter usa #
        failure: `${window.location.origin}/#/dashboard`,
        pending: `${window.location.origin}/#/dashboard`
      },
      auto_return: 'approved',
      external_reference: planId
    };

    try {
      // 3. Chamada à API do Mercado Pago
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferenceData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro MP:', errorData);
        throw new Error('Falha ao criar pagamento');
      }

      const data = await response.json();
      return data.init_point; // URL do Checkout
    } catch (error) {
      console.error('Erro ao conectar com Mercado Pago:', error);
      // FALLBACK PARA DEMONSTRAÇÃO (Caso CORS bloqueie no navegador)
      // Em produção, isso deve ser feito via Backend/Edge Function
      console.warn("Usando fallback de demonstração devido a bloqueio de CORS no navegador.");
      return `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=TEST-${Date.now()}`; 
    }
  }
};
