'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Check, FileText, ImageIcon, MessageCircle, Paperclip, X } from 'lucide-react';
import { formatCep, formatPhone, profileLabel } from '@/lib/format';
import { ACCEPT, MAX_FILES, MAX_FILE_BYTES, MAX_TOTAL_BYTES } from '@/lib/upload';
import { Field } from './quote-builder';
import { track } from '@/lib/track';

const OK_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', ''];

export function ListUpload({ privacy, demo }: { privacy: string; demo: boolean }) {
  const [form, setForm] = useState({ name: '', phone: '', profile: 'morador', mode: 'entrega' as 'entrega' | 'retirada', cep: '', district: '', listText: '', notes: '', consent: false, website: '' });
  const up = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [fatal, setFatal] = useState<string | null>(null);
  const [done, setDone] = useState<{ code: string; whatsapp: string; files: number } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFileError(null);
    const next = [...files];
    for (const f of Array.from(list)) {
      if (next.length >= MAX_FILES) {
        setFileError(`Envie no máximo ${MAX_FILES} arquivos.`);
        break;
      }
      if (!OK_TYPES.includes(f.type) && !/\.(pdf|jpe?g|png|webp|heic|heif)$/i.test(f.name)) {
        setFileError(`${f.name}: formato não aceito. Use PDF, JPG, PNG, WEBP ou HEIC.`);
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        setFileError(`${f.name}: maior que 8 MB.`);
        continue;
      }
      next.push(f);
    }
    if (next.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_BYTES) {
      setFileError('Os arquivos somam mais de 20 MB.');
      return;
    }
    setFiles(next);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setErrors({});
    setFatal(null);
    const fd = new FormData();
    fd.set('data', JSON.stringify({ customer: { name: form.name, phone: form.phone, profile: form.profile }, delivery: { mode: form.mode, cep: form.cep, district: form.district }, listText: form.listText, notes: form.notes, consent: form.consent, website: form.website }));
    for (const f of files) fd.append('files', f);
    try {
      const res = await fetch('/api/lists', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.status === 422) setErrors(data.errors ?? {});
      else if (!res.ok) setFatal(data.error ?? 'Não foi possível enviar agora.');
      else setDone(data);
    } catch {
      setFatal('Sem conexão com a internet. Tente de novo.');
    } finally {
      setSending(false);
    }
  };

  if (done)
    return (
      <div className="card grid max-w-[680px] gap-4 p-6 md:p-8" role="status">
        <p className="inline-flex items-center gap-2 font-semibold text-ok">
          <Check className="h-5 w-5" aria-hidden /> Lista recebida
        </p>
        <h2 className="heading text-[26px]">Pedido nº {done.code}</h2>
        <p className="text-graphite-700">Uma pessoa do atendimento vai conferir {done.files ? `a lista e ${done.files} anexo(s)` : 'a lista'} e responder com o orçamento. Se quiser agilizar, avise pelo WhatsApp com o número do pedido.</p>
        {demo ? <p className="rounded-[10px] bg-[var(--color-accent-soft)] p-3 text-[14px]">Modo demonstração: os arquivos foram verificados e descartados, sem ficarem guardados.</p> : null}
        <a href={done.whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp_click')} className="btn btn-primary w-fit">
          <MessageCircle className="h-4 w-4" aria-hidden /> Avisar pelo WhatsApp
        </a>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-start">
      <div className="card grid gap-5 p-5 md:p-6">
        <Field label="Digite a lista (um item por linha)" error={errors.listText}>
          {(p) => <textarea {...p} className="input" rows={9} placeholder={'Ex.:\n20 sacos de cimento\n3 m³ de areia média\n2 milheiros de bloco 9×19×29'} value={form.listText} onChange={(e) => up('listText', e.target.value)} />}
        </Field>
        <div className="grid gap-3">
          <span className="text-[14px] font-semibold">Ou anexe arquivos</span>
          <div
            className="grid place-items-center gap-2 rounded-[12px] border-2 border-dashed border-concrete-300 bg-mineral-50 p-6 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
          >
            <Paperclip className="h-6 w-6 text-steel-500" aria-hidden />
            <p className="text-[15px]">PDF do projeto, foto da lista escrita à mão ou print do orçamento.</p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => input.current?.click()}>
              Escolher arquivos
            </button>
            <input ref={input} type="file" accept={ACCEPT} multiple className="sr-only" aria-label="Anexar arquivos" onChange={(e) => addFiles(e.target.files)} />
            <p className="text-[13px] text-text-dim">Até {MAX_FILES} arquivos, 8 MB cada, 20 MB no total.</p>
          </div>
          {fileError || errors.files ? <p className="field-error">{fileError ?? errors.files}</p> : null}
          {files.length ? (
            <ul className="grid gap-2">
              {files.map((f, i) => (
                <li key={f.name + i} className="flex items-center gap-3 rounded-[10px] bg-mineral-50 px-3 py-2 text-[14.5px]">
                  {f.type === 'application/pdf' ? <FileText className="h-5 w-5" aria-hidden /> : <ImageIcon className="h-5 w-5" aria-hidden />}
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                  <span className="tabular text-text-dim">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                  <button type="button" aria-label={`Remover ${f.name}`} className="grid h-9 w-9 place-items-center rounded-md" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-[13.5px] text-text-dim">Os arquivos são lidos por uma pessoa do atendimento. Não há leitura automática.</p>
        </div>
      </div>
      <div className="card grid gap-5 p-5 md:p-6">
        <Field label="Nome" error={errors['customer.name']}>
          {(p) => <input {...p} className="input" autoComplete="name" value={form.name} onChange={(e) => up('name', e.target.value)} />}
        </Field>
        <Field label="WhatsApp ou telefone com DDD" error={errors['customer.phone']}>
          {(p) => <input {...p} className="input tabular" inputMode="tel" autoComplete="tel" placeholder="(19) 90000-0000" value={form.phone} onChange={(e) => up('phone', formatPhone(e.target.value))} />}
        </Field>
        <Field label="Você é">
          {(p) => (
            <select {...p} className="input" value={form.profile} onChange={(e) => up('profile', e.target.value)}>
              {Object.entries(profileLabel).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          )}
        </Field>
        <fieldset className="grid gap-3">
          <legend className="mb-2 text-[14px] font-semibold">Como receber</legend>
          <div className="grid grid-cols-2 gap-2">
            {(['entrega', 'retirada'] as const).map((m) => (
              <label key={m} className={`flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] text-[15px] font-semibold ring-[1.5px] ${form.mode === m ? 'bg-graphite-900 text-white ring-graphite-900' : 'ring-concrete-300'}`}>
                <input type="radio" name="mode-l" checked={form.mode === m} onChange={() => up('mode', m)} className="sr-only" />
                {m === 'entrega' ? 'Entrega na obra' : 'Retirar na loja'}
              </label>
            ))}
          </div>
          {form.mode === 'entrega' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CEP" error={errors['delivery.cep']}>
                {(p) => <input {...p} className="input tabular" inputMode="numeric" placeholder="13000-000" value={form.cep} onChange={(e) => up('cep', formatCep(e.target.value))} />}
              </Field>
              <Field label="Bairro">{(p) => <input {...p} className="input" value={form.district} onChange={(e) => up('district', e.target.value)} />}</Field>
            </div>
          ) : null}
        </fieldset>
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website} onChange={(e) => up('website', e.target.value)} />
        <div className="grid gap-1">
          <label className="flex items-start gap-3 text-[14.5px]">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--color-accent)]" checked={form.consent} onChange={(e) => up('consent', e.target.checked)} />
            <span>
              {privacy}{' '}
              <Link href="/privacidade" className="underline">
                Política de privacidade
              </Link>
              .
            </span>
          </label>
          {errors.consent ? <p className="field-error">{errors.consent}</p> : null}
        </div>
        {fatal ? (
          <p role="alert" className="rounded-[10px] bg-[#fdecea] p-3 text-[14.5px]">
            {fatal}
          </p>
        ) : null}
        <button className="btn btn-primary w-full" disabled={sending}>
          {sending ? 'Enviando…' : 'Enviar lista para o atendimento'}
        </button>
      </div>
    </form>
  );
}
