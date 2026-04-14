import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/axios';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';
import { Bot } from 'lucide-react';

export default function AIEmailModal({ lead, onClose }) {
  const [tone, setTone] = useState('professional');
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');

  const mutation = useMutation({
    mutationFn: () => api.post('/ai/email-generator', { leadId: lead._id, tone, context }),
    onSuccess: (res) => setResult(res.data.data.email),
    onError: () => toast.error('AI generation failed'),
  });

  return (
    <Modal isOpen={true} onClose={onClose} title={`AI Email — ${lead.firstName} ${lead.lastName}`} size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 px-3 py-2 rounded-lg">
          <Bot size={16} />
          Generating a personalized email based on lead profile
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Tone</label>
            <select className="input" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="label">Context (optional)</label>
            <input className="input" value={context} onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Met at conference" />
          </div>
        </div>

        <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary w-full justify-center">
          {mutation.isPending ? 'Generating...' : 'Generate Email'}
        </button>

        {result && (
          <div className="relative">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-gray-50 rounded-lg p-4 max-h-72 overflow-y-auto">
              {result}
            </pre>
            <button
              onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied!'); }}
              className="absolute top-2 right-2 btn-secondary text-xs py-1 px-2"
            >
              Copy
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
