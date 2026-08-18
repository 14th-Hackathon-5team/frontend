import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AREA_MULTIPLIER,
  HEALTH_INSURANCE,
  HOUSING_FIELDS,
  INCOME_FIELDS,
  MEAL_COST,
  MINIMUM_WAGE,
  ONE_TIME_MONTHS,
  PART_TIME_FIELDS,
  PART_TIME_LIMIT_HOURS,
  TELECOM_COST,
  TRANSPORT_COST,
  UTILITY_KEYS,
  VISA_FEE_YEARLY,
  WEEKS_PER_MONTH,
} from '../constants/livingCosts'

const STEP_META = [
  { key: 'area', icon: '📍', type: 'choice', columns: 3, options: ['seoul', 'metro', 'region'] },
  { key: 'housing', icon: '🏠', type: 'choice', columns: 2, options: ['oneroom', 'dorm', 'goshiwon', 'hasuk'] },
  { key: 'housingCost', icon: '🧾', type: 'fields' },
  { key: 'meal', icon: '🍚', type: 'choice', columns: 2, options: ['cafeteria', 'cook', 'mixed', 'eatout'] },
  { key: 'transport', icon: '🚇', type: 'choice', columns: 3, options: ['walk', 'kpass', 'card'] },
  { key: 'telecom', icon: '📱', type: 'choice', columns: 3, options: ['mvno', 'major', 'prepaid'] },
  { key: 'visa', icon: '🛂', type: 'choice', columns: 2, options: ['first', 'next'] },
  { key: 'partTime', icon: '💼', type: 'fields' },
  { key: 'income', icon: '💰', type: 'fields' },
]

const round = (value) => Math.round(value / 10) * 10

// 지역 계수를 반영한 주거 입력값 기본치
const fieldDefault = (field, area) =>
  field.flat ? field.default : round(field.default * (AREA_MULTIPLIER[area] ?? 1))

const toNumber = (raw) => {
  const digits = String(raw ?? '').replace(/[^0-9]/g, '')
  return digits === '' ? null : Number(digits)
}

// 선택값 + 입력값으로 월 생활비를 계산한다.
function calculate(answers, costs) {
  const area = answers.area
  const multiplier = AREA_MULTIPLIER[area] ?? 1
  const fields = HOUSING_FIELDS[answers.housing] ?? []

  let housing = 0
  let utilities = 0
  let oneTime = 0
  let deposit = 0

  fields.forEach((field) => {
    const value = toNumber(costs[field.key]) ?? fieldDefault(field, area)
    if (field.refundable) {
      deposit += value
      return
    }
    if (field.group === 'oneTime') {
      oneTime += value / ONE_TIME_MONTHS
      return
    }
    if (UTILITY_KEYS.includes(field.key)) utilities += value
    else housing += value
  })

  // 아직 고르지 않은 항목은 0으로 두고, 선택한 항목만 합산한다.
  const meals = (MEAL_COST[answers.meal] ?? 0) * multiplier
  const transport = TRANSPORT_COST[answers.transport] ?? 0
  const telecom = TELECOM_COST[answers.telecom] ?? 0
  const visa = (VISA_FEE_YEARLY[answers.visa] ?? 0) / 12

  const breakdown = [
    { key: 'housing', amount: round(housing) },
    { key: 'utilities', amount: round(utilities) },
    { key: 'oneTime', amount: round(oneTime) },
    { key: 'meals', amount: round(meals) },
    { key: 'transport', amount: round(transport) },
    { key: 'telecom', amount: round(telecom) },
    { key: 'insurance', amount: HEALTH_INSURANCE },
    { key: 'visa', amount: round(visa) },
  ].filter((row) => row.amount > 0)

  const total = breakdown.reduce((sum, row) => sum + row.amount, 0)

  const weeklyHours = toNumber(costs.weeklyHours) ?? 0
  const hourlyWage = toNumber(costs.hourlyWage) ?? MINIMUM_WAGE
  const partTime = round(weeklyHours * hourlyWage * WEEKS_PER_MONTH)
  const incomeBreakdown = [
    { key: 'partTime', amount: partTime },
    ...INCOME_FIELDS.map((field) => ({ key: field.key, amount: toNumber(costs[field.key]) ?? field.default })),
  ].filter((row) => row.amount > 0)
  const income = incomeBreakdown.reduce((sum, row) => sum + row.amount, 0)

  return { breakdown, total, incomeBreakdown, income, estimate: total - income, deposit }
}

