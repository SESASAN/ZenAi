import "@/App.css"
import { AppRouter } from "@/routes/AppRouter"
import { ErrorBoundary } from "@/components/ErrorBoundary"

function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  )
}

export default App
