import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const endpoint = String(input)

      if (endpoint.includes('/model-info')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            model_type: 'LogisticRegression',
            feature_count: 22,
            threshold: 0.4,
            supports_probability: true,
            scaler_applied: true,
            risk_thresholds: { Low: 0.0, Medium: 0.4, High: 0.7 },
            dataset_available: false,
          }),
        } as unknown as Response)
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({
          prediction: 'No',
          churn_probability: 0.12,
          risk_level: 'Low',
          threshold_used: 0.4,
          model_type: 'LogisticRegression',
        }),
      } as unknown as Response)
    }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

test('renders the dashboard and model metadata', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByText(/Customer Churn Intelligence/i)).toBeInTheDocument()
  })

  expect(screen.getByText(/Model type/i)).toBeInTheDocument()
  expect(screen.getAllByText(/LogisticRegression/i).length).toBeGreaterThan(0)
})
