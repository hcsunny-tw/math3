import React, { useState, useEffect } from 'react';
import { Clock, Key, CheckCircle, XCircle, AlertCircle, Trophy, RefreshCw, ChevronRight, Heart } from 'lucide-react';

const GAME_DATA = [
  {
    level: 1,
    title: "關卡一：森林遺蹟的古老密碼門",
    story: "探險隊來到神秘森林，眼前出現一座巨大的石門，門上閃爍著古老的數字文字……",
    icon: "🌲🚪",
    questions: [
      {
        id: 1,
        q: "密碼鎖上寫著：「請寫出『七千零五十』的阿拉伯數字密碼。」",
        a: "7050",
        hint: "再檢查看看，「百位」沒有數字要補 0 喔！"
      },
      {
        id: 2,
        q: "門上的第二道鎖需要知道：10 個 1000 合起來是多少？",
        a: "10000",
        hint: "想一想，10 個一千是「一萬」喔！寫成數字有幾個 0 呢？"
      }
    ]
  },
  {
    level: 2,
    title: "關卡二：魔法金幣換算所",
    story: "通過石門後，遇到了一隻小精靈，他需要你幫忙清點金幣袋才肯拿給你鑰匙！",
    icon: "🧚‍♂️💰",
    questions: [
      {
        id: 3,
        q: "袋子裡有 6 個千、14 個百和 5 個一，請問總共有多少枚金幣？",
        a: "7405",
        hint: "注意！14 個百是 1400 喔！要記得進位到千位。"
      },
      {
        id: 4,
        q: "寶箱號碼是 8092，這個數是由 8 個千、幾個十和 2 個一合成的？（請填數字）",
        a: "9",
        hint: "看清楚「十位」上的數字是多少喔！"
      },
      {
        id: 5,
        q: "小精靈有 3000 枚銀幣，可以換成幾個「百枚銀幣袋」？",
        a: "30",
        hint: "想想看，幾個 100 會是 3000 呢？"
      }
    ]
  },
  {
    level: 3,
    title: "關卡三：國王的大亂鬥與幸運抽獎",
    story: "來到數字王國的廣場，國王正在舉辦幸運大抽獎與數字卡牌比試！",
    icon: "👑⚔️",
    questions: [
      {
        id: 6,
        q: "國王給了你四張卡片：5、0、9、3。請組成一個『最大的四位數』。",
        a: "9530",
        hint: "要組成最大的數，數字要從大到小排列喔！"
      },
      {
        id: 7,
        q: "同上一題的卡片 5、0、9、3，請組成一個『最小的四位數』。（注意：千位不能是 0）",
        a: "3059",
        hint: "最小的數要把小的數字放前面，但最高位（千位）不能是 0 喔！"
      },
      {
        id: 8,
        q: "四位騎士的戰鬥力：A是4809，B是4901，C是4890，D是4099。請問最高戰鬥力是多少？",
        a: "4901",
        hint: "先比較千位（都是 4），再比較百位，誰的百位最大呢？"
      },
      {
        id: 9,
        q: "特獎「末四碼」是 5280。五位民眾號碼為：15280、5280、25820、85280、5208。總共幾人中獎？",
        a: "3",
        hint: "檢查看看哪些號碼「最後四個數字」完全跟 5280 一模一樣？"
      }
    ]
  },
  {
    level: 4,
    title: "關卡四：迷宮數線路",
    story: "通往寶藏庫的地上畫著一條神秘數線，只有踩在正確的數字格上才不會掉入陷阱！",
    icon: "🗺️👣",
    questions: [
      {
        id: 10,
        q: "數線上記錄著：[ 4600 ] ➔ [ 4700 ] ➔ [  ?  ] ➔ [ 4900 ]。請問 [ ? ] 的數字是多少？",
        a: "4800",
        hint: "觀察一下，向右每走一格是增加 100 喔！"
      },
      {
        id: 11,
        q: "數線上記錄著：[ 2100 ] ➔ [ 2150 ] ➔ [ 2200 ] ➔ [  A  ] ➔ [ 2300 ]。請問字母 A 代表多少？",
        a: "2250",
        hint: "向右每走一格是增加 50，2200 再加 50 是多少呢？"
      }
    ]
  },
  {
    level: 5,
    title: "關卡五：終極寶藏箱",
    story: "你終於來到了寶藏箱前！這是最後一道防護密碼！",
    icon: "💎📦",
    questions: [
      {
        id: 12,
        q: "密碼提示：一個四位數。比6000大，比7000小。百位是3，十位是8，個位比十位小2。密碼是？",
        a: "6386",
        hint: "一步步推算：千位是6、百位是3、十位是8，個位是 8-2 喔！"
      }
    ]
  }
];

