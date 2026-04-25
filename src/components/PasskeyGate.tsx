import { useState } from 'react';

interface Props {
  onSuccess: () => void;
}

const PasskeyGate: React.FC<Props> = ({ onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const expected = (import.meta.env.VITE_PASSCODE as string) || '1234';

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (code === expected) {
      onSuccess();
    } else {
      setError('Incorrect passcode');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Enter 4-digit passcode</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            inputMode="numeric"
            maxLength={4}
            value={code}
            onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
            className="px-4 py-3 border rounded-md text-xl text-center tracking-widest"
            placeholder="• • • •"
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Unlock
            </button>
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-3">Provide `VITE_PASSCODE` in your `.env` for production.</p>
      </div>
    </div>
  );
};

export default PasskeyGate;
