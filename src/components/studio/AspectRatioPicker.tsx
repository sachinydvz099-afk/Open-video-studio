import React from 'react';
import { AspectRatio } from '../../providers/types';

interface AspectRatioPickerProps {
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
  supportedRatios?: AspectRatio[];
}

export const AspectRatioPicker: React.FC<AspectRatioPickerProps> = ({
  value,
  onChange,
  supportedRatios = ['16:9', '9:16', '1:1', '4:3', '21:9'],
}) => {
  const options: {
    ratio: AspectRatio;
    name: string;
    subtitle: string;
    frameClass: string;
  }[] = [
    {
      ratio: '16:9',
      name: '16:9',
      subtitle: 'Landscape',
      frameClass: 'w-7 h-4',
    },
    {
      ratio: '9:16',
      name: '9:16',
      subtitle: 'Vertical / Reels',
      frameClass: 'w-4 h-7',
    },
    {
      ratio: '1:1',
      name: '1:1',
      subtitle: 'Square',
      frameClass: 'w-5 h-5',
    },
    {
      ratio: '4:3',
      name: '4:3',
      subtitle: 'Classic',
      frameClass: 'w-6 h-4.5',
    },
    {
      ratio: '21:9',
      name: '21:9',
      subtitle: 'Cinema',
      frameClass: 'w-8 h-3.5',
    },
  ];

  const availableOptions = options.filter((o) => supportedRatios.includes(o.ratio));

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
        Aspect Ratio
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {availableOptions.map((opt) => {
          const isSelected = value === opt.ratio;
          return (
            <button
              key={opt.ratio}
              type="button"
              onClick={() => onChange(opt.ratio)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-studio-surface/80 border-studio-border text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <div
                className={`border-2 rounded-sm mb-2 transition-colors ${opt.frameClass} ${
                  isSelected ? 'border-amber-400 bg-amber-400/20' : 'border-slate-500'
                }`}
              />
              <span className="text-xs font-semibold">{opt.name}</span>
              <span className="text-[10px] text-slate-500 mt-0.5 truncate">{opt.subtitle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
