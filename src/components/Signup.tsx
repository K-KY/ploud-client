import { useState } from 'react';
import styles from '../styles/Signup.module.css';

interface SignupRequest {
    userName: string;
    userEmail: string;
    password: string;
}

const Signup = () => {
    const [form, setForm] = useState<SignupRequest>({
        userName: '',
        userEmail: '',
        password: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.userName || !form.userEmail || !form.password) {
            setError('모든 항목을 입력해주세요.');
            return;
        }
        if (form.password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (form.password.length < 8) {
            setError('비밀번호는 8자 이상이어야 합니다.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            fetch('http://localhost:8080/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            alert("이메일이 발송 되었습니다.")

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.card}>
                    <div className={styles.successIcon}>✓</div>
                    <h2 className={styles.successTitle}>가입 완료!</h2>
                    <p className={styles.successMessage}>
                        환영합니다, {form.userName}님.<br />
                        로그인 후 서비스를 이용해주세요.
                    </p>
                    <a href="/login" className={styles.loginLink}>로그인 하러 가기</a>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                {/* 헤더 */}
                <div className={styles.header}>
                    <div className={styles.logo}>✦</div>
                    <h1 className={styles.title}>회원가입</h1>
                    <p className={styles.subtitle}>계정을 만들어 시작하세요</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form} noValidate>
                    {/* 이름 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="userName">이름</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </span>
                            <input
                                id="userName"
                                name="userName"
                                type="text"
                                className={styles.input}
                                placeholder="홍길동"
                                value={form.userName}
                                onChange={handleChange}
                                autoComplete="name"
                            />
                        </div>
                    </div>

                    {/* 이메일 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="userEmail">이메일</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                </svg>
                            </span>
                            <input
                                id="userEmail"
                                name="userEmail"
                                type="email"
                                className={styles.input}
                                placeholder="example@email.com"
                                value={form.userEmail}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* 비밀번호 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="password">비밀번호</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                            </span>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className={styles.input}
                                placeholder="8자 이상 입력"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    {/* 비밀번호 확인 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="confirmPassword">비밀번호 확인</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                            </span>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                className={`${styles.input} ${
                                    confirmPassword && form.password !== confirmPassword ? styles.inputError : ''
                                }`}
                                placeholder="비밀번호 재입력"
                                value={confirmPassword}
                                onChange={e => {
                                    setConfirmPassword(e.target.value);
                                    setError(null);
                                }}
                                autoComplete="new-password"
                            />
                        </div>
                        {confirmPassword && form.password !== confirmPassword && (
                            <p className={styles.fieldError}>비밀번호가 일치하지 않습니다</p>
                        )}
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className={styles.errorBanner}>
                            <span>⚠</span> {error}
                        </div>
                    )}

                    {/* 제출 버튼 */}
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className={styles.spinner} />
                        ) : (
                            '가입하기'
                        )}
                    </button>
                </form>

                <p className={styles.loginText}>
                    이미 계정이 있으신가요?{' '}
                    <a href="/login" className={styles.loginAnchor}>로그인</a>
                </p>
            </div>
        </div>
    );
};

export default Signup;