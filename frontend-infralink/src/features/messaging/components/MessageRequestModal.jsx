import { useState } from 'react';
import { X, Send, Briefcase, MapPin, DollarSign } from 'lucide-react';

export default function MessageRequestModal({ recipient, onSend, onClose, isLoading }) {
    const [text, setText] = useState('');
    const [projectName, setProjectName] = useState('');
    const [budget, setBudget] = useState('');
    const [location, setLocation] = useState('');
    const [workIntent, setWorkIntent] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend({
            recipientId: recipient._id,
            text: text.trim(),
            projectContext: { name: projectName, budget, location },
            workIntent,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Send Message Request</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                            to <span className="font-semibold text-gray-700">{recipient?.name}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/80 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Work Intent */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Intent</label>
                        <div className="flex gap-2 mt-1.5">
                            {[
                                { value: 'hire_now', label: 'Hire Now', icon: Briefcase, color: 'orange' },
                                { value: 'request_quote', label: 'Request Quote', icon: DollarSign, color: 'green' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setWorkIntent(workIntent === opt.value ? null : opt.value)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                                        workIntent === opt.value
                                            ? opt.color === 'orange'
                                                ? 'bg-orange-50 border-orange-300 text-orange-700'
                                                : 'bg-green-50 border-green-300 text-green-700'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    <opt.icon className="w-4 h-4" />
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Project Context */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Project Details <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-400 transition-all">
                            <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Project name"
                                className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-400 transition-all">
                                <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
                                <input
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    placeholder="Budget"
                                    className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none"
                                />
                            </div>
                            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-400 transition-all">
                                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                                <input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Location"
                                    className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Message <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Introduce yourself and explain your requirement..."
                            rows={4}
                            className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 resize-none transition-all"
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!text.trim() || isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    >
                        <Send className="w-4 h-4" />
                        {isLoading ? 'Sending...' : 'Send Request'}
                    </button>
                </form>
            </div>
        </div>
    );
}
