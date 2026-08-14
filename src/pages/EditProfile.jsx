import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyInfo, updateMyInfo } from '../lib/authApi'
import {
  USER_STATUS_OPTIONS,
  VISA_TYPE_OPTIONS,
  HOUSING_TYPE_OPTIONS,
  PART_TIME_STATUS_OPTIONS,
  TOPIK_LEVEL_OPTIONS,
  LANGUAGE_OPTIONS,
} from '../constants/userEnums'
import { inputClass, FieldWrapper, SelectField, PillGroup, BOOLEAN_OPTIONS } from '../components/FormFields'

// id/provider/providerId/email/createdAt/updatedAt은 PATCH /api/users/me로 수정 불가 (docs/backend-notes-2026-08-13.md 3절).
const EDITABLE_FIELDS = [
  'name',
  'nationality',
  'birthYear',
  'userStatus',
  'language',
  'schoolName',
  'entryDate',
  'visaType',
  'hasAlienRegistration',
  'stayExpirationDate',
  'housingType',
  'isParentSupported',
  'partTimeStatus',
  'currentTopikLevel',
  'targetTopikLevel',
]

// 프로필 수정 화면 — Settings에서 진입. Signup.jsx와 동일한 필드셋을 한 화면에서 보여주고 PATCH /api/users/me로 저장.
function EditProfile() {
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    getMyInfo()
      .then((response) => {
        const user = response.data.data
        setForm(Object.fromEntries(EDITABLE_FIELDS.map((field) => [field, user[field] ?? ''])))
      })
      .catch((error) => console.error('[EditProfile] 내 정보 조회 실패', error))
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)
    try {
      await updateMyInfo({ ...form, birthYear: Number(form.birthYear) })
      navigate('/settings', { replace: true })
    } catch (error) {
      console.error('[EditProfile] 프로필 수정 실패', error)
      setErrorMessage('프로필 수정에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!form) {
    return <p className="p-6 text-center text-sm text-foreground-400">Loading...</p>
  }

  return (
    <div className="min-h-screen bg-background-50 px-6 py-6">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-xl text-foreground-700">
          ‹
        </button>
        <h1 className="text-lg font-bold text-foreground-950">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FieldWrapper label="이름">
          <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required className={inputClass} />
        </FieldWrapper>
        <FieldWrapper label="국적">
          <input
            id="nationality"
            name="nationality"
            type="text"
            value={form.nationality}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </FieldWrapper>
        <FieldWrapper label="출생연도">
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
        <SelectField label="현재 신분" name="userStatus" value={form.userStatus} onChange={handleChange} options={USER_STATUS_OPTIONS} />
        <SelectField label="사용 언어" name="language" value={form.language} onChange={handleChange} options={LANGUAGE_OPTIONS} />
        <FieldWrapper label="학교명">
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
        <FieldWrapper label="입국일">
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
        <SelectField label="비자 종류" name="visaType" value={form.visaType} onChange={handleChange} options={VISA_TYPE_OPTIONS} />
        <PillGroup
          label="외국인등록 여부"
          value={form.hasAlienRegistration}
          onChange={(value) => setField('hasAlienRegistration', value)}
          options={BOOLEAN_OPTIONS}
        />
        <FieldWrapper label="체류 만료일">
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
        <SelectField label="거주 형태" name="housingType" value={form.housingType} onChange={handleChange} options={HOUSING_TYPE_OPTIONS} />
        <PillGroup
          label="부모 지원 여부"
          value={form.isParentSupported}
          onChange={(value) => setField('isParentSupported', value)}
          options={BOOLEAN_OPTIONS}
        />
        <PillGroup
          label="알바 상태"
          value={form.partTimeStatus}
          onChange={(value) => setField('partTimeStatus', value)}
          options={PART_TIME_STATUS_OPTIONS}
          columns={3}
        />
        <SelectField
          label="현재 토픽"
          name="currentTopikLevel"
          value={form.currentTopikLevel}
          onChange={handleChange}
          options={TOPIK_LEVEL_OPTIONS}
        />
        <SelectField
          label="목표 토픽"
          name="targetTopikLevel"
          value={form.targetTopikLevel}
          onChange={handleChange}
          options={TOPIK_LEVEL_OPTIONS}
        />

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

export default EditProfile
