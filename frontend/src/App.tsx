import { useEffect, useState } from 'react'
import './App.css'
import {
  type CustomerProfile,
  type ModelInfo,
  type PredictionResult,
  defaultProfile,
  getModelInfo,
  predictCustomer,
} from './api'

function App() {
  const [profile, setProfile] = useState<CustomerProfile>(defaultProfile)
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getModelInfo()
      .then(setModelInfo)
      .catch(() => setError('Unable to load model metadata from the backend.'))
  }, [])

  const updateField = <K extends keyof CustomerProfile>(field: K, value: CustomerProfile[K]) => {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await predictCustomer(profile)
      setResult(response)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const chanceText = result ? `${(result.churn_probability * 100).toFixed(1)}%` : '—'
  const riskTone = result?.risk_level ?? 'Low'

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Customer retention analytics</p>
          <h1>Customer Churn Intelligence</h1>
        </div>
        <div className="status-pill">{modelInfo ? 'Model online' : 'Loading model...'}</div>
      </header>

      <section className="metrics-grid">
        <MetricCard label="Model type" value={modelInfo?.model_type ?? '—'} accent="indigo" />
        <MetricCard label="Threshold" value={modelInfo ? `${modelInfo.threshold}` : '—'} accent="teal" />
        <MetricCard label="Features" value={modelInfo ? `${modelInfo.feature_count}` : '—'} accent="amber" />
        <MetricCard label="Status" value={modelInfo?.dataset_available ? 'Dataset ready' : 'Model-only'} accent="rose" />
      </section>

      <main className="content-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Predict churn</p>
              <h2>Customer profile</h2>
            </div>
            <button type="button" className="secondary-btn" onClick={() => setProfile(defaultProfile)}>
              Reset
            </button>
          </div>

          <div className="field-grid">
            <label>
              <span>Gender</span>
              <select value={profile.gender} onChange={(event) => updateField('gender', event.target.value as CustomerProfile['gender'])}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>

            <label>
              <span>Tenure (months)</span>
              <input type="number" min={0} max={72} value={profile.tenure} onChange={(event) => updateField('tenure', Number(event.target.value))} />
            </label>

            <label>
              <span>Monthly charges</span>
              <input type="number" min={0} step="0.01" value={profile.monthly_charges} onChange={(event) => updateField('monthly_charges', Number(event.target.value))} />
            </label>

            <label>
              <span>Internet service</span>
              <select value={profile.internet_service} onChange={(event) => updateField('internet_service', event.target.value as CustomerProfile['internet_service'])}>
                <option value="DSL">DSL</option>
                <option value="Fiber optic">Fiber optic</option>
                <option value="No">No</option>
              </select>
            </label>

            <label>
              <span>Contract</span>
              <select value={profile.contract} onChange={(event) => updateField('contract', event.target.value as CustomerProfile['contract'])}>
                <option value="Month-to-month">Month-to-month</option>
                <option value="One year">One year</option>
                <option value="Two year">Two year</option>
              </select>
            </label>

            <label>
              <span>Payment method</span>
              <select value={profile.payment_method} onChange={(event) => updateField('payment_method', event.target.value as CustomerProfile['payment_method'])}>
                <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                <option value="Credit card (automatic)">Credit card (automatic)</option>
                <option value="Electronic check">Electronic check</option>
                <option value="Mailed check">Mailed check</option>
              </select>
            </label>

            <label className="checkbox-row">
              <input type="checkbox" checked={profile.senior_citizen} onChange={(event) => updateField('senior_citizen', event.target.checked)} />
              <span>Senior citizen</span>
            </label>

            <label className="checkbox-row">
              <input type="checkbox" checked={profile.partner} onChange={(event) => updateField('partner', event.target.checked)} />
              <span>Partner</span>
            </label>

            <label className="checkbox-row">
              <input type="checkbox" checked={profile.dependents} onChange={(event) => updateField('dependents', event.target.checked)} />
              <span>Dependents</span>
            </label>

            <label className="checkbox-row">
              <input type="checkbox" checked={profile.paperless_billing} onChange={(event) => updateField('paperless_billing', event.target.checked)} />
              <span>Paperless billing</span>
            </label>

            <label className="checkbox-row">
              <input type="checkbox" checked={profile.phone_service} onChange={(event) => updateField('phone_service', event.target.checked)} />
              <span>Phone service</span>
            </label>

            <label>
              <span>Multiple lines</span>
              <select value={profile.multiple_lines} onChange={(event) => updateField('multiple_lines', event.target.value as CustomerProfile['multiple_lines'])}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No phone service">No phone service</option>
              </select>
            </label>

            <label>
              <span>Online security</span>
              <select value={profile.online_security} onChange={(event) => updateField('online_security', event.target.value as CustomerProfile['online_security'])}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </label>

            <label>
              <span>Online backup</span>
              <select value={profile.online_backup} onChange={(event) => updateField('online_backup', event.target.value as CustomerProfile['online_backup'])}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </label>

            <label>
              <span>Device protection</span>
              <select value={profile.device_protection} onChange={(event) => updateField('device_protection', event.target.value as CustomerProfile['device_protection'])}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </label>

            <label>
              <span>Tech support</span>
              <select value={profile.tech_support} onChange={(event) => updateField('tech_support', event.target.value as CustomerProfile['tech_support'])}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </label>

            <label>
              <span>Streaming TV</span>
              <select value={profile.streaming_tv} onChange={(event) => updateField('streaming_tv', event.target.value as CustomerProfile['streaming_tv'])}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </label>

            <label>
              <span>Streaming movies</span>
              <select value={profile.streaming_movies} onChange={(event) => updateField('streaming_movies', event.target.value as CustomerProfile['streaming_movies'])}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="No internet service">No internet service</option>
              </select>
            </label>
          </div>

          {error ? <p className="error-banner">{error}</p> : null}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Scoring profile...' : 'Predict churn risk'}
          </button>
        </form>

        <aside className="panel summary-panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Model output</p>
              <h2>Prediction summary</h2>
            </div>
          </div>

          <div className={`result-badge ${riskTone.toLowerCase()}`}>
            {result ? result.prediction : 'Awaiting score'}
          </div>

          <div className="score-box">
            <span>Risk probability</span>
            <strong>{chanceText}</strong>
          </div>

          <div className="risk-rules">
            <div>
              <span>Risk level</span>
              <strong>{result?.risk_level ?? 'Low'}</strong>
            </div>
            <div>
              <span>Threshold</span>
              <strong>{modelInfo?.threshold ?? 0.4}</strong>
            </div>
            <div>
              <span>Scoring mode</span>
              <strong>Artifact-based</strong>
            </div>
          </div>

          <div className="insight-card">
            <h3>Interpretation</h3>
            <p>
              {result
                ? `This profile is classified as ${result.prediction.toLowerCase()} churn risk with a ${result.churn_probability.toFixed(4)} probability.`
                : 'Submit a customer record to see a churn risk classification built from the saved model artifacts.'}
            </p>
          </div>
        </aside>
      </main>
    </div>
  )
}

type MetricCardProps = {
  label: string
  value: string
  accent: 'indigo' | 'teal' | 'amber' | 'rose'
}

function MetricCard({ label, value, accent }: MetricCardProps) {
  return (
    <div className={`metric-card ${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default App