export default function MathEscapeRoom() {
  const [gameState, setGameState] = useState('start'); // start, playing, success, timeout, gameover
  const [activeGameData, setActiveGameData] = useState(GAME_DATA);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [errorHint, setErrorHint] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [lives, setLives] = useState(3);
  const [wrongHistory, setWrongHistory] = useState([]);

  // Total questions count for progress bar
  const totalQuestions = activeGameData.reduce((acc, level) => acc + level.questions.length, 0);
  
  const currentGlobalQuestionIdx = activeGameData.slice(0, currentLevelIdx).reduce((acc, level) => acc + level.questions.length, 0) + currentQuestionIdx + 1;
  const progressPercent = (currentGlobalQuestionIdx / totalQuestions) * 100;

  const currentLevel = activeGameData[currentLevelIdx];
  const currentQuestion = currentLevel?.questions[currentQuestionIdx];

  useEffect(() => {
    // Injecting the Bopomofo font
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://cdn.jsdelivr.net/gh/max32002/iansui@master/webfont/iansui.css');
      body { font-family: 'Iansui', sans-serif; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); }
  }, []);

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('timeout');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (inputValue.trim() === currentQuestion.a) {
      // Correct Answer!
      setErrorHint('');
      setInputValue('');
      
      // Move to next question or level
      if (currentQuestionIdx + 1 < currentLevel.questions.length) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
      } else {
        if (currentLevelIdx + 1 < activeGameData.length) {
          setCurrentLevelIdx(currentLevelIdx + 1);
          setCurrentQuestionIdx(0);
        } else {
          setGameState('success');
        }
      }
    } else {
      // Wrong Answer
      const newLives = lives - 1;
      setLives(newLives);
      setErrorHint(`解碼失敗，再試一次！${currentQuestion.hint}`);
      
      // 記錄錯題，避免重複記錄同一題
      setWrongHistory(prev => {
        if (!prev.find(item => item.id === currentQuestion.id)) {
          return [...prev, {
            id: currentQuestion.id,
            title: currentLevel.title,
            q: currentQuestion.q,
            a: currentQuestion.a,
            hint: currentQuestion.hint
          }];
        }
        return prev;
      });

      if (newLives <= 0) {
        setGameState('gameover');
      }
    }
  };

  const startGame = () => {
    // 打亂每個關卡內的題目順序，防止學生互抄
    const randomizedData = GAME_DATA.map(level => ({
      ...level,
      questions: [...level.questions].sort(() => Math.random() - 0.5)
    }));
    
    setActiveGameData(randomizedData);
    setGameState('playing');
    setCurrentLevelIdx(0);
    setCurrentQuestionIdx(0);
    setTimeLeft(15 * 60);
    setLives(3);
    setWrongHistory([]);
    setInputValue('');
    setErrorHint('');
  };

  if (gameState === 'start') {
    return (
      <div className="h-screen w-screen bg-gradient-to-b from-blue-300 to-green-200 flex items-center justify-center p-4 font-[Iansui] overflow-hidden">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full text-center border-4 border-yellow-400 my-auto">
          <div className="text-5xl mb-2">🏰</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3 leading-tight">數字王國的神秘寶藏<br/><span className="text-xl sm:text-2xl text-blue-600">10000以內的數</span></h1>
          <div className="bg-yellow-50 rounded-xl p-4 sm:p-5 mb-6 border border-yellow-200 text-left">
            <h2 className="text-lg font-bold mb-2 flex items-center"><AlertCircle className="mr-2 text-yellow-600 w-5 h-5"/> 遊戲規則：</h2>
            <ul className="list-disc list-inside space-y-1.5 text-gray-700 text-base sm:text-lg">
              <li>這是一個限時 **15分鐘** 的闖關遊戲。</li>
              <li>你總共有 **3顆愛心（生命值）**，答錯會扣一顆！</li>
              <li>總共有 5 個關卡，包含密碼門、換算所和迷宮。</li>
              <li>準備好你的紙和筆，計算出正確答案。</li>
              <li>過關才能開啟真正的寶藏！</li>
            </ul>
          </div>
          <button 
            onClick={startGame}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl sm:text-2xl py-3.5 px-6 rounded-full shadow-[0_5px_0_#c05600] active:shadow-none active:translate-y-[5px] transition-all"
          >
            開始闖關！
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'success' || gameState === 'timeout' || gameState === 'gameover') {
    const isSuccess = gameState === 'success';
    let statusIcon = '👑';
    let statusTitle = '恭喜通關！找到寶藏了！';
    let statusMessage = `你花了 ${formatTime(15 * 60 - timeLeft)} 就成功解開所有謎題！太厲害了！請截圖拿給老師看喔！`;
    
    if (gameState === 'timeout') {
      statusIcon = '⏰';
      statusTitle = '啊！時間到了！';
      statusMessage = '不要灰心，多練習幾次，你一定可以通關的！';
    } else if (gameState === 'gameover') {
      statusIcon = '💔';
      statusTitle = '哎呀！能量耗盡了！';
      statusMessage = '沒關係，看看下方的錯題檢討，重新挑戰一次吧！';
    }

    return (
      <div className={`h-screen w-screen overflow-y-auto flex flex-col items-center justify-start p-4 py-6 font-[Iansui] ${isSuccess ? 'bg-gradient-to-b from-yellow-200 to-yellow-500' : 'bg-gradient-to-b from-gray-700 to-gray-900'}`}>
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-xl w-full text-center border-4 border-white mb-6 shrink-0">
          <div className="text-6xl mb-3">{statusIcon}</div>
          <h1 className={`text-3xl font-bold mb-2 ${isSuccess ? 'text-orange-600' : 'text-gray-800'}`}>
            {statusTitle}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {statusMessage}
          </p>
          <button 
            onClick={startGame}
            className="flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg py-3 px-6 rounded-full shadow-[0_5px_0_#1e3a8a] active:shadow-none active:translate-y-[5px] transition-all"
          >
            <RefreshCw className="mr-2 w-5 h-5" /> {isSuccess ? '再玩一次' : '重新挑戰'}
          </button>
        </div>

        {/* 錯題檢討區 */}
        {wrongHistory.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-xl w-full border-4 border-red-100 shrink-0 mb-6">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center justify-center">
              <AlertCircle className="mr-2 w-6 h-6" /> 老師的秘密筆記：錯題檢討區
            </h2>
            <div className="space-y-3 text-left">
              {wrongHistory.map((item, index) => (
                <div key={index} className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <div className="text-xs text-red-500 font-bold mb-1">{item.title}</div>
                  <div className="text-base text-gray-800 font-bold mb-2">{item.q}</div>
                  <div className="text-green-700 font-bold bg-green-100 px-3 py-1 rounded-lg inline-block text-sm mb-1">
                    ✅ 正確解答：{item.a}
                  </div>
                  <div className="text-gray-600 text-xs flex items-start mt-1">
                    💡 <span className="ml-1">{item.hint}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col font-[Iansui] overflow-hidden">
      {/* Top Navigation & Timer */}
      <div className="bg-white shadow-sm px-4 py-2.5 shrink-0 border-b border-slate-200">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-1.5 text-base font-bold text-indigo-600">
            <Trophy className="w-5 h-5" />
            <span>進度：{currentGlobalQuestionIdx} / {totalQuestions}</span>
          </div>
          
          {/* 生命值 (愛心) 顯示 */}
          <div className="flex items-center space-x-1 text-red-500">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} fill={i < lives ? "currentColor" : "none"} className="w-5 h-5 sm:w-6 sm:h-6" />
            ))}
          </div>

          <div className={`flex items-center space-x-1.5 text-xl font-bold px-3 py-1 rounded-full ${timeLeft < 180 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-700'}`}>
            <Clock className="w-5 h-5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Main Container - Full viewport height constraint */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 overflow-hidden">
        <div className="max-w-2xl w-full h-full max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-xl border border-indigo-100 overflow-hidden">
          
          {/* Story Header */}
          <div className="bg-indigo-600 text-white px-5 py-3.5 shadow-md relative shrink-0">
            <div className="absolute top-[-10px] right-[-10px] text-6xl opacity-15">{currentLevel.icon}</div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center relative z-10">
              <span className="text-2xl mr-2">{currentLevel.icon}</span>
              {currentLevel.title}
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base relative z-10 mt-1 leading-snug">
              {currentLevel.story}
            </p>
          </div>

          {/* Question Area */}
          <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl my-auto">
              <p className="text-lg sm:text-xl text-gray-800 font-bold leading-relaxed">
                {currentQuestion.q}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-2">
              <div>
                <label className="block text-gray-600 font-bold mb-1.5 text-sm sm:text-base flex items-center">
                  <Key className="w-4 h-4 mr-1.5 text-indigo-500" /> 請輸入你的答案（數字）：
                </label>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className={`w-full text-2xl sm:text-3xl p-2.5 sm:p-3 border-3 sm:border-4 rounded-xl text-center focus:outline-none focus:ring-4 transition-all h-12 sm:h-14 ${errorHint ? 'border-red-400 focus:ring-red-200 bg-red-50' : 'border-indigo-200 focus:border-indigo-500 focus:ring-indigo-100'}`}
                  placeholder="輸入數字..."
                  autoFocus
                />
              </div>

              {/* Error Hint Box */}
              {errorHint && (
                <div className="bg-red-100 text-red-700 p-2.5 rounded-lg flex items-start text-xs sm:text-sm font-bold animate-bounce">
                  <XCircle className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
                  <span>{errorHint}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold text-lg sm:text-xl py-3 rounded-xl shadow-[0_4px_0_#166534] active:shadow-none active:translate-y-[4px] transition-all"
              >
                送出答案 <ChevronRight className="w-6 h-6 ml-1" />
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
