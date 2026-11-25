import type { Metadata } from 'next';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = { title: 'Privacidade e LGPD' };

export default async function PrivacidadePage() {
  const s = await getSettings();
  return (
    <article className="wrap max-w-[860px] py-12 md:py-16">
      <h1 className="display text-[clamp(32px,5vw,56px)]">Privacidade e LGPD</h1>
      <div className="mt-8 grid gap-6 text-[16.5px] leading-relaxed text-graphite-800 [&_h2]:heading [&_h2]:mt-4 [&_h2]:text-[22px]">
        <p>Esta página explica quais dados {s.storeName} coleta neste site, para quê e como você exerce seus direitos pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
        <h2>Dados coletados</h2>
        <p>Nas solicitações de orçamento e no envio de listas: nome, telefone, e-mail opcional, perfil (por exemplo, pedreiro ou construtora), CEP, bairro, endereço aproximado, itens, observações e arquivos que você anexar.</p>
        <h2>Finalidade e base legal</h2>
        <p>Responder à sua solicitação, preparar o orçamento e combinar a entrega (procedimentos preliminares a um contrato, a seu pedido). Não usamos os dados para publicidade de terceiros.</p>
        <h2>Lista no seu aparelho</h2>
        <p>A lista de orçamento, as listas salvas e o histórico de pedidos ficam guardados apenas no navegador do seu aparelho (armazenamento local). Você apaga tudo limpando os dados do site no navegador.</p>
        <h2>Medição de uso</h2>
        <p>O site conta, por dia, quantas vezes ações como “adicionar à lista” acontecem. A contagem não usa cookies nem identifica pessoas.</p>
        <h2>Compartilhamento</h2>
        <p>Quando você escolhe enviar pelo WhatsApp, a mensagem é aberta no seu aplicativo e enviada por você. Os dados não são vendidos nem cedidos.</p>
        <h2>Retenção e direitos</h2>
        <p>Guardamos as solicitações pelo tempo necessário ao atendimento e às obrigações legais. Para acessar, corrigir ou excluir seus dados, escreva para {s.email}.</p>
        <p className="rounded-[12px] bg-[var(--color-accent-soft)] p-4 text-[15px]">Demonstração da KRB_DIGITAL: antes de publicar para um cliente real, este texto deve ser revisado com o responsável jurídico da loja, incluindo o nome do controlador e o canal do encarregado.</p>
      </div>
    </article>
  );
}
