import { X, Sparkles } from 'lucide-react';
import { VISUAL_VOCABULARY_STAMPS } from '../utils/visualVocabulary';

interface VisualVocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertStamp: (icon: string, label: string) => void;
}

export const VisualVocabularyModal: React.FC<VisualVocabularyModalProps> = ({
  isOpen,
  onClose,
  onInsertStamp,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[85vh] my-auto">
        {/* Header */}
        <div className="shrink-0 px-5 sm:px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20 shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-['Outfit']">
                Visual Vocabulary & Stamps
              </h3>
              <p className="text-xs text-stone-500">
                Essential metaphorical symbols from the Napkin Academy visual alphabet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stamps Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {VISUAL_VOCABULARY_STAMPS.map((stamp) => (
            <button
              key={stamp.id}
              onClick={() => {
                onInsertStamp(stamp.id, stamp.name);
                onClose();
              }}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all text-stone-700 hover:text-stone-900 group shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-stone-100 group-hover:bg-amber-100/70 flex items-center justify-center text-stone-700 group-hover:text-amber-700 text-lg transition-colors">
                {stamp.id === 'lightbulb' && '💡'}
                {stamp.id === 'user' && '👤'}
                {stamp.id === 'users' && '👥'}
                {stamp.id === 'smile' && '😊'}
                {stamp.id === 'frown' && '😟'}
                {stamp.id === 'sparkles' && '✨'}
                {stamp.id === 'target' && '🎯'}
                {stamp.id === 'zap' && '⚡'}
                {stamp.id === 'shield' && '🛡️'}
                {stamp.id === 'key' && '🔑'}
                {stamp.id === 'gear' && '⚙️'}
                {stamp.id === 'check' && '✅'}
                {stamp.id === 'alert' && '⚠️'}
                {stamp.id === 'flag' && '🚩'}
                {stamp.id === 'dollar' && '💰'}
                {stamp.id === 'arrow-right' && '➡️'}
                {stamp.id === 'arrow-up-right' && '↗️'}
                {stamp.id === 'repeat' && '🔄'}
                {stamp.id === 'message-circle' && '💬'}
              </div>
              <span className="text-xs font-semibold">{stamp.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
