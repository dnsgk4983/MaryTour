
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import background from '../assets/images/stamp_background.png';
import stamp_collected from '../assets/images/stamp_collected.png';

gsap.registerPlugin(useGSAP);

const checkpoints = {
    bupyeong: {
        name: '부평구청역',
        latitude: 37.5000,
        longitude: 126.7200,
    },
    daerim: {
        name: '대림역',
        latitude: 37.4900,
        longitude: 126.9000,
    },
    guro: {
        name: '구로디지털단지역',
        latitude: 37.4850,
        longitude: 126.9020,
    },
};

const qr_tokens = {
    'KXcYc-a67GXlnYOXxEYY7Lnu': 'bupyeong',
    '8MgUokAu11yP6696BVZ0ShO1': 'daerim',
};

const allowed_radius = 500;
const stamp_storage_key = 'marytour_stamps';

function calculate_distance(lat_1, lon_1, lat_2, lon_2) {
    const earth_radius = 6371000;
    const to_radians = (value) => value * Math.PI / 180;

    const delta_lat = to_radians(lat_2 - lat_1);
    const delta_lon = to_radians(lon_2 - lon_1);

    const a =
        Math.sin(delta_lat / 2) ** 2 +
        Math.cos(to_radians(lat_1)) *
        Math.cos(to_radians(lat_2)) *
        Math.sin(delta_lon / 2) ** 2;

    return 2 * earth_radius * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );
}

