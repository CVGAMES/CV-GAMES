import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { canAccessArenaProfile } from './privateAccess';

const root = document.getElementById('root');
if (!root) throw new Error('Não foi encontrado o ponto de entrada do CV XADREZ ARENA 3D.');

let profile: string | null = null;
try {
  profile = window.localStorage.getItem('cv-games-profile');
} catch {
  // Sem acesso ao armazenamento local, o jogo permanece restrito.
}

if (!canAccessArenaProfile(profile)) {
  document.body.dataset.state = 'locked';
  const homeUrl = new URL('../../../index.html', window.location.href).href;
  const profileUrl = new URL('../../../perfil.html', window.location.href).href;
  root.innerHTML = `
    <main style="box-sizing:border-box;min-height:100%;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at top,#14213d,#060b18 65%);color:#e2e8f0;font:16px system-ui,sans-serif;text-align:center">
      <section style="max-width:520px;padding:32px;border:1px solid #164e63;border-radius:24px;background:#0a1022;box-shadow:0 24px 80px #0008">
        <div style="font-size:34px;margin-bottom:12px" aria-hidden="true">♞</div>
        <p style="margin:0 0 8px;color:#67e8f9;font-size:12px;font-weight:800;letter-spacing:.18em">ACESSO DE TESTE RESTRITO</p>
        <h1 style="margin:0;color:#fff;font-size:clamp(24px,5vw,38px)">CV XADREZ ARENA 3D</h1>
        <p style="margin:16px 0 24px;color:#cbd5e1;line-height:1.6">Este jogo está disponível apenas para os perfis locais <strong>educvv dev</strong>, <strong>educvv dev1</strong> e <strong>lista</strong>.</p>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px">
          <a href="${profileUrl}" target="_top" style="padding:12px 18px;border-radius:12px;background:#0891b2;color:#fff;font-weight:700;text-decoration:none">Abrir meu perfil</a>
          <a href="${homeUrl}" target="_top" style="padding:12px 18px;border:1px solid #334155;border-radius:12px;color:#e2e8f0;text-decoration:none">Voltar ao CV GAMES</a>
        </div>
      </section>
    </main>`;
  document.getElementById('startup-loader')?.remove();
} else {
  createRoot(root).render(<App />);
}
