import './App.css';
import { useRef } from 'react';
import ScratchImageReveal from './components/ScratchImageReveal/ScratchImageReveal.tsx';
import type { ScratchImageRevealHandle } from './components/ScratchImageReveal/ScratchImageReveal.tsx';

function App() {
  const scratchRef = useRef<ScratchImageRevealHandle | null>(null);

  const resetMask = () => {
    scratchRef.current?.resetMask();
  };

  return (
    <>
      <h1>Vite + React</h1>
      <ScratchImageReveal
        ref={scratchRef}
        maskUrl="https://wp-s.ru/wallpapers/6/3/561029086232966/otdyxayushhij-kotenok-s-ustalym-vzglyadom.jpg"
        imageUrl="https://i.pinimg.com/736x/fe/b1/56/feb1561da87c420edf28bcf7564a1315.jpg"
      />
      <button onClick={resetMask} style={{ marginTop: 20 }}>
        Сбросить маску
      </button>
    </>
  );
}

export default App;
