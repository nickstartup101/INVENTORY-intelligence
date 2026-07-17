import { useState } from 'react';
import { verifyManagerPin } from '../services/settingsService';

interface ManagerPinGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ManagerPinGate({ onSuccess, onCancel }: ManagerPinGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleSubmit = async () => {
    if (!pin) return;
    setChecking(true);
    setError('');
    try {
      const ok = await verifyManagerPin(pin);
      if (ok) {
        onSuccess();
      } else {
        setError('ລະຫັດບໍ່ຖືກຕ້ອງ');
        setPin('');
      }
    } catch (err) {
      console.error(err);
      setError('ກວດລະຫັດລົ້ມເຫລວ, ລອງໃໝ່ອີກຄັ້ງ');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold text-white">ເຂົ້າສູ່ໂໝດຜູ້ຈັດການ</h2>
        <p className="text-sm text-white/60">ໃສ່ລະຫັດຜ່ານຜູ້ຈັດການເພື່ອດຳເນີນການຕໍ່</p>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-center text-2xl tracking-[0.5em] text-white outline-none focus:border-white/40"
          autoFocus
          maxLength={12}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm"
          >
            ຍົກເລີກ
          </button>
          <button
            onClick={handleSubmit}
            disabled={checking || !pin}
            className="flex-1 py-2 rounded-lg bg-white text-black text-sm font-medium disabled:opacity-50"
          >
            {checking ? 'ກຳລັງກວດ...' : 'ຢືນຢັນ'}
          </button>
        </div>
      </div>
    </div>
  );
}
