
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const scanner_id = 'marytour_qr_reader';
const upload_scanner_id = 'marytour_qr_upload_reader';

const deployed_site = 'https://dnsgk4983.github.io/MaryTour/';

export default function QrScannerPage({ onScan, onBack }) {
    const camera_ref = useRef(null);
    const upload_ref = useRef(null);
    const file_input_ref = useRef(null);

    const scanned_ref = useRef(false);
    const processing_ref = useRef(false);
    const mounted_ref = useRef(false);

    const [status, set_status] = useState('idle');
    const [message, set_message] = useState('');

    useEffect(() => {
        mounted_ref.current = true;
        scanned_ref.current = false;

        const camera = new Html5Qrcode(scanner_id, {
            verbose: false,
        });

        const upload_scanner = new Html5Qrcode(upload_scanner_id, {
            verbose: false,
        });

        camera_ref.current = camera;
        upload_ref.current = upload_scanner;

        return () => {
            mounted_ref.current = false;
            scanned_ref.current = true;

            camera_ref.current = null;
            upload_ref.current = null;

            async function cleanup_scanner(scanner) {
                try {
                    if (scanner.isScanning) {
                        await scanner.stop();
                    }

                    scanner.clear();
                } catch {
                    // 이미 종료된 스캐너는 무시
                }
            }

            void cleanup_scanner(camera);
            void cleanup_scanner(upload_scanner);
        };
    }, []);

    function get_qr_token(decoded_text) {
        const value = decoded_text.trim();

        let scanned_url;

        try {
            scanned_url = new URL(value);
        } catch {
            throw new Error('invalid_url');
        }

        const allowed_site = new URL(deployed_site);
        const current_site = new URL(window.location.href);

        const normalize_path = (pathname) => {
            return pathname.replace(/\/+$/, '');
        };

        const is_local_test =
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        const is_deployed_site =
            scanned_url.origin === allowed_site.origin &&
            normalize_path(scanned_url.pathname) ===
                normalize_path(allowed_site.pathname);

        const is_local_qr =
            is_local_test &&
            scanned_url.origin === current_site.origin &&
            normalize_path(scanned_url.pathname) ===
                normalize_path(current_site.pathname);

        if (!is_deployed_site && !is_local_qr) {
            throw new Error('invalid_site');
        }

        const match = scanned_url.hash.match(
            /^#\/check\/([^/?]+)\/?$/
        );

        if (!match) {
            throw new Error('invalid_route');
        }

        const token = decodeURIComponent(match[1]);

        if (!token) {
            throw new Error('invalid_token');
        }

        return token;
    }

    function handle_qr_result(decoded_text) {
        if (scanned_ref.current || !mounted_ref.current) {
            return false;
        }

        let token;

        try {
            token = get_qr_token(decoded_text);
        } catch (error) {
            console.error('QR 주소 검사 오류:', error);
            console.log('QR 원본 내용:', decoded_text);

            set_status('error');
            set_message(
                '메리투어 전용 QR코드가 아닙니다. QR 주소를 확인해 주세요!'
            );

            return false;
        }

        scanned_ref.current = true;

        set_status('success');
        set_message(
            'QR코드 인식 성공! GPS 인증 화면으로 이동합니다.'
        );

        onScan(token);

        return true;
    }

    async function stop_camera() {
        const camera = camera_ref.current;

        if (!camera || !camera.isScanning) {
            return;
        }

        try {
            await camera.stop();
        } catch {
            // 이미 종료된 카메라는 무시
        }
    }

    async function handle_start_scan() {
        const camera = camera_ref.current;

        if (
            !camera ||
            camera.isScanning ||
            processing_ref.current
        ) {
            return;
        }

        processing_ref.current = true;
        scanned_ref.current = false;

        set_status('loading');
        set_message('카메라를 준비하고 있어요!');

        try {
            await camera.start(
                {
                    facingMode: 'environment',
                },
                {
                    fps: 10,
                    qrbox: {
                        width: 220,
                        height: 220,
                    },
                },
                (decoded_text) => {
                    if (scanned_ref.current) {
                        return;
                    }

                    const is_valid = handle_qr_result(decoded_text);

                    if (is_valid) {
                        void stop_camera();
                    }
                },
                () => {}
            );

            if (
                mounted_ref.current &&
                !scanned_ref.current
            ) {
                set_status('scanning');
                set_message(
                    'QR코드를 카메라에 비춰 주세요!'
                );
            }
        } catch (error) {
            console.error('카메라 실행 오류:', error);

            if (mounted_ref.current) {
                set_status('error');
                set_message(
                    '카메라를 실행하지 못했어요. 권한을 확인해 주세요!'
                );
            }
        } finally {
            processing_ref.current = false;
        }
    }

    async function handle_upload(event) {
        const file = event.target.files?.[0];

        event.target.value = '';

        if (!file || processing_ref.current) {
            return;
        }

        const upload_scanner = upload_ref.current;

        if (!upload_scanner) {
            set_status('error');
            set_message(
                'QR 이미지 분석기를 준비하지 못했어요.'
            );
            return;
        }

        if (!file.type.startsWith('image/')) {
            set_status('error');
            set_message(
                '이미지 파일만 업로드할 수 있어요.'
            );
            return;
        }

        processing_ref.current = true;
        scanned_ref.current = false;

        set_status('loading');
        set_message(
            '업로드한 QR 이미지를 분석하고 있어요!'
        );

        try {
            await stop_camera();

            const decoded_text = await upload_scanner.scanFile(
                file,
                true
            );

            if (!mounted_ref.current) {
                return;
            }

            handle_qr_result(decoded_text);
        } catch (error) {
            console.error('QR 이미지 인식 오류:', error);

            if (mounted_ref.current) {
                set_status('error');
                set_message(
                    '이미지에서 QR코드를 찾지 못했어요. 선명한 QR 이미지를 선택해 주세요!'
                );
            }
        } finally {
            processing_ref.current = false;
        }
    }

    async function handle_back() {
        scanned_ref.current = true;

        await stop_camera();

        onBack();
    }

    return (
        <main className="qr_scanner">
            <div className="qr_scanner__content">
                <span className="qr_scanner__eyebrow">
                    MARY'S BUTTON TOUR
                </span>

                <h1 className="qr_scanner__title">
                    단추 찾기
                </h1>

                <p className="qr_scanner__description">
                    QR코드를 스캔하거나 이미지를 업로드해 주세요!
                </p>

                <div className="qr_scanner__camera">
                    <div
                        className="qr_scanner__reader"
                        id={scanner_id}
                    />
                </div>

                <button
                    className="qr_scanner__button"
                    type="button"
                    onClick={handle_start_scan}
                    disabled={
                        status === 'loading' ||
                        status === 'scanning'
                    }
                >
                    {status === 'loading'
                        ? '처리 중...'
                        : status === 'scanning'
                            ? '카메라 스캔 중...'
                            : 'QR 스캔 시작하기'}
                </button>

                <input
                    ref={file_input_ref}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    style={{
                        display: 'none',
                    }}
                    onChange={handle_upload}
                />

                <button
                    className="qr_scanner__upload_button"
                    type="button"
                    disabled={status === 'loading'}
                    onClick={() => {
                        file_input_ref.current?.click();
                    }}
                >
                    QR 이미지 업로드 (테스트)
                </button>

                {message && (
                    <p
                        className="qr_scanner__message"
                        role="status"
                    >
                        {message}
                    </p>
                )}

                <button
                    className="qr_scanner__back"
                    type="button"
                    onClick={handle_back}
                >
                    메인으로 돌아가기
                </button>

                <div
                    id={upload_scanner_id}
                    style={{
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        overflow: 'hidden',
                        opacity: 0,
                        pointerEvents: 'none',
                    }}
                    aria-hidden="true"
                />
            </div>
        </main>
    );
}
