export type Gender = 'Male' | 'Female'
export type InternetService = 'DSL' | 'Fiber optic' | 'No'
export type ContractType = 'Month-to-month' | 'One year' | 'Two year'
export type PaymentMethod =
  | 'Bank transfer (automatic)'
  | 'Credit card (automatic)'
  | 'Electronic check'
  | 'Mailed check'
export type LineService = 'No' | 'Yes' | 'No phone service'
export type InternetFeature = 'No' | 'Yes' | 'No internet service'

export interface CustomerProfile {
  gender: Gender
  senior_citizen: boolean
  partner: boolean
  dependents: boolean
  tenure: number
  phone_service: boolean
  multiple_lines: LineService
  online_security: InternetFeature
  online_backup: InternetFeature
  device_protection: InternetFeature
  tech_support: InternetFeature
  streaming_tv: InternetFeature
  streaming_movies: InternetFeature
  paperless_billing: boolean
  monthly_charges: number
  internet_service: InternetService
  contract: ContractType
  payment_method: PaymentMethod
}

export interface PredictionResult {
  prediction: 'Yes' | 'No'
  churn_probability: number
  risk_level: 'Low' | 'Medium' | 'High'
  threshold_used: number
  model_type: string
}

export interface ModelInfo {
  model_type: string
  feature_count: number
  threshold: number
  supports_probability: boolean
  scaler_applied: boolean
  risk_thresholds: Record<string, number>
  dataset_available: boolean
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(typeof payload.detail === 'string' ? payload.detail : 'Request failed')
  }

  return (await response.json()) as T
}

export async function getModelInfo(): Promise<ModelInfo> {
  return request<ModelInfo>('/model-info')
}

export async function predictCustomer(profile: CustomerProfile): Promise<PredictionResult> {
  return request<PredictionResult>('/predict', {
    method: 'POST',
    body: JSON.stringify(profile),
  })
}

export async function predictBatch(records: CustomerProfile[]): Promise<{ results: PredictionResult[] }> {
  return request<{ results: PredictionResult[] }>('/predict/batch', {
    method: 'POST',
    body: JSON.stringify({ records }),
  })
}

export const defaultProfile: CustomerProfile = {
  gender: 'Male',
  senior_citizen: false,
  partner: true,
  dependents: false,
  tenure: 24,
  phone_service: true,
  multiple_lines: 'No',
  online_security: 'No',
  online_backup: 'Yes',
  device_protection: 'No',
  tech_support: 'No',
  streaming_tv: 'Yes',
  streaming_movies: 'No',
  paperless_billing: true,
  monthly_charges: 75.5,
  internet_service: 'Fiber optic',
  contract: 'Month-to-month',
  payment_method: 'Electronic check',
}
