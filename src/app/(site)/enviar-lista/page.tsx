import type { Metadata } from 'next';
import { ListUpload } from '@/components/forms/list-upload';
import { isDemo } from '@/lib/tenant';

export const metadata: Metadata = { title: 'Enviar lista de materiais', description: 'Envie sua lista de materiais digitada, em PDF ou foto. A loja monta o orçamento e responde pelo WhatsApp.' };

export default function EnviarListaPage() {
  return (
    <div className="wrap py-10 md:py-14">
      <h1 className="display max-w-[18ch] text-[clamp(32px,5vw,60px)]">Já tem sua lista de materiais? Envie para nós.</h1>
      <p className="mt-3 max-w-[62ch] text-[16.5px] text-graphite-700">Digite, anexe o PDF do projeto ou fotografe a lista escrita à mão. O atendimento confere item por item e responde com o orçamento.</p>
      <div className="mt-8">
        <ListUpload demo={isDemo} privacy="Concordo que a loja use meus dados e arquivos apenas para montar este orçamento." />
      </div>
    </div>
  );
}
