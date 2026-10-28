// Сүрөт жүктөө: Cloudinary (сервер аркылуу кол коюлган жүктөө) же URL.
import { useState } from 'react';
import { api } from '../../lib/api.js';
import { useI18n } from '../../context/I18nContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import FormField from '../ui/FormField.jsx';

const MAX = 4 * 1024 * 1024;

export default function ImageUpload({ value, onChange, error }) {
  const { t } = useI18n();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) return push('PNG/JPG/WEBP/GIF', 'error');
    if (file.size > MAX) return push('≤ 4 MB', 'error');
    const reader = new FileReader();
    reader.onload = async () => {
      setBusy(true);
      try {
        const r = await api('/api/admin/upload', { method: 'POST', body: { dataUrl: reader.result }, timeout: 30000 });
        onChange(r.url);
        push('✓ Cloudinary');
      } catch (err) {
        push(err.message, 'error');
      } finally {
        setBusy(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="image-upload">
      <FormField label={t('adm.imageUrl')} name="image" value={value || ''} onChange={(e) => onChange(e.target.value)} error={error} placeholder="https://…" />
      <label className="btn btn--outline btn--sm">
        {busy ? t('common.loading') : t('adm.upload')}
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={onFile} disabled={busy} />
      </label>
      {value && <img className="image-upload__preview" src={value} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
    </div>
  );
}