// 생활비 시뮬레이터 — 최종 디자인(tqwhyl.readdy.co/simulation) 반영.
function Simulation() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState({})
  const [costs, setCosts] = useState({})
  const totalSteps = STEP_META.length + 1

  const formatMoney = (value) => {
    const number = Math.round(value).toLocaleString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')
    const unit = t('simulation.unit')
    return i18n.language === 'ko' ? `${number}${unit}` : `${number} ${unit}`
  }

  const result = useMemo(() => calculate(answers, costs), [answers, costs])

  const steps = STEP_META.map((meta) => ({
    ...meta,
    ...t(`simulation.steps.${meta.key}`, { returnObjects: true }),
    options: meta.options,
  }))

  const handleReset = () => {
    setStep(1)
    setAnswers({})
    setCosts({})
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

  const handleCostChange = (key, value) => {
    setCosts((prev) => ({ ...prev, [key]: value.replace(/[^0-9]/g, '') }))
  }

  const handleConfirm = () => {
    setStep((prev) => prev + 1)
  }

  const isResultStep = step > steps.length
  const isSurplus = result.estimate < 0
  const currentStep = isResultStep ? null : steps[step - 1]
  const STEP_FIELDS = { income: INCOME_FIELDS, partTime: PART_TIME_FIELDS }
  const stepFields = STEP_FIELDS[currentStep?.key] ?? HOUSING_FIELDS[answers.housing] ?? []
  const monthlyFields = stepFields.filter((field) => field.group === 'monthly')
  const oneTimeFields = stepFields.filter((field) => field.group === 'oneTime')
  const monthlyGroupLabel =
    currentStep?.key === 'housingCost' ? t('simulation.monthlyGroup') : t('simulation.incomeGroup')
  const overWorkLimit = (toNumber(costs.weeklyHours) ?? 0) > PART_TIME_LIMIT_HOURS
  // 선택형 단계는 항목을 골라야 '확인 후 다음'이 열린다. 모르겠으면 건너뛰기로 넘어갈 수 있다.
  const canConfirm = currentStep?.type !== 'choice' || Boolean(answers[currentStep.key])

  const renderFieldGroup = (label, fields) => {
    if (fields.length === 0) return null
    return (
      <div className="mb-3">
        <p className="mb-2 text-xs font-semibold text-foreground-600">{label}</p>
        <div className="space-y-2">
          {fields.map((field) => (
            <label key={field.key} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm text-foreground-800">{currentStep.fields[field.key]}</span>
              <span className="flex flex-1 items-center gap-2 rounded-xl border-2 border-background-200 bg-background-50 px-3 py-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={costs[field.key] ?? ''}
                  onChange={(event) => handleCostChange(field.key, event.target.value)}
                  placeholder={fieldDefault(field, answers.area).toLocaleString('ko-KR')}
                  className="w-full bg-transparent text-right text-sm text-foreground-900 outline-none"
                />
                <span className="text-xs text-foreground-500">
                  {field.unit === 'hour' ? t('simulation.hourUnit') : t('simulation.unit')}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={goBack} className="flex h-11 w-11 items-center justify-center text-xl text-foreground-700">
          ‹
        </button>
        <div className="text-center">
          <p className="text-base font-bold text-foreground-950">{t('simulation.title')}</p>
          <p className="text-xs text-foreground-500">
            {isResultStep ? t('simulation.resultSubtitle') : t('simulation.subtitle')}
          </p>
        </div>
        <button type="button" onClick={handleReset} className="text-sm font-semibold text-primary-600">
          {t('simulation.reset')}
        </button>
      </div>

      <div className="mb-1 flex items-center justify-between text-xs text-foreground-500">
        <span>
          {Math.min(step, totalSteps)} / {totalSteps}
        </span>
        <span>{t('simulation.estimatedMonthly', { amount: formatMoney(Math.abs(result.estimate)) })}</span>
      </div>
      <div className="mb-4 h-1.5 w-full rounded-full bg-background-200">
        <div
          className="h-1.5 rounded-full bg-primary-500"
          style={{ width: `${(Math.min(step, totalSteps) / totalSteps) * 100}%` }}
        />
      </div>

      {!isResultStep && currentStep && (
        <>
          <div className="glass-surface rounded-2xl p-5">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-2xl text-white">
              {currentStep.icon}
            </div>
            <h2 className="text-lg font-bold text-foreground-950">{currentStep.title}</h2>
            <p className="mt-2 text-sm text-foreground-600">{currentStep.description}</p>
          </div>

          <div className="glass-surface mt-4 rounded-2xl p-4">
            {currentStep.type === 'fields' ? (
              <>
                <p className="mb-1 text-sm font-semibold text-foreground-900">✏️ {t('simulation.inputTitle')}</p>
                <p className="mb-3 text-xs text-foreground-500">{t('simulation.inputHint')}</p>
                {stepFields.length === 0 && (
                  <p className="py-2 text-sm text-foreground-500">{t('simulation.selectHousingFirst')}</p>
                )}
                {renderFieldGroup(monthlyGroupLabel, monthlyFields)}
                {renderFieldGroup(t('simulation.oneTimeGroup'), oneTimeFields)}
                {oneTimeFields.length > 0 && <p className="mt-3 text-xs text-foreground-500">{currentStep.oneTimeNote}</p>}
                {currentStep.note && <p className="mt-3 text-xs text-foreground-500">{currentStep.note}</p>}
                {currentStep.key === 'partTime' && overWorkLimit && (
                  <p className="mt-2 text-xs font-semibold text-red-500">⚠️ {currentStep.limitWarning}</p>
                )}
              </>
            ) : (
              <>
                <p className="mb-1 text-sm font-semibold text-foreground-900">😊 {t('simulation.adjustTitle')}</p>
                <p className="mb-3 text-xs text-foreground-500">{t('simulation.adjustHint', { title: currentStep.title })}</p>
                <div className={`grid gap-2 ${currentStep.columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {currentStep.options.map((option) => {
                    const selected = answers[currentStep.key] === option
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelect(currentStep.key, option)}
                        className={`rounded-xl py-3 text-sm font-medium ${
                          selected ? 'bg-primary-500 text-white' : 'border-2 border-background-200 bg-background-50 text-foreground-800'
                        }`}
                      >
                        {t(`simulation.steps.${currentStep.key}.options.${option}`)}
                      </button>
                    )
                  })}
                </div>
                {currentStep.note && <p className="mt-3 text-xs text-foreground-500">{currentStep.note}</p>}
                {currentStep.key === 'transport' && answers.transport === 'kpass' && (
                  <p className="mt-3 rounded-xl bg-accent-100 p-3 text-xs text-foreground-700">
                    💡 {currentStep.kpassPromo}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="flex-1 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-background-300 disabled:text-foreground-400"
            >
              {t('simulation.confirm')}
            </button>
            <button type="button" onClick={handleConfirm} className="rounded-xl border border-background-300 px-6 py-3 text-sm font-semibold text-foreground-600">
              {t('simulation.skip')}
            </button>
          </div>
        </>
      )}

      {isResultStep && (
        <div className="rounded-2xl bg-accent-100 p-5">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-2xl text-white">
            📊
          </div>
          <h2 className="text-lg font-bold text-foreground-950">
            {t(isSurplus ? 'simulation.surplusTitle' : 'simulation.resultTitle')}
          </h2>
          <p className="mt-1 text-sm text-foreground-700">{t('simulation.resultDescription')}</p>

          <div className="mt-4 rounded-xl bg-white p-4 text-center">
            <p className="text-xs text-foreground-500">
              {t(isSurplus ? 'simulation.surplusLabel' : 'simulation.resultLabel')}
            </p>
            <p className="text-3xl font-extrabold text-primary-600">{formatMoney(Math.abs(result.estimate))}</p>
            <p className="text-xs text-foreground-500">{t('simulation.perMonth')}</p>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            {result.breakdown.map((row) => (
              <div key={row.key} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground-700">
                  <span className="h-2 w-2 rounded-full bg-primary-500" />
                  {t(`simulation.breakdown.${row.key}`)}
                </span>
                <span className="font-semibold text-foreground-900">{formatMoney(row.amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-background-200 pt-2">
              <span className="text-foreground-700">{t('simulation.totalExpenses')}</span>
              <span className="font-semibold text-foreground-900">{formatMoney(result.total)}</span>
            </div>
            {result.incomeBreakdown.map((row) => (
              <div key={row.key} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-primary-600">
                  <span className="h-2 w-2 rounded-full bg-primary-400" />
                  {t(`simulation.breakdown.${row.key}`)}
                </span>
                <span className="font-semibold text-primary-600">+{formatMoney(row.amount)}</span>
              </div>
            ))}
            {result.income > 0 && (
              <div className="flex items-center justify-between border-t border-background-200 pt-2">
                <span className="text-primary-600">↓ {t('simulation.totalIncome')}</span>
                <span className="font-semibold text-primary-600">-{formatMoney(result.income)}</span>
              </div>
            )}
          </div>

          {result.deposit > 0 && (
            <p className="mt-4 text-xs text-foreground-500">{t('simulation.depositNote', { amount: formatMoney(result.deposit) })}</p>
          )}
          <p className="mt-2 text-xs text-foreground-500">🧴 {t('simulation.suppliesNote')}</p>
          <p className="mt-2 text-xs text-foreground-500">{t('simulation.disclaimer')}</p>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white"
          >
            {t('simulation.backToHome')}
          </button>
        </div>
      )}
    </div>
  )
}

export default Simulation
