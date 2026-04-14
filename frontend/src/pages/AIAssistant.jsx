import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useList } from '../hooks/useApi';
import api from '../lib/axios';
import { Bot, Mail, MessageSquare, Phone, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState('email');
  const [selectedLead, setSelectedLead] = useState('');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('professional');
  const [incomingEmail, setIncomingEmail] = useState('');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState('');

  const { data: leadsData } = useList('leads', { limit: 50 });
  const leads = leadsData?.data?.leads || [];

  const emailMutation = useMutation({
    mutationFn: () => api.post('/ai/email-generator', { leadId: selectedLead, context, tone }),
    onSuccess: (res) => setResult(res.data.data.email),
    onError: () => toast.error('AI generation failed'),
  });

  const replyMutation = useMutation({
    mutationFn: () => api.post('/ai/reply-suggestions', { incomingEmail, leadId: selectedLead }),
    onSuccess: (res) => setResult(res.data.data.suggestions),
    onError: () => toast.error('AI generation failed'),
  });

  const transcriptMutation = useMutation({
    mutationFn: () => api.post('/ai/analyze-transcript', { transcript }),
    onSuccess: (res) => setResult(JSON.stringify(res.data.data.analysis, null, 2)),
    onError: () => toast.error('Analysis failed'),
  });

  const scoreMutation = useMutation({
    mutationFn: () => api.post(`/ai/score-lead/${selectedLead}`),
    onSuccess: (res) => {
      const { score, reason, priority } = res.data.data;
      setResult(`Score: ${score}/100\nPriority: ${priority}\n\n${reason}`);
      toast.success(`Lead scored: ${score}/100`);
    },
    onError: () => toast.error('Scoring failed'),
  });

  const tabs = [
    { id: 'email', label: 'Email Generator', icon: Mail },
    { id: 'reply', label: 'Reply Suggestions', icon: MessageSquare },
    { id: 'transcript', label: 'Call Analysis', icon: Phone },
    { id: 'score', label: 'Lead Scoring', icon: Star },
  ];

  const isLoading = emailMutation.isPending || replyMutation.isPending || transcriptMutation.isPending || scoreMutation.isPending;

  const handleRun = () => {
    setResult('');
    if (activeTab === 'email') emailMutation.mutate();
    if (activeTab === 'reply') replyMutation.mutate();
    if (activeTab === 'transcript') transcriptMutation.mutate();
    if (activeTab === 'score') scoreMutation.mutate();
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Bot size={24} className="text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
          <p className="text-sm text-gray-500">Powered by smart rule-based engine — generate emails, analyze calls, score leads</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setResult(''); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-gray-800">Input</h3>

          {(activeTab === 'email' || activeTab === 'reply' || activeTab === 'score') && (
            <div>
              <label className="label">Select Lead</label>
              <select className="input" value={selectedLead} onChange={(e) => setSelectedLead(e.target.value)}>
                <option value="">Choose a lead...</option>
                {leads.map((l) => (
                  <option key={l._id} value={l._id}>{l.firstName} {l.lastName} — {l.company || 'No company'}</option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'email' && (
            <>
              <div>
                <label className="label">Tone</label>
                <select className="input" value={tone} onChange={(e) => setTone(e.target.value)}>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="label">Additional Context (optional)</label>
                <textarea className="input" rows={3} value={context} onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. They attended our webinar last week..." />
              </div>
            </>
          )}

          {activeTab === 'reply' && (
            <div>
              <label className="label">Incoming Email</label>
              <textarea className="input" rows={5} value={incomingEmail} onChange={(e) => setIncomingEmail(e.target.value)}
                placeholder="Paste the email you received..." />
            </div>
          )}

          {activeTab === 'transcript' && (
            <div>
              <label className="label">Call Transcript</label>
              <textarea className="input" rows={8} value={transcript} onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste the call transcript here..." />
            </div>
          )}

          {activeTab === 'score' && (
            <p className="text-sm text-gray-500">Select a lead above and click Run to get an AI-generated score based on their profile and activity.</p>
          )}

          <button onClick={handleRun} disabled={isLoading} className="btn-primary w-full justify-center">
            {isLoading ? 'Processing...' : 'Run AI'}
          </button>
        </div>

        {/* Output Panel */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Output</h3>
          {result ? (
            <div className="relative">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {result}
              </pre>
              <button
                onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied!'); }}
                className="absolute top-2 right-2 btn-secondary text-xs py-1 px-2"
              >
                Copy
              </button>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Output will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
