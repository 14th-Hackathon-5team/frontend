import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { setSignupToken } from '../lib/signupToken'

function OAuthCallback() {
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
      setDuplicatedMessage(
        '이미 다른 방법으로 가입된 이메일입니다. 기존 로그인 방법을 이용해주세요.',
      )
      return
    }

    console.warn('[OAuthCallback] 알 수 없는 status', status)
  }, [navigate, setAccessToken])

  if (duplicatedMessage) {
    return <div>{duplicatedMessage}</div>
  }

  return <div>로그인 처리 중...</div>
}

export default OAuthCallback
