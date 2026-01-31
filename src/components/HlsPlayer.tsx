import React, {useEffect, useRef} from 'react';
import Hls from 'hls.js';

type HlsPlayerProps = {
    src: string;          // m3u8 URL (예: /hls/1/output.m3u8)
    autoPlay?: boolean;
    controls?: boolean;
    muted?: boolean;
    poster?: string;
    className?: string;
};

const HlsPlayer: React.FC<HlsPlayerProps> = ({
                                                 src,
                                                 autoPlay = true,
                                                 controls = true,
                                                 // muted = false, // 모바일 자동재생 이슈 대비
                                                 poster,
                                                 className,
                                             }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const hlsRef = useRef<Hls | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !src) return;

        // 기존 인스턴스 정리
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // hls.js 지원 브라우저
        if (Hls.isSupported()) {
            const hls = new Hls({
                // lowLatencyMode: false,
                // backBufferLength: 90,
            });
            hlsRef.current = hls;

            hls.on(Hls.Events.ERROR, (_evt, data) => {
                // 네트워크/미디어 에러 등 로깅
                // console.log('HLS error:', data);
                // 치유 가능한 에러는 hls가 내부적으로 재시도함
                console.error(data);
            });

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                // 자동재생 시도
                if (autoPlay) {
                    video.play().catch(() => {
                        // 자동재생 정책으로 실패
                    });
                }
            });

            hls.loadSource(src);
            hls.attachMedia(video);
        }
        // Safari 등 네이티브 HLS
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.addEventListener('loadedmetadata', () => {
                if (autoPlay) {
                    video.play().catch(() => {
                    });
                }
            });
        }
        // 그 외 (미지원)
        else {
            console.warn('This browser does not support HLS.');
        }

        // cleanup
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [src, autoPlay]);


    return (
        <video
            ref={videoRef}
            className={className}
            controls={controls}
            // muted={muted}
            poster={poster}
            playsInline
            // preload="auto" // 필요 시
            style={{height: '540px', width: '100%', maxWidth: 960 }} // 크기 조절 -> 영상이 기본 해상도에 맞춰져서 렌더링 되버림
        />
    );
};

export default HlsPlayer;
