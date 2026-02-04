import {useState, type ChangeEvent} from 'react';
import type {FileWithId} from "../types/FileWithId.ts";
import type {UploadStatus} from "../types/UploadStatus.ts";
import styles from "../styles/FileUploader.module.css"
import {getPresignedUrl} from "../axios/StorageApi.ts";
import {postFile} from "../axios/MetadataApi.ts";
import type {StorageInfo} from "../types/StorageInfo.ts";

export default function FileUploader() {
    const [files, setFiles] = useState<FileWithId[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<Record<string, UploadStatus>>({});
    const [group, setGroup] = useState('');
    const [ownerId, setOwnerId] = useState('');
    const [isHls, setHls] = useState<boolean>(false);

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const validFiles: FileWithId[] = [];
        const newStatus: Record<string, UploadStatus> = {};

        selectedFiles.forEach(file => {
            if (file.name.endsWith('.m3u8')) {
                setHls(true)
            }
            const fileId = `${file.name}-${file.size}-${Date.now()}`;

            // 파일 크기 검증만 수행
            if (file.size > MAX_FILE_SIZE) {
                newStatus[fileId] = {
                    status: 'error',
                    message: `파일 크기가 10MB를 초과합니다 (${(file.size / 1024 / 1024).toFixed(2)}MB)`
                };
            } else {
                newStatus[fileId] = {
                    status: 'ready',
                    message: '업로드 준비됨'
                };
                validFiles.push({file, id: fileId, preSignedUrl:""});
            }
        });

        setFiles(prev => [...prev, ...validFiles]);
        setUploadStatus(prev => ({...prev, ...newStatus}));
    };

    const uploadFile = async (fileWithId: FileWithId): Promise<void> => {

        setUploadStatus(prev => ({
            ...prev,
            [fileWithId.id]: {status: 'uploading', message: '업로드 중...', progress: 0}
        }));

        const formData = new FormData();
        formData.append('file', fileWithId.file);

        if (group) {
            formData.append('group', group);
        }
        if (ownerId) {
            formData.append('ownerId', ownerId);
        }

        if (isHls) {
            formData.append('isHls', String(isHls));
        }

        try {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setUploadStatus(prev => ({
                        ...prev,
                        [fileWithId.id]: {
                            status: 'uploading',
                            message: `업로드 중... ${percent}%`,
                            progress: percent
                        }
                    }));
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    try {
                        setUploadStatus(prev => ({
                            ...prev,
                            [fileWithId.id]: {
                                status: 'success',
                                message: '업로드 완료',
                                progress: 100,
                            }
                        }));

                    } catch (error) {
                        console.error(error);
                        setUploadStatus(prev => ({
                            ...prev,
                            [fileWithId.id]: {
                                status: 'success',
                                message: '업로드 완료',
                                progress: 100
                            }
                        }));
                    }
                } else {
                    const errorMessage = xhr.responseText || '업로드 실패';
                    setUploadStatus(prev => ({
                        ...prev,
                        [fileWithId.id]: {
                            status: 'error',
                            message: `업로드 실패: ${errorMessage}`
                        }
                    }));
                }
            });

            xhr.addEventListener('error', () => {
                setUploadStatus(prev => ({
                    ...prev,
                    [fileWithId.id]: {
                        status: 'error',
                        message: '네트워크 오류가 발생했습니다'
                    }
                }));
            });

            xhr.open('PUT', fileWithId.preSignedUrl);
            xhr.send(formData);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
            setUploadStatus(prev => ({
                ...prev,
                [fileWithId.id]: {
                    status: 'error',
                    message: `업로드 실패: ${errorMessage}`
                }
            }));
        }
        const file:StorageInfo = {
            ownerId:"김규영",
            group:"",
            originalFilename: fileWithId.file.webkitRelativePath,
            size:fileWithId.file.size,
            contentType:fileWithId.file.type,
            isHls:false
        }

        postFile(file, false)
    };

    const handleUpload = async () => {
        setUploading(true);

        //준비 상태인 것만 필터
        const filesToUpload = files.filter(fileWithId => {
            const status = uploadStatus[fileWithId.id]?.status;
            return status === 'ready';
        });

        // 병렬 업로드 (동시에 최대 3개)
        const chunkSize = 3;
        for (let i = 0; i < filesToUpload.length; i += chunkSize) {
            const chunk = filesToUpload.slice(i, i + chunkSize);
            const presignedUrls = await getPresignedUrl(chunk);

            // presignedUrl을 각 파일에 매핑
            const chunkWithUrls = chunk.map(fileWithId => {
                const urlData = presignedUrls.find((item:{fileName:string, fileId:string}) => item.fileId === fileWithId.id);
                return {
                    ...fileWithId,
                    preSignedUrl: urlData?.preSignedUrl || urlData?.url
                };
            });

            console.log(chunkWithUrls);

            await Promise.all(chunkWithUrls.map(fileWithId => {
                uploadFile(fileWithId);
            }));
        }

        setUploading(false);
    };



    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
        setUploadStatus(prev => {
            const newStatus = {...prev};
            delete newStatus[id];
            return newStatus;
        });
    };

    const clearAll = () => {
        setFiles([]);
        setUploadStatus({});
    };

    // ⭐️ status에 따라 styles 객체의 속성을 반환하도록 수정
    const getStatusColor = (status?: 'ready' | 'uploading' | 'success' | 'error') => {
        switch (status) {
            case 'success':
                return styles.statusSuccess;
            case 'error':
                return styles.statusError;
            case 'uploading':
                return styles.statusUploading;
            default:
                return styles.statusReady;
        }
    };

    const successCount = Object.values(uploadStatus).filter(s => s.status === 'success').length;
    const errorCount = Object.values(uploadStatus).filter(s => s.status === 'error').length;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <p className={styles.subtitle}>파일을 업로드 (최대 10MB)</p>

                <div className={`${styles.inputGroup}`}>
                    <div>
                        <label className={styles.label}>그룹</label>
                        <input
                            type="text"
                            value={group}
                            onChange={(e) => setGroup(e.target.value)}
                            placeholder="파일 그룹 입력"
                            className={styles.input}
                        />
                    </div>
                    <div>
                        <label className={styles.label}>소유자 ID</label>
                        <input
                            type="text"
                            value={ownerId}
                            onChange={(e) => setOwnerId(e.target.value)}
                            placeholder="소유자 ID 입력"
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.dropzone}>
                    <input
                        type="file"
                        id="fileInput"
                        multiple
                        webkitdirectory=""
                        directory=""
                        onChange={handleFileSelect}
                        style={{display: 'none'}}
                    />
                    <input
                        type="file"
                        id="singleFileInput"
                        multiple
                        onChange={handleFileSelect}
                        style={{display: 'none'}}
                    />

                    <div className={`${styles.f3rMb1r}`}>📁</div>

                    <div className={`${styles.flexColCenterGapSm}`}>
                        <label
                            htmlFor="fileInput"
                            className={`${styles.button} ${styles.buttonPrimary}`}
                        >
                            폴더 선택
                        </label>

                        <div style={{color: '#6b7280'}}>또는</div>

                        <label
                            htmlFor="singleFileInput"
                            className={`${styles.button} ${styles.buttonSecondary}`}
                        >
                            개별 파일 선택
                        </label>
                    </div>

                    <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem'}}>
                        여러 파일을 동시에 선택할 수 있습니다
                    </p>
                </div>

                {files.length > 0 && (
                    <div className={`${styles.flexColGap1r}`}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                                <h2 style={{fontSize: '1.25rem', fontWeight: '600', color: '#374151'}}>
                                    선택된 파일 ({files.length})
                                </h2>
                                {(successCount > 0 || errorCount > 0) && (
                                    <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem'}}>
                                        성공: {successCount} / 실패: {errorCount}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={clearAll}
                                disabled={uploading}
                                style={{
                                    fontSize: '0.875rem',
                                    color: uploading ? '#9ca3af' : '#ef4444',
                                    fontWeight: '500',
                                    background: 'none',
                                    border: 'none',
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                모두 제거
                            </button>
                        </div>

                        <div className={`${styles.fileList}`}>
                            {files.map((fileWithId, i) => {
                                const status = uploadStatus[fileWithId.id];

                                return (
                                    <div key={fileWithId.id + i} className={`${styles.fileItem}`}>
                                        <div className={`${styles.fileInfo}`}>
                                            <div style={{flex: 1, minWidth: 0}}>
                                                <p className={`${styles.fileName}`}>
                                                    {fileWithId.file.name}
                                                </p>
                                                <p className={`${styles.fileSize}`}>
                                                    {(fileWithId.file.size / 1024).toFixed(2)} KB
                                                    {status?.message && (
                                                        <span
                                                            // ⭐️ getStatusColor가 styles 객체의 값을 반환함
                                                            className={getStatusColor(status.status)}
                                                            style={{marginLeft: '0.5rem'}}>
                                                            • {status.message}
                                                        </span>
                                                    )}
                                                </p>
                                                {status?.status === 'uploading' && status.progress !== undefined && (
                                                    <div className={`${styles.progressBar}`}>
                                                        <div
                                                            className={`${styles.progressFill}`}
                                                            style={{
                                                                width: `${status.progress}%`
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {status?.status !== 'uploading' && status?.status !== 'success' && (
                                            <button
                                                onClick={() => removeFile(fileWithId.id)}
                                                className={`${styles.removeButton}`}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={uploading || files.length === 0}
                            className={`${styles.uploadButton}`}
                            style={{
                                background: (uploading || files.length === 0) ? '#9ca3af' : '#3b82f6',
                                cursor: (uploading || files.length === 0) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {uploading ? '업로드 중...' : '업로드 시작'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}