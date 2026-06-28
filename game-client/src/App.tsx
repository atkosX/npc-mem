import { useGame } from './state/gameStore'
import { StartPage } from './pages/StartPage'
import { GamePage } from './pages/GamePage'
import { EndingPage } from './pages/EndingPage'

export default function App() {
  const screen = useGame((s) => s.screen)
  if (screen === 'start') return <StartPage />
  if (screen === 'ending') return <EndingPage />
  return <GamePage />
}
