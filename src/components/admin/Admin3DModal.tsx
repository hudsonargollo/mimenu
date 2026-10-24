/**
 * Admin3DModal — Restaurant-owner interface for the AI 3D generation pipeline
 * (PRD Task 4: app/admin/menu/components/Admin3DModal.jsx, adapted to this
 * Vite + Cloudflare Functions stack — server action replaced by
 * `startARGeneration()` → POST /api/ar/generate).
 *
 * Tabs:
 *   - AI Photo-to-3D: kicks off a Meshy Image-to-3D task and polls /api/ar/status
 *   - Manual upload / direct URLs: register .glb / .usdz URLs manually
 * Live sandbox preview via <ARMenuViewer> (dynamic client-side import).
 */

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, FolderOpen } from 'lucide-react';
import ARMenuViewer from '@/components/ARMenuViewer';
import { fetchARTaskStatus, startARGeneration, type ARStatus } from '@/hooks/useARModels';

interface Admin3DModalProps {
  menuItem: { id: string; name: string; image_url?: string | null };
  initial?: {
    ar_status?: ARStatus;
    task_id?: string;
    glb_url?: string;
    usdz_url?: string;
    thumbnail_url?: string;
  };
}

const Admin3DModal: React.FC<Admin3DModalProps> = ({ menuItem, initial }) => {
  const [imageUrl, setImageUrl] = useState(menuItem?.image_url || '');
  const [status, setStatus] = useState<ARStatus>(initial?.ar_status || 'none');
  const [glbUrl, setGlbUrl] = useState(initial?.glb_url || '');
  const [usdzUrl, setUsdzUrl] = useState(initial?.usdz_url || '');
  const [taskId, setTaskId] = useState(initial?.task_id || '');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll status while generating (PRD behaviour, ported to /api/ar/status).
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (status === 'generating' && taskId) {
      interval = setInterval(async () => {
        try {
          const data = await fetchARTaskStatus(taskId);
          setProgress(data.progress ?? 0);
          if (data.status === 'SUCCEEDED') {
            // Worker-hosted files first, Meshy-signed URLs as a temporary fallback.
            const readyGlb = data.glb_url || data.meshy_glb_url;
            const readyUsdz = data.usdz_url || data.meshy_usdz_url;
            if (readyGlb) {
              setStatus('ready');
              setGlbUrl(readyGlb);
              setUsdzUrl(readyUsdz || '');
            } else {
              setStatus('failed');
              setError('3D generation succeeded but asset hosting failed on the VPS worker.');
            }
            if (interval) clearInterval(interval);
          } else if (data.status === 'FAILED') {
            setStatus('failed');
            setError(data.error || '3D generation failed on server.');
            if (interval) clearInterval(interval);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 5000);
    }
    return () => interval && clearInterval(interval);
  }, [status, taskId]);

  const handleAIGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await startARGeneration(menuItem.id, imageUrl, menuItem.name);
      if (res.success && res.taskId) {
        setTaskId(res.taskId);
        setStatus('generating');
        setProgress(0);
        setGlbUrl('');
        setUsdzUrl('');
      } else {
        setError(res.error || 'Failed to start generation.');
        setStatus('failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const g = String(fd.get('glb_url') || '').trim();
    const u = String(fd.get('usdz_url') || '').trim();
    if (!g) {
      setError('A .glb URL is required (Android + sandbox render).');
      return;
    }
    try {
      const res = await fetch('/api/ar/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuItemId: menuItem.id,
          glbUrl: g,
          usdzUrl: u || undefined,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to register URLs.');
      setStatus('ready');
      setGlbUrl(g);
      setUsdzUrl(u);
      setTaskId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save URLs.');
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Gerenciador 3D AR: {menuItem.name}</h3>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="ai" className="gap-2">
            <Camera className="w-4 h-4" />
            IA Foto-para-3D
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Upload Manual (.glb / .usdz)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <form onSubmit={handleAIGenerate} className="space-y-4">
            <div>
              <Label htmlFor="ar-image-url">URL da Foto do Prato</Label>
              <Input
                id="ar-image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/hamburguer.jpg"
                required
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG ou WebP público (máx. 20&nbsp;MB). Use a foto do produto cadastrada.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || status === 'generating'}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-50"
            >
              {loading
                ? 'Inicializando...'
                : status === 'generating'
                  ? `Construindo modelo 3D (${progress || 1}%)...`
                  : 'Gerar 3D com IA (Meshy)'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="upload">
          <p className="text-sm text-muted-foreground mb-3">
            Registre assets compilados (.glb / .usdz) já hospedados (Supabase Storage, CDN, etc.).
          </p>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <Label htmlFor="ar-glb-url">URL .glb (Android + preview)</Label>
              <Input id="ar-glb-url" name="glb_url" type="url" placeholder="https://.../modelo.glb" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="ar-usdz-url">URL .usdz (iOS Quick Look)</Label>
              <Input id="ar-usdz-url" name="usdz_url" type="url" placeholder="https://.../modelo.usdz" className="mt-1" />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
              Salvar URLs de AR
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="font-semibold text-sm text-gray-800 mb-3">Preview AR Sandbox</h4>
        {status === 'ready' && glbUrl ? (
          <ARMenuViewer glbSrc={glbUrl} iosSrc={usdzUrl || glbUrl} altText={menuItem.name} productName={menuItem.name} />
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
            {status === 'generating' ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                <p className="text-sm font-medium text-indigo-600">Gerando ativo 3D no worker VPS... {progress > 0 ? `${progress}%` : ''}</p>
              </div>
            ) : (
              <p className="text-sm">Nenhum modelo 3D gerado ou enviado ainda.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin3DModal;
