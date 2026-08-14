import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  {
    key: 'housing',
    icon: '🏠',
    title: 'Housing Type',
    description: 'Your monthly housing cost is the biggest factor in your budget. Choose the option closest to your plan.',
    options: ['Dormitory', 'One-room', 'Goshiwon', 'Hasuk'],
    columns: 2,
  },
  {
    key: 'area',
    icon: '📍',
    title: 'Living Area',
    description: 'Costs vary a lot between Seoul and regional cities. Pick where you will live.',
    options: ['Seoul', 'Metro area', 'Regional city'],
    columns: 1,
  },
  {
    key: 'partTime',
    icon: '💼',
    title: 'Part-time Work',
    description: 'D-2 visa holders can work up to 28 hours a week. Enter your expected weekly hours.',
    options: ['0h/week', '10h/week', '28h/week'],
    columns: 3,
    note: 'The 2026 minimum wage is 10,320 KRW per hour.',
  },
  {
    key: 'meal',
    icon: '🍚',
    title: 'Meal Pattern',
    description: 'Food is the second largest expense. How do you plan to eat most days?',
    options: ['School cafeteria', 'Mixed', 'Eat out often', 'Cook at home'],
    columns: 2,
  },
]

// TODO: 실제 비용 산정 로직은 기획/백엔드 확정 후 대체. 지금은 최종 디자인의 예시 결과값을 그대로 사용.
const RESULT_BREAKDOWN = [
  { label: 'Housing', amount: '400K KRW' },
  { label: 'Meals', amount: '500K KRW' },
  { label: 'Transport & comms', amount: '90K KRW' },
]
const RESULT_TOTAL = '990K KRW'
const RESULT_INCOME = '-450K KRW'
const RESULT_ESTIMATE = '540K KRW'

// 생활비 시뮬레이터 — 최종 디자인(tqwhyl.readdy.co/simulation) 반영.
function Simulation() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState({})
  const totalSteps = STEPS.length + 1

  const handleReset = () => {
    setStep(1)
    setAnswers({})
  }

  const goBack = () => {
    if (step === 1) {
      navigate(-1)
      return
    }
    setStep((prev) => prev - 1)
  }

  const handleSelect = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const handleConfirm = () => {
    setStep((prev) => prev + 1)
  }

  const isResultStep = step > STEPS.length
  const currentStep = isResultStep ? null : STEPS[step - 1]

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={goBack} className="text-xl text-foreground-700">
          ‹
        </button>
        <div className="text-center">
          <p className="text-base font-bold text-foreground-950">Budget Simulation</p>
          <p className="text-xs text-foreground-500">
            {isResultStep ? 'Your estimated monthly budget' : 'Adjust each item to estimate your monthly cost'}
          </p>
        </div>
        <button type="button" onClick={handleReset} className="text-sm font-semibold text-primary-600">
          Reset
        </button>
      </div>

      <div className="mb-1 flex items-center justify-between text-xs text-foreground-500">
        <span>
          {Math.min(step, totalSteps)} / {totalSteps}
        </span>
        <span>Est. monthly: {RESULT_ESTIMATE}</span>
      </div>
      <div className="mb-4 h-1.5 w-full rounded-full bg-background-200">
        <div
          className="h-1.5 rounded-full bg-primary-500"
          style={{ width: `${(Math.min(step, totalSteps) / totalSteps) * 100}%` }}
        />
      </div>

      {!isResultStep && currentStep && (
        <>
          <div className="rounded-2xl border border-background-200 bg-white p-5">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-2xl text-white">
              {currentStep.icon}
            </div>
            <h2 className="text-lg font-bold text-foreground-950">{currentStep.title}</h2>
            <p className="mt-2 text-sm text-foreground-600">{currentStep.description}</p>
          </div>

          <div className="mt-4 rounded-2xl border border-background-200 bg-white p-4">
            <p className="mb-1 text-sm font-semibold text-foreground-900">😊 Adjust your choice</p>
            <p className="mb-3 text-xs text-foreground-500">Select the option closest to &quot;{currentStep.title}&quot;</p>
            <div className={`grid gap-2 ${currentStep.columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {currentStep.options.map((option) => {
                const selected = (answers[currentStep.key] ?? currentStep.options[0]) === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(currentStep.key, option)}
                    className={`rounded-xl py-3 text-sm font-medium ${
                      selected ? 'bg-primary-500 text-white' : 'border border-background-200 bg-background-50 text-foreground-800'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            {currentStep.note && <p className="mt-3 text-xs text-foreground-500">{currentStep.note}</p>}
          </div>

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={handleConfirm} className="flex-1 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white">
              Confirm & next
            </button>
            <button type="button" onClick={handleConfirm} className="rounded-xl border border-background-300 px-6 py-3 text-sm font-semibold text-foreground-600">
              Skip
            </button>
          </div>
        </>
      )}

      {isResultStep && (
        <div className="rounded-2xl bg-accent-100 p-5">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-2xl text-white">
            📊
          </div>
          <h2 className="text-lg font-bold text-foreground-950">Your Monthly Budget</h2>
          <p className="mt-1 text-sm text-foreground-700">Here is the estimated cost breakdown based on your selections.</p>

          <div className="mt-4 rounded-xl bg-white p-4 text-center">
            <p className="text-xs text-foreground-500">Estimated monthly budget</p>
            <p className="text-3xl font-extrabold text-primary-600">{RESULT_ESTIMATE}</p>
            <p className="text-xs text-foreground-500">per month</p>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            {RESULT_BREAKDOWN.map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground-700">
                  <span className="h-2 w-2 rounded-full bg-primary-500" />
                  {row.label}
                </span>
                <span className="font-semibold text-foreground-900">{row.amount}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-background-200 pt-2">
              <span className="text-foreground-700">Total expenses</span>
              <span className="font-semibold text-foreground-900">{RESULT_TOTAL}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-primary-600">↓ Part-time income</span>
              <span className="font-semibold text-primary-600">{RESULT_INCOME}</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-foreground-500">* This is an estimate. Actual costs vary by school, district, and lifestyle.</p>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white"
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  )
}

export default Simulation
