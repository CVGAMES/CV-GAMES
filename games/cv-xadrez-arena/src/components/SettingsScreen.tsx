import { ArrowLeft, Crosshair, Eye, Monitor, Sliders, Volume2, VolumeX } from 'lucide-react';
import type { GameSettings, GraphicsQuality } from '../game/settings';
import { CvBrandMark } from './CvBrandMark';

export type { GameSettings, GraphicsQuality };

interface SettingsScreenProps {
  settings: GameSettings;
  onUpdateSettings: (next: GameSettings) => void;
  onBack: () => void;
  backLabel?: string;
}

const SENSITIVITY_PRESETS = [
  { label: 'Baixa', value: 0.65 },
  { label: 'Padrão', value: 1.0 },
  { label: 'Alta', value: 1.45 },
] as const;

const QUALITY_OPTIONS: Array<{ value: GraphicsQuality; label: string; hint: string }> = [
  { value: 'low', label: 'Baixa', hint: 'Máximo desempenho' },
  { value: 'medium', label: 'Média', hint: 'Equilibrada' },
  { value: 'high', label: 'Alta', hint: 'Sombras e nitidez' },
];

export function SettingsScreen({
  settings,
  onUpdateSettings,
  onBack,
  backLabel = 'Voltar',
}: SettingsScreenProps) {
  return (
    <div
      data-testid="settings-screen"
      className="fixed inset-0 z-30 overflow-y-auto bg-[rgba(6,11,24,0.88)] text-[#f1f5f9] px-4 py-4 sm:px-8 sm:py-6 flex flex-col items-center"
    >
      <div className="w-full max-w-2xl my-auto cv-animate-in">
        <div className="flex items-center justify-between gap-4 mb-4">
          <CvBrandMark compact />
          <button
            type="button"
            data-testid="settings-back-btn"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0e1529] hover:bg-[#16213e] border border-[#1e2d4d] text-xs sm:text-sm font-medium text-[#cbd5e1] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </button>
        </div>

        <div className="bg-[#0e1529] border border-[#06b6d4]/25 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22d3ee]">
              CV XADREZ ARENA 3D
            </div>
            <h1 className="font-display text-3xl font-bold text-white mt-1">
              Configurações
            </h1>
            <p className="text-sm text-[#94a3b8] mt-1">
              Suas preferências ficam salvas automaticamente neste navegador.
            </p>
          </div>

          {/* Áudio: Geral + Efeitos Sonoros */}
          <div className="bg-[#121a33] border border-[#1e2d4d] rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0a1022] border border-white/10 flex items-center justify-center text-[#22d3ee]">
                  {settings.muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Áudio do Jogo</div>
                  <div className="text-xs text-[#94a3b8]">
                    Controle geral e efeitos sonoros da arena.
                  </div>
                </div>
              </div>
              <button
                type="button"
                data-testid="settings-mute-toggle"
                aria-pressed={!settings.muted}
                onClick={() => onUpdateSettings({ ...settings, muted: !settings.muted })}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  settings.muted
                    ? 'bg-[#1e293b] text-[#94a3b8] border border-white/10'
                    : 'bg-[#06b6d4] text-[#060b18]'
                }`}
              >
                {settings.muted ? 'Silenciado' : 'Ativado'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-white/5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#cbd5e1] font-medium">Volume geral</span>
                  <span className="font-mono-tabular font-bold text-[#22d3ee]">
                    {Math.round(settings.masterVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  data-testid="settings-master-volume"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.masterVolume}
                  aria-label="Volume geral"
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      masterVolume: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#06b6d4] cursor-pointer h-2 rounded-lg bg-[#1e293b]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#cbd5e1] font-medium">Volume dos efeitos sonoros</span>
                  <span className="font-mono-tabular font-bold text-[#22d3ee]">
                    {Math.round(settings.sfxVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  data-testid="settings-sfx-volume"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.sfxVolume}
                  aria-label="Volume dos efeitos sonoros"
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      sfxVolume: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#06b6d4] cursor-pointer h-2 rounded-lg bg-[#1e293b]"
                />
              </div>
            </div>
          </div>

          {/* Sensibilidade da Câmera e Mouse Lock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#121a33] border border-[#1e2d4d] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0a1022] border border-white/10 flex items-center justify-center text-[#a78bfa]">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Sensibilidade da Câmera</div>
                    <div className="text-[11px] text-[#94a3b8]">Velocidade base na arena 3D</div>
                  </div>
                </div>
                <span className="font-mono-tabular text-xs font-bold text-[#22d3ee]">
                  {settings.cameraSensitivity.toFixed(2)}x
                </span>
              </div>

              <input
                type="range"
                data-testid="settings-camera-sensitivity"
                min={0.5}
                max={1.8}
                step={0.05}
                value={settings.cameraSensitivity}
                aria-label="Sensibilidade da câmera"
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    cameraSensitivity: Number(e.target.value),
                  })
                }
                className="w-full accent-[#06b6d4] cursor-pointer h-2 rounded-lg bg-[#1e293b]"
              />

              <div className="grid grid-cols-3 gap-1.5">
                {SENSITIVITY_PRESETS.map((preset) => {
                  const active = Math.abs(settings.cameraSensitivity - preset.value) < 0.08;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        onUpdateSettings({ ...settings, cameraSensitivity: preset.value })
                      }
                      className={`py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#2563eb]/25 border-[#22d3ee] text-white'
                          : 'bg-[#0a1022] border-white/10 text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#121a33] border border-[#1e2d4d] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0a1022] border border-white/10 flex items-center justify-center text-[#22d3ee]">
                    <Crosshair className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Sensibilidade do Mouse Lock</div>
                    <div className="text-[11px] text-[#94a3b8]">Ajuste fino com mira travada [CTRL]</div>
                  </div>
                </div>
                <span className="font-mono-tabular text-xs font-bold text-[#22d3ee]">
                  {settings.mouseLockSensitivity.toFixed(2)}x
                </span>
              </div>

              <input
                type="range"
                data-testid="settings-mouselock-sensitivity"
                min={0.5}
                max={1.8}
                step={0.05}
                value={settings.mouseLockSensitivity}
                aria-label="Sensibilidade do Mouse Lock"
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    mouseLockSensitivity: Number(e.target.value),
                  })
                }
                className="w-full accent-[#06b6d4] cursor-pointer h-2 rounded-lg bg-[#1e293b]"
              />

              <div className="grid grid-cols-3 gap-1.5">
                {SENSITIVITY_PRESETS.map((preset) => {
                  const active = Math.abs(settings.mouseLockSensitivity - preset.value) < 0.08;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        onUpdateSettings({ ...settings, mouseLockSensitivity: preset.value })
                      }
                      className={`py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#2563eb]/25 border-[#22d3ee] text-white'
                          : 'bg-[#0a1022] border-white/10 text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Qualidade gráfica */}
          <div className="bg-[#121a33] border border-[#1e2d4d] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0a1022] border border-white/10 flex items-center justify-center text-[#38bdf8]">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Qualidade Gráfica</div>
                <div className="text-xs text-[#94a3b8]">
                  Ajusta resolução de renderização e sombras em tempo real na arena 3D.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {QUALITY_OPTIONS.map((opt) => {
                const active = settings.graphicsQuality === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    data-testid={`settings-quality-${opt.value}`}
                    aria-pressed={active}
                    onClick={() =>
                      onUpdateSettings({ ...settings, graphicsQuality: opt.value })
                    }
                    className={`px-3 py-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#2563eb]/25 border-[#22d3ee] text-white'
                        : 'bg-[#0a1022] border-white/10 text-[#cbd5e1] hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className="text-[11px] text-[#94a3b8] mt-0.5">{opt.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Barra de controles */}
          <div className="bg-[#121a33] border border-[#1e2d4d] rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0a1022] border border-white/10 flex items-center justify-center text-[#38bdf8]">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Guia de Controles na Tela</div>
                <div className="text-xs text-[#94a3b8]">
                  Exibe a barra inferior de atalhos durante a partida (tecla H).
                </div>
              </div>
            </div>
            <button
              type="button"
              data-testid="settings-controls-toggle"
              aria-pressed={settings.showControlsBar}
              onClick={() =>
                onUpdateSettings({ ...settings, showControlsBar: !settings.showControlsBar })
              }
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                settings.showControlsBar
                  ? 'bg-[#06b6d4] text-[#060b18]'
                  : 'bg-[#1e293b] text-[#94a3b8] border border-white/10'
              }`}
            >
              {settings.showControlsBar ? 'Visível' : 'Oculto'}
            </button>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#2563eb] hover:from-[#22d3ee] hover:to-[#3b82f6] text-white font-semibold text-sm transition-all cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
