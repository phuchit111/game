import React from 'react';
import { useRasterStore } from '../../store/rasterStore';
import { QUESTIONS } from '../../constants/rasterData';
import { Lightbulb } from 'lucide-react';

export const RasterQuiz: React.FC = () => {
  const quizAnswered = useRasterStore((s) => s.quizAnswered);
  const quizSelected = useRasterStore((s) => s.quizSelected);
  const answerQuiz = useRasterStore((s) => s.answerQuiz);

  return (
    <section className="block" id="raster-quiz">
      <div className="eyebrow mono">ทดสอบความเข้าใจ</div>
      <h2 className="display">คำถามท้ายด่าน Raster</h2>
      <p>ตอบถูกข้อละ 4 คะแนน รวมสูงสุด 24 คะแนน</p>

      <div>
        {QUESTIONS.map((item, qIdx) => {
          const isAnswered = quizAnswered[qIdx];
          const selectedOpt = quizSelected[qIdx];

          return (
            <div key={`quiz-${qIdx}`} className="quiz-card">
              <div className="qn mono">
                ข้อ {qIdx + 1} / {QUESTIONS.length}
              </div>
              <div className="qtext" style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
                {item.q}
              </div>

              <div>
                {item.opts.map((opt, optIdx) => {
                  let btnClass = 'qopt';
                  if (isAnswered) {
                    if (optIdx === item.correct) {
                      btnClass += ' correct';
                    } else if (optIdx === selectedOpt) {
                      btnClass += ' wrong';
                    }
                  }

                  return (
                    <button
                      key={`opt-${optIdx}`}
                      className={btnClass}
                      disabled={isAnswered}
                      onClick={() => answerQuiz(qIdx, optIdx)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="qexplain show" style={{ marginTop: 10, fontSize: 13, color: '#94a3b8' }}>
                  <Lightbulb size={14} /> <b>คำอธิบาย:</b> {item.explain}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