export default function QrCheckPage({ checkpoint_id }) {
    const container_ref = useRef(null);
    const stamp_ref = useRef(null);

    const [status, set_status] = useState('idle');
    const [message, set_message] = useState('');
    const [distance, set_distance] = useState(null);

    const resolved_id = Object.prototype.hasOwnProperty.call(
        qr_tokens,
        checkpoint_id
    )
        ? qr_tokens[checkpoint_id]
        : checkpoint_id;

    const checkpoint = Object.prototype.hasOwnProperty.call(
        checkpoints,
        resolved_id
    )
        ? checkpoints[resolved_id]
        : null;

    useGSAP(
        () => {
            gsap.from('.qr_check__header', {
                opacity: 0,
                y: -25,
                duration: 0.7,
                ease: 'power2.out',
            });

            gsap.from('.qr_check__card', {
                opacity: 0,
                y: 35,
                scale: 0.95,
                duration: 0.8,
                delay: 0.15,
                ease: 'back.out(1.4)',
            });
        },
        {
            scope: container_ref,
        }
    );

    useGSAP(
        () => {
            if (status !== 'success' || !stamp_ref.current) {
                return;
            }

            gsap.fromTo(
                stamp_ref.current,
                {
                    opacity: 0,
                    scale: 0.2,
                    rotation: -30,
                },
                {
                    opacity: 1,
                    scale: 1,
                    rotation: 0,
                    duration: 0.9,
                    ease: 'elastic.out(1, 0.5)',
                }
            );

            gsap.fromTo(
                '.qr_check__sparkle',
                {
                    opacity: 0,
                    scale: 0,
                },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.12,
                    repeat: 1,
                    yoyo: true,
                }
            );
        },
        {
            scope: container_ref,
            dependencies: [status],
        }
    );

    function handle_gps_check() {
        set_distance(null);

        if (!checkpoint) {
            set_status('error');
            set_message('유효하지 않은 QR코드입니다.');
            return;
        }

        if (!navigator.geolocation) {
            set_status('error');
            set_message('GPS를 사용할 수 없는 기기입니다.');
            return;
        }

        set_status('loading');
        set_message('현재 위치를 확인하고 있어요!');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const current_distance = calculate_distance(
                    position.coords.latitude,
                    position.coords.longitude,
                    checkpoint.latitude,
                    checkpoint.longitude
                );

                set_distance(Math.round(current_distance));

                if (current_distance > allowed_radius) {
                    set_status('error');
                    set_message('인증 장소에서 500m 이내로 이동해 주세요!');
                    return;
                }

                try {
                    const stored_value = JSON.parse(
                        localStorage.getItem(stamp_storage_key) || '[]'
                    );

                    const saved_stamps = Array.isArray(stored_value)
                        ? stored_value
                        : [];

                    const already_collected = saved_stamps.includes(
                        resolved_id
                    );

                    if (!already_collected) {
                        localStorage.setItem(
                            stamp_storage_key,
                            JSON.stringify([
                                ...saved_stamps,
                                resolved_id,
                            ])
                        );
                    }

                    set_status('success');
                    set_message(
                        already_collected
                            ? '이미 찾은 단추예요!'
                            : '새로운 단추를 찾았어요!'
                    );
                } catch {
                    set_status('error');
                    set_message('스탬프 저장에 실패했어요.');
                }
            },
            (error) => {
                set_status('error');

                if (error.code === 1) {
                    set_message('위치 권한을 허용해 주세요!');
                } else if (error.code === 3) {
                    set_message('위치 확인 시간이 초과됐어요.');
                } else {
                    set_message('위치를 확인하지 못했어요.');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    }

    function handle_go_home() {
        window.location.href =
            `${window.location.origin}${window.location.pathname}`;
    }

    return (
        <main
            className={`qr_check qr_check_${status}`}
            ref={container_ref}
        >
            <img
                className="qr_check__background"
                src={background}
                alt=""
            />

            <div className="qr_check__content">
                <header className="qr_check__header">
                    <span className="qr_check__eyebrow">
                        MARY'S BUTTON TOUR
                    </span>

                    <h1 className="qr_check__title">
                        {status === 'success'
                            ? '단추를 찾았어요!'
                            : '잃어버린 단추 찾기'}
                    </h1>

                    <p className="qr_check__description">
                        {status === 'success'
                            ? '메리의 소중한 단추를 발견했어요!'
                            : 'QR 인증으로 메리의 단추를 찾아주세요!'}
                    </p>
                </header>

                <section className="qr_check__card">
                    <span className="qr_check__card_label">
                        CHECK POINT
                    </span>

                    <h2 className="qr_check__station_name">
                        {checkpoint?.name || '알 수 없는 장소'}
                    </h2>

                    <div className="qr_check__stamp_area">
                        {status === 'success' ? (
                            <>
                                <span className="qr_check__sparkle qr_check__sparkle_1">
                                    ✦
                                </span>

                                <span className="qr_check__sparkle qr_check__sparkle_2">
                                    ✧
                                </span>

                                <span className="qr_check__sparkle qr_check__sparkle_3">
                                    ✦
                                </span>

                                <img
                                    className="qr_check__stamp_image"
                                    src={stamp_collected}
                                    ref={stamp_ref}
                                    alt="획득한 단추"
                                />
                            </>
                        ) : (
                            <div className="qr_check__stamp_placeholder">
                                <span>?</span>
                            </div>
                        )}
                    </div>

                    <p className="qr_check__status_text">
                        {status === 'success'
                            ? message
                            : status === 'loading'
                                ? '위치를 확인하는 중...'
                                : '이 장소에서 GPS 인증을 진행해 주세요!'}
                    </p>

                    {distance !== null && (
                        <p className="qr_check__distance">
                            현재 거리: {distance.toLocaleString()}m
                        </p>
                    )}

                    {status !== 'success' && (
                        <span className="qr_check__radius">
                            인증 가능 거리 500m
                        </span>
                    )}
                </section>

                {status === 'error' && (
                    <p className="qr_check__error" role="alert">
                        {message}
                    </p>
                )}

                {status !== 'success' ? (
                    <button
                        className="qr_check__button"
                        type="button"
                        disabled={status === 'loading' || !checkpoint}
                        onClick={handle_gps_check}
                    >
                        {status === 'loading'
                            ? '위치 확인 중...'
                            : status === 'error'
                                ? '다시 인증하기'
                                : 'GPS 인증하기'}
                    </button>
                ) : (
                    <button
                        className="qr_check__button"
                        type="button"
                        onClick={handle_go_home}
                    >
                        단추 보관함으로 돌아가기
                    </button>
                )}
            </div>
        </main>
    );
}
