import { CalculatorBuilder } from './components/CalculatorBuilder'
import { DarkModeToggle } from './components/DarkModeToggle'

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <DarkModeToggle />
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8 text-center dark:text-white">
          Calculator Builder
        </h1>
        <CalculatorBuilder />
      </div>
    </div>
  )
}

export default App
