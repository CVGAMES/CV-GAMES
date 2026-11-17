import { ArrowLeft, Crown, Footprints, Hand, Swords } from 'lucide-react';
import { CvBrandMark } from './CvBrandMark';

interface HowToPlayScreenProps {
  onBack: () => void;
}

const SECTIONS = [
  {
    title: 'MOVIMENTAÇÃO',
    accent: '#22d3ee',
    Icon: Footprints,
    items: [
      { key: 'WASD', desc: 'Movimenta o personagem pela arena ou arrasta o oponente quando agarrado.' },
      { key: 'SHIFT', desc: 'Corre para alcançar peças distantes ou escapar de investidas.' },
      { key: 'ESPAÇO', desc: 'Salta por cima de peças; pressione repetidamente para escapar de um agarrão.' },
      { key: 'MOUSE / CTRL', desc: 'Controla a câmera livremente; CTRL trava ou destrava a mira.' },
    ],
  },
  {
    title: 'INTERAÇÃO',
    accent: '#38bdf8',
    Icon: Hand,
    items: [
      { key: 'SEGURAR BOTÃO ESQ / DIR', desc: 'Aproxime-se da sua peça e segure para agarrar e carregar.' },
      { key: 'DUAS MÃOS JUNTAS', desc: 'Carregando com as duas mãos, você aguenta até 2 socos sem soltar.' },
      { key: 'SOLTAR NA CASA', desc: 'Posicione a peça sobre a casa de destino e solte o botão para confirmar o lance.' },
    ],
  },
  {
    title: 'COMBATE E AGARRÃO',
    accent: '#a78bfa',
    Icon: Swords,
    items: [
      { key: 'CLIQUE ESQ / DIR', desc: 'Dispara soco com a mão esquerda ou direita (empurrão físico e desequilíbrio).' },
      { key: 'BOTÃO ESQ + DIR', desc: 'Segure os dois botões juntos perto do oponente para agarrar e arrastar com WASD.' },
      { key: '6 CARGAS DE COMBATE', desc: 'Até 6 ações por ciclo (1 soco = 1 carga, 1 agarrão válido = 1 carga); após zerar, recarga de 10s.' },
    ],
  },
  {
    title: 'XADREZ',
    accent: '#34d399',
    Icon: Crown,
    items: [
      { key: 'COR ALEATÓRIA', desc: 'No início de cada partida, você recebe Brancas ou Pretas aleatoriamente.' },
      { key: 'REGRAS OFICIAIS', desc: 'Roque, en passant, promoção de peão, xeque, xeque-mate e empate completos.' },
      { key: 'HISTÓRICO [TAB]', desc: 'Pressione TAB durante a partida para abrir ou fechar o histórico completo de lances.' },
      { key: 'SEGURANÇA DE LANCE', desc: 'Casas ilegais devolvem a peça automaticamente à origem sem perder a vez.' },
    ],
  },
] as const;

export function HowToPlayScreen({ onBack }: HowToPlayScreenProps) {
  return (
    <div
      data-testid="howto-screen"
      className="fixed inset-0 z-20 overflow-y-auto bg-[rgba(6,11,24,0.88)] text-[#f1f5f9] px-5 py-5 sm:px-8 sm:py-8 flex flex-col items-center"
    >
      <div className="w-full max-w-4xl my-auto cv-animate-in">
        <div className="flex items-center justify-between gap-4 mb-6">
          <CvBrandMark compact />
          <button
            type="button"
            data-testid="howto-back-btn"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0e1529] hover:bg-[#16213e] border border-[#1e2d4d] text-xs sm:text-sm font-medium text-[#cbd5e1] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        </div>

        <div className="bg-[#0e1529] border border-[#06b6d4]/25 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#22d3ee]">
              CV XADREZ ARENA 3D
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">
              Como Jogar
            </h1>
            <p className="text-sm text-[#94a3b8] mt-1">
              Combine estratégia de xadrez clássico com movimentação física e combate na arena 3D.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SECTIONS.map(({ title, accent, Icon, items }) => (
              <section
                key={title}
                className="bg-[#121a33] border border-[#1e2d4d] rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0a1022] border border-white/10"
                    style={{ color: accent }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2
                    className="font-display text-sm font-bold uppercase tracking-[0.14em]"
                    style={{ color: accent }}
                  >
                    {title}
                  </h2>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm">
                  {items.map((item) => (
                    <li key={item.key} className="leading-relaxed text-[#cbd5e1]">
                      <span className="font-mono-tabular font-semibold text-white mr-1.5">
                        {item.key}:
                      </span>
                      <span>{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#2563eb] hover:from-[#22d3ee] hover:to-[#3b82f6] text-white font-semibold text-sm transition-all cursor-pointer"
            >
              Entendi, voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
