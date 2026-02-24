import React, { useState, type FormEvent } from 'react';
import styles from '../styles/LoginPage.module.css';
import type {LoginForm} from "../types/LoginForm.ts";
import {login} from "../axios/UserApi.ts";


export default function LoginPage() {
    const [formData, setFormData] = useState<LoginForm>({
        userEmail: '',
        userPassword: '',
    });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.userEmail || !formData.userPassword) {
            setError('이메일과 비밀번호를 모두 입력해주세요.');
            setLoading(false);
            return;
        }

        try {
            console.log('로그인 성공:');

        } catch (err) {
            setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>로그인</h1>
                    <p className={styles.subtitle}>계정에 로그인하여 시작하세요</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="userEmail" className={styles.label}>
                            이메일
                        </label>
                        <input
                            type="userEmail"
                            id="userEmail"
                            name="userEmail"
                            value={formData.userEmail}
                            onChange={handleInputChange}
                            placeholder="example@email.com"
                            className={styles.input}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="userPassword" className={styles.label}>
                            비밀번호
                        </label>
                        <input
                            type="password"
                            id="userPassword"
                            name="userPassword"
                            value={formData.userPassword}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className={styles.input}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.button}
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div className={styles.footer}>
                    계정이 없으신가요?{' '}
                    <a href="/signup" className={styles.link}>
                        회원가입
                    </a>
                </div>
            </div>
        </div>
    );
}