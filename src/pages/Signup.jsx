import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/authStore'
import useLanguageStore from '../store/languageStore'
import { getSignupToken, clearSignupToken } from '../lib/signupToken'
import { signup } from '../lib/authApi'
import {
  USER_STATUS_VALUES,
  VISA_TYPE_VALUES,
  HOUSING_TYPE_VALUES,
  PART_TIME_STATUS_VALUES,
  TOPIK_LEVEL_VALUES,
  LANGUAGE_VALUES,
  NATIONALITY_VALUES,
  translateOptions,
} from '../constants/userEnums'
import { inputClass, FieldWrapper, SelectField, PillGroup, useBooleanOptions } from '../components/FormFields'

const INITIAL_FORM = {
  name: '',
  nationality: '',
  birthYear: '',
  userStatus: '',
  language: '',
  schoolName: '',
  entryDate: '',
  visaType: '',
  hasAlienRegistration: null,
  stayExpirationDate: '',
  housingType: '',
  isParentSupported: null,
  partTimeStatus: '',
  currentTopikLevel: '',
  targetTopikLevel: '',
}

const TOTAL_STEPS = 3

const STEP_META = [
  { icon: '🙂', key: 'basic' },
  { icon: '✈️', key: 'visa' },
  { icon: '🏠', key: 'life' },
]

// 회원가입 화면 — 디자인의 3단계 UI 스타일은 유지하되, 필드 구성은 백엔드 확정 스펙(고재민 공유, 2026-08-13) 기준.
// docs/backend-signup-fieldset-diff.md 에서 요청했던 간소화 방향은 백엔드가 채택하지 않음 — 원래 14개 필드 + language 신규 필수.
function Signup() {
  const { t } = useTranslation()
  const booleanOptions = useBooleanOptions()
  const navigate = useNavigate()
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  const preferredLanguage = useLanguageStore((state) => state.preferredLanguage)
  const [signupToken, setSignupTokenState] = useState(null)
  const [step, setStep] = useState(1)
  // LanguageSelect 화면에서 미리 골라둔 언어가 있으면 기본값으로 채워줌 (수정은 계속 가능).
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM, language: preferredLanguage ?? '' }))
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    const token = getSignupToken()
    console.log('[Signup] sessionStorage에서 signupToken 조회', token)
    if (!token) {
      console.warn('[Signup] signupToken이 없음 → /login으로 이동')
      navigate('/login', { replace: true })
      return
    }
    setSignupTokenState(token)
  }, [navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const goToPreviousStep = () => {
    if (step === 1) {
      navigate(-1)
      return
    }
    setStep((prev) => prev - 1)
  }

  const submitSignup = async () => {
    if (!signupToken) return

    const payload = {
      ...form,
      birthYear: Number(form.birthYear),
    }

    console.log('[Signup] 제출 payload', payload)
    setSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await signup(signupToken, payload)
      console.log('[Signup] 회원가입 성공', response.data)
      const { accessToken } = response.data.data
      setAccessToken(accessToken)
      clearSignupToken()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('[Signup] 회원가입 실패', error)
      setErrorMessage(t('signup.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (step < TOTAL_STEPS) {
      console.log(`[Signup] ${step} → ${step + 1}단계 이동`)
      setStep((prev) => prev + 1)
      return
    }
    submitSignup()
  }

  const meta = STEP_META[step - 1]
  const stepText = t(`signup.steps.${meta.key}`, { returnObjects: true })

  return (
    <div className="min-h-screen bg-background-50 px-6 py-6">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={goToPreviousStep} className="text-xl text-foreground-700">
          ‹
        </button>
        <div className="flex flex-1 gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <span
              key={index}
              className={`h-1.5 flex-1 rounded-full ${index < step ? 'bg-primary-500' : 'bg-background-200'}`}
            />
          ))}
        </div>
        <span className="text-sm text-foreground-500">
          {step} / {TOTAL_STEPS}
        </span>
      </div>

      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-2xl">
          {meta.icon}
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground-950">{stepText.title}</h1>
          <p className="text-sm text-foreground-500">{stepText.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 1 && (
          <>
            <FieldWrapper label={t('profileFields.name')}>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </FieldWrapper>
            <SelectField
              label={t('profileFields.nationality')}
              name="nationality"
              value={form.nationality}
              onChange={handleChange}
              options={translateOptions(t, 'nationality', NATIONALITY_VALUES)}
            />
            <FieldWrapper label={t('profileFields.birthYear')}>
              <input
                id="birthYear"
                name="birthYear"
                type="number"
                value={form.birthYear}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </FieldWrapper>
            <SelectField
              label={t('profileFields.userStatus')}
              name="userStatus"
              value={form.userStatus}
              onChange={handleChange}
              options={translateOptions(t, 'userStatus', USER_STATUS_VALUES)}
            />
            <SelectField
              label={t('profileFields.language')}
              name="language"
              value={form.language}
              onChange={handleChange}
              options={translateOptions(t, 'language', LANGUAGE_VALUES)}
            />
          </>
        )}

        {step === 2 && (
          <>
            <FieldWrapper label={t('profileFields.schoolName')}>
              <input
                id="schoolName"
                name="schoolName"
                type="text"
                value={form.schoolName}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </FieldWrapper>
            <FieldWrapper label={t('profileFields.entryDate')}>
              <input
                id="entryDate"
                name="entryDate"
                type="date"
                value={form.entryDate}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </FieldWrapper>
            <SelectField
              label={t('profileFields.visaType')}
              name="visaType"
              value={form.visaType}
              onChange={handleChange}
              options={translateOptions(t, 'visaType', VISA_TYPE_VALUES)}
            />
            <PillGroup
              label={t('profileFields.hasAlienRegistration')}
              value={form.hasAlienRegistration}
              onChange={(value) => setField('hasAlienRegistration', value)}
              options={booleanOptions}
            />
            <FieldWrapper label={t('profileFields.stayExpirationDate')}>
              <input
                id="stayExpirationDate"
                name="stayExpirationDate"
                type="date"
                value={form.stayExpirationDate}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </FieldWrapper>
          </>
        )}

        {step === 3 && (
          <>
            <SelectField
              label={t('profileFields.housingType')}
              name="housingType"
              value={form.housingType}
              onChange={handleChange}
              options={translateOptions(t, 'housingType', HOUSING_TYPE_VALUES)}
            />
            <PillGroup
              label={t('profileFields.isParentSupported')}
              value={form.isParentSupported}
              onChange={(value) => setField('isParentSupported', value)}
              options={booleanOptions}
            />
            <PillGroup
              label={t('profileFields.partTimeStatus')}
              value={form.partTimeStatus}
              onChange={(value) => setField('partTimeStatus', value)}
              options={translateOptions(t, 'partTimeStatus', PART_TIME_STATUS_VALUES)}
              columns={3}
            />
            <SelectField
              label={t('profileFields.currentTopikLevel')}
              name="currentTopikLevel"
              value={form.currentTopikLevel}
              onChange={handleChange}
              options={translateOptions(t, 'topikLevel', TOPIK_LEVEL_VALUES)}
            />
            <SelectField
              label={t('profileFields.targetTopikLevel')}
              name="targetTopikLevel"
              value={form.targetTopikLevel}
              onChange={handleChange}
              options={translateOptions(t, 'topikLevel', TOPIK_LEVEL_VALUES)}
            />
          </>
        )}

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

        <div className="flex gap-3 pt-2">
          {step > 1 && (
            <button
              type="button"
              onClick={goToPreviousStep}
              className="rounded-xl border border-background-300 px-6 py-3 text-sm font-semibold text-foreground-700"
            >
              {t('signup.back')}
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {step < TOTAL_STEPS ? t('signup.next') : submitting ? t('signup.submitting') : t('signup.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Signup