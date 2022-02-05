import { FunctionalComponent as FC } from 'preact';
import { useEffect, useState } from 'preact/hooks';
const TOP_SCENE = 'TOP',
  QUIZ_SCENE = 'QUIZ',
  INPUT_ANSWER_SCENE = 'INPUT ANSWER',
  CORRECT_SCENE = 'CORRECT',
  WRONG_SCENE = 'WRONG',
  SCORE_SCENE = 'SCORE';

type Scene =
  | typeof TOP_SCENE
  | typeof QUIZ_SCENE
  | typeof INPUT_ANSWER_SCENE
  | typeof CORRECT_SCENE
  | typeof WRONG_SCENE
  | typeof SCORE_SCENE;
const shuffle = <T,>(arr: readonly T[]): T[] => {
  const res = arr.concat();
  for (let i = res.length - 1; i > 0; i = 0 | (i - 1)) {
    const j = 0 | (Math.random() * (i + 1));
    const swap = res[i];
    res[i] = res[j];
    res[j] = swap;
  }
  return res;
};
const hiragana: readonly string[] = [
  ...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん',
];
const TopScene: FC<{ startQuiz: () => void }> = ({ startQuiz }) => {
  return (
    <div>
      <h1>超拡大ひらがなクイズ</h1>
      <p>
        ひらがな1文字が超拡大されて表示されます(濁点、半濁点、拗音はなし)。徐々にズームアウトするので、わかったら「回答する」ボタンを押してください。回答するを押すとひらがなの表示が消えます。
      </p>
      <button onClick={startQuiz}>start</button>
    </div>
  );
};
const QuizScene: FC<{ quiz: string; answerQuiz: () => void }> = ({
  quiz,
  answerQuiz,
}) => {
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    setInitialized(true);
  }, []);
  const windowSize = 300;
  return (
    <div>
      <div
        style={{
          width: windowSize,
          height: windowSize,
          border: '1px solid #000',
          overflow: 'hidden',
          fontSize: initialized ? 18 : 10000,
          transition: 'font-size 15s ease-out',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {quiz}
      </div>

      <button onClick={answerQuiz}>回答する</button>
    </div>
  );
};
const InputScene: FC<{ checkResult: (answer: string) => void }> = ({
  checkResult,
}) => {
  const [value, setValue] = useState('');
  return (
    <div>
      <input
        value={value}
        onChange={({ target }) => setValue((target as HTMLInputElement).value)}
      />
      <button onClick={() => checkResult(value)}>回答する</button>
    </div>
  );
};
const CorrectScene: FC<{ onOkClick: () => void }> = ({ onOkClick }) => {
  return (
    <div>
      正解!<button onClick={onOkClick}>次へ</button>
    </div>
  );
};
const WrongScene: FC<{ onOkClick: () => void }> = ({ onOkClick }) => {
  return (
    <div>
      不正解…<button onClick={onOkClick}>トップに戻る</button>
    </div>
  );
};
const useQuizSet = () => {
  const [quizSet, setQuizSet] = useState<[string]>(['']);
  const initQuiz = () => {
    const [a] = shuffle(hiragana);
    setQuizSet([a]);
    setQuizIndex(0);
  };
  const [quizIndex, setQuizIndex] = useState(0);
  const currentQuiz = quizSet[quizIndex];
  const nextQuiz = () => {
    setQuizIndex((n) => n + 1);
  };
  return {
    initQuiz,
    nextQuiz,
    currentQuiz,
    quizSet,
    isLastQuiz: quizIndex === quizSet.length - 1,
  };
};
export const App = () => {
  const [scene, setScene] = useState<Scene>(TOP_SCENE);

  const { initQuiz, nextQuiz, currentQuiz, quizSet, isLastQuiz } = useQuizSet();
  const [startAt, setStartAt] = useState(0);
  const gotoNext = () => {
    setStartAt(Date.now());
    setScene(QUIZ_SCENE);
  };
  const [score, setScore] = useState<number[]>([]);

  return scene === TOP_SCENE ? (
    <TopScene
      startQuiz={() => {
        initQuiz();
        setScore([]);
        gotoNext();
      }}
    />
  ) : scene === QUIZ_SCENE ? (
    <QuizScene
      quiz={currentQuiz}
      answerQuiz={() => {
        setScore((score) => [...score, Date.now() - startAt]);
        setScene(INPUT_ANSWER_SCENE);
      }}
    />
  ) : scene === INPUT_ANSWER_SCENE ? (
    <InputScene
      checkResult={(answer) => {
        if (answer === currentQuiz) setScene(CORRECT_SCENE);
        else setScene(WRONG_SCENE);
      }}
    />
  ) : scene === CORRECT_SCENE ? (
    <CorrectScene
      onOkClick={() => {
        if (isLastQuiz) {
          setScene(SCORE_SCENE);
          return;
        }
        nextQuiz();
        gotoNext();
      }}
    />
  ) : scene === WRONG_SCENE ? (
    <WrongScene
      onOkClick={() => {
        setScene(TOP_SCENE);
      }}
    />
  ) : scene === SCORE_SCENE ? (
    <div>
      スコア
      <ul>
        {score.map((time, index) => (
          <li key={index}>
            {quizSet[index]}: {Math.trunc(time) / 1e3}秒
          </li>
        ))}
      </ul>
      <button onClick={() => setScene(TOP_SCENE)}>トップに戻る</button>
    </div>
  ) : null;
};
