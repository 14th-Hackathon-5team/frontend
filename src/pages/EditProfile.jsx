import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getMyInfo, updateMyInfo } from '../lib/authApi'
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
  const { t } = useTranslation()
  const booleanOptions = useBooleanOptions()
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
      setErrorMessage(t('editProfile.error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!form) {
    return <p className="p-6 text-center text-sm text-foreground-400">{t('common.loading')}</p>
  }

  return (
    <div className="min-h-screen bg-background-50 px-6 py-6">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center text-xl text-foreground-700">
          ‹
        </button>
        <h1 className="text-lg font-bold text-foreground-950">{t('editProfile.title')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FieldWrapper label={t('profileFields.name')}>
          <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required className={inputClass} />
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

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? t('editProfile.saving') : t('editProfile.save')}
        </button>
      </form>
    </div>
  )
}

export default EditProfile