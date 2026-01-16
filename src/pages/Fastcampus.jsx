import { useEffect, useRef, useState } from 'react';
import { Brain, Sparkles, ChevronDown, Bot, User } from 'lucide-react';

// --- 유틸리티 및 상수 ---
const COLOR_BG = '#0b0c15';
const COLOR_ME = '#3b82f6';
const COLOR_GOAL = '#ef4444';
const COLOR_PATH = '#eab308';
const COLOR_GAP = '#64748b';

const lerp = (start, end, factor) => start + (end - start) * factor;

export default function Fastcampus() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [activeScene, setActiveScene] = useState(0);
  const [isGsapLoaded, setIsGsapLoaded] = useState(false);

  // --- GSAP 동적 로드 ---
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js")
    ]).then(() => {
      if (window.gsap && window.ScrollTrigger) {
        window.gsap.registerPlugin(window.ScrollTrigger);
        setIsGsapLoaded(true);
      }
    }).catch(err => console.error("Failed to load GSAP:", err));
  }, []);

  // --- 데이터 모델 정의 ---
  const nodesRef = useRef([
    { id: 'me', label: 'Me', type: 'core', x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, size: 30, color: COLOR_ME, alpha: 1 },
    { id: 'js', label: 'JavaScript', type: 'skill', x: 0.4, y: 0.4, targetX: 0.35, targetY: 0.45, size: 15, color: COLOR_ME, alpha: 1 },
    { id: 'react', label: 'React', type: 'skill', x: 0.6, y: 0.4, targetX: 0.65, targetY: 0.4, size: 15, color: COLOR_ME, alpha: 1 },
    { id: 'python', label: 'Python', type: 'skill', x: 0.5, y: 0.6, targetX: 0.45, targetY: 0.65, size: 15, color: COLOR_ME, alpha: 1 },
    { id: 'goal', label: 'Prompt Eng.', type: 'goal', x: 0.5, y: -0.5, targetX: 0.8, targetY: 0.2, size: 40, color: COLOR_GOAL, alpha: 0 },
    { id: 'step1', label: 'LLM Theory', type: 'step', x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.35, size: 12, color: COLOR_PATH, alpha: 0 },
    { id: 'step2', label: 'LangChain', type: 'step', x: 0.5, y: 0.5, targetX: 0.6, targetY: 0.25, size: 12, color: COLOR_PATH, alpha: 0 },
    { id: 'step3', label: 'RAG Pipeline', type: 'step', x: 0.5, y: 0.5, targetX: 0.7, targetY: 0.3, size: 12, color: COLOR_PATH, alpha: 0 },
  ]);

  const linksRef = useRef([
    { source: 'me', target: 'js', style: 'solid', color: COLOR_ME, alpha: 0.6 },
    { source: 'me', target: 'react', style: 'solid', color: COLOR_ME, alpha: 0.6 },
    { source: 'me', target: 'python', style: 'solid', color: COLOR_ME, alpha: 0.6 },
    { source: 'python', target: 'step1', style: 'dashed', color: COLOR_GAP, alpha: 0, width: 1 },
    { source: 'step1', target: 'step2', style: 'dashed', color: COLOR_GAP, alpha: 0, width: 1 },
    { source: 'step2', target: 'step3', style: 'dashed', color: COLOR_GAP, alpha: 0, width: 1 },
    { source: 'step3', target: 'goal', style: 'dashed', color: COLOR_GAP, alpha: 0, width: 1 },
    { source: 'me', target: 'goal', style: 'analysis', color: COLOR_GAP, alpha: 0, width: 0.5 },
  ]);

  const animState = useRef({
    progress: 0,
    time: 0,
    dashOffset: 0,
    sceneIndex: 0,
  });

  // --- Canvas 애니메이션 루프 ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.fillStyle = COLOR_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const t = animState.current.time;
      const p = animState.current.progress;

      animState.current.time += 0.01;
      animState.current.dashOffset -= 0.5;

      nodesRef.current.forEach(node => {
        const floatY = Math.sin(t + node.id.length) * 5;
        const floatX = Math.cos(t * 0.5 + node.id.length) * 3;

        let targetX = node.targetX * width;
        let targetY = node.targetY * height;
        let targetAlpha = node.alpha;

        if (node.type === 'goal') {
          targetAlpha = p > 0.15 ? Math.min((p - 0.15) * 5, 1) : 0;
        }

        if (node.id === 'me') {
          if (p > 0.2) targetX = 0.2 * width;
        }

        if (node.type === 'step') {
          targetAlpha = p > 0.75 ? Math.min((p - 0.75) * 8, 1) : 0;
          if (p < 0.75) {
            targetX = width * 0.2;
            targetY = height * 0.5;
          }
        }

        node.currentX = lerp(node.currentX || targetX, targetX, 0.05) + floatX;
        node.currentY = lerp(node.currentY || targetY, targetY, 0.05) + floatY;
        node.currentAlpha = lerp(node.currentAlpha || targetAlpha, targetAlpha, 0.1);

        if (node.currentAlpha > 0.01) {
          ctx.beginPath();
          ctx.arc(node.currentX, node.currentY, node.size, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.globalAlpha = node.currentAlpha;
          ctx.shadowBlur = 15;
          ctx.shadowColor = node.color;
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${node.type === 'core' || node.type === 'goal' ? '14px' : '12px'} Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.label, node.currentX, node.currentY + node.size + 15);
          ctx.globalAlpha = 1;
        }
      });

      linksRef.current.forEach(link => {
        const sourceNode = nodesRef.current.find(n => n.id === link.source);
        const targetNode = nodesRef.current.find(n => n.id === link.target);

        if (sourceNode && targetNode && sourceNode.currentAlpha > 0 && targetNode.currentAlpha > 0) {
          let linkAlpha = link.alpha;
          let linkColor = link.color;
          let linkWidth = link.width || 1;
          let isDashed = false;

          if (link.style === 'analysis') {
            linkAlpha = (p > 0.4 && p < 0.7) ? 0.3 : 0;
            isDashed = true;
          }

          if (link.style === 'dashed') {
            if (p > 0.45) linkAlpha = Math.min((p - 0.45) * 4, 1);

            if (p > 0.8) {
              linkColor = COLOR_PATH;
              isDashed = false;
              linkWidth = 3;
            } else {
              isDashed = true;
            }
          }

          if (linkAlpha > 0.01) {
            ctx.beginPath();
            ctx.moveTo(sourceNode.currentX, sourceNode.currentY);
            ctx.lineTo(targetNode.currentX, targetNode.currentY);

            ctx.strokeStyle = linkColor;
            ctx.lineWidth = linkWidth;
            ctx.globalAlpha = linkAlpha;

            if (isDashed) {
              ctx.setLineDash([5, 5]);
              ctx.lineDashOffset = animState.current.dashOffset;
            } else {
              ctx.setLineDash([]);
            }

            if (p > 0.8 && link.style === 'dashed') {
              ctx.shadowBlur = 10;
              ctx.shadowColor = COLOR_PATH;
            }

            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // --- GSAP ScrollTrigger 설정 ---
  useEffect(() => {
    if (!isGsapLoaded) return;

    const tl = window.gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          animState.current.progress = self.progress;
          const newScene = Math.min(Math.floor(self.progress * 4), 3);
          if (newScene !== animState.current.sceneIndex) {
            animState.current.sceneIndex = newScene;
            setActiveScene(newScene);
          }
        }
      }
    });

    tl.to({}, { duration: 1 });

    return () => {
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach(t => t.kill());
      }
    };
  }, [isGsapLoaded]);

  return (
    <div className="relative bg-black font-sans text-white overflow-x-hidden">
      {/* 1. 배경 Canvas (Fixed) */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
      />

      {/* 2. 스크롤 컨텐츠 (Overlay) */}
      <div ref={containerRef} className="relative z-10 w-full">

        {/* Scene 1: 현재의 나 */}
        <section className="h-screen flex items-center justify-center relative">
          <div className={`transition-all duration-700 transform ${activeScene === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <ChatBubble
              icon={<Bot size={24} className="text-blue-400" />}
              name="AI Coach"
              message="안녕하세요, 김개발님! 현재 보유하신 기술 스택을 시각화했습니다. 탄탄한 기본기를 가지고 계시네요."
            />
            <div className="mt-8 flex justify-center animate-bounce opacity-50">
              <ChevronDown />
            </div>
          </div>
        </section>

        {/* Scene 2: 목표 설정 */}
        <section className="h-screen flex items-center justify-center relative">
          <div className={`flex flex-col gap-4 max-w-lg transition-all duration-700 transform ${activeScene === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <ChatBubble
              icon={<Bot size={24} className="text-blue-400" />}
              name="AI Coach"
              message="다음 단계로 나아가기 위해, 목표로 하시는 직무나 커리어 패스가 있나요?"
            />
            <ChatBubble
              isUser
              icon={<User size={24} className="text-emerald-400" />}
              name="Me"
              message="요즘 뜨고 있는 '프롬프트 엔지니어'나 'LLM 애플리케이션 개발자'가 되고 싶어요!"
            />
          </div>
        </section>

        {/* Scene 3: 갭 분석 */}
        <section className="h-screen flex items-center justify-center relative">
          <div className={`transition-all duration-700 transform ${activeScene === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <ChatBubble
              icon={<Brain size={24} className="text-purple-400 animate-pulse" />}
              name="AI System"
              message="목표와 현재 스킬 사이의 갭을 분석 중입니다..."
            />
            <div className="mt-4 text-center text-xs text-gray-500 font-mono">
              ANALYZING NODES... <br /> CALCULATING PATH WEIGHTS...
            </div>
          </div>
        </section>

        {/* Scene 4: 로드맵 완성 */}
        <section className="h-screen flex items-center justify-center relative">
          <div className={`transition-all duration-700 transform ${activeScene === 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <ChatBubble
              icon={<Sparkles size={24} className="text-yellow-400" />}
              name="AI Coach"
              message="짜잔! 6개월 맞춤 로드맵이 완성되었습니다. Python 심화부터 시작해 LangChain, RAG 파이프라인 구축까지 단계별로 성장해보세요!"
              highlight
            />
            <div className="mt-8 text-center">
              <button className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-full hover:bg-yellow-400 transition-colors shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                로드맵 시작하기
              </button>
            </div>
          </div>
        </section>

        {/* 여백 확보용 */}
        <div className="h-[50vh]"></div>
      </div>

      {/* 하단 고정 UI */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-slate-700 text-slate-400 text-sm flex gap-4">
          <span className={activeScene >= 0 ? "text-blue-400 font-bold" : ""}>Start</span>
          <span>→</span>
          <span className={activeScene >= 1 ? "text-red-400 font-bold" : ""}>Goal</span>
          <span>→</span>
          <span className={activeScene >= 2 ? "text-purple-400 font-bold" : ""}>Analyze</span>
          <span>→</span>
          <span className={activeScene >= 3 ? "text-yellow-400 font-bold" : ""}>Roadmap</span>
        </div>
      </div>
    </div>
  );
}

// --- 서브 컴포넌트: 채팅 UI ---
function ChatBubble({ icon, name, message, isUser = false, highlight = false }) {
  return (
    <div className={`flex gap-3 items-start max-w-md ${isUser ? 'flex-row-reverse text-right' : ''}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-emerald-900/50' : 'bg-slate-800'}`}>
        {icon}
      </div>
      <div className={`p-4 rounded-2xl border backdrop-blur-sm shadow-xl ${
        highlight
          ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
          : isUser
            ? 'bg-emerald-900/30 border-emerald-700/50'
            : 'bg-slate-900/60 border-slate-700'
      }`}>
        <div className={`text-xs font-bold mb-1 ${isUser ? 'text-emerald-400' : 'text-slate-400'}`}>{name}</div>
        <p className="text-slate-200 leading-relaxed text-base">{message}</p>
      </div>
    </div>
  );
}
