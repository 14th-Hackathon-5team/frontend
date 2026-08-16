import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/authStore'
import { setSignupToken } from '../lib/signupToken'

function OAuthCallback() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  const [duplicatedMessage, setDuplicatedMessage] = useState(null)

  useEffect(() => {
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash
    const params = new URLSearchParams(hash)
    const status = params.get('status')

    console.log('[OAuthCallback] hash 파싱 결과', {
      status,
      signupToken: params.get('signupToken'),
      accessToken: params.get('accessToken'),
    })

    if (status === 'NEW_USER') {
      const signupToken = params.get('signupToken')
      setSignupToken(signupToken)
      console.log('[OAuthCallback] 신규 유저 → signupToken 저장 후 /signup/profile 이동')
      navigate('/signup/profile', { replace: true })
      return
    }

    if (status === 'EXISTING_USER') {
      const accessToken = params.get('accessToken')
      setAccessToken(accessToken)
      console.log('[OAuthCallback] 기존 유저 → accessToken 저장 후 / 이동')
      navigate('/', { replace: true })
      return
    }

    if (status === 'EMAIL_DUPLICATED') {
      console.log('[OAuthCallback] 이메일 중복 감지')
      setDuplicatedMessage(t('oauth.emailDuplicated'))
      return
    }

    console.warn('[OAuthCallback] 알 수 없는 status', status)
  }, [navigate, setAccessToken, t])

  if (duplicatedMessage) {
    return <div>{duplicatedMessage}</div>
  }

  return <div>{t('oauth.processing')}</div>
}

export default OAuthCallback
