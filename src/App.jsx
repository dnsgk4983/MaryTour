
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import LoadingPage from './pages/LoadingPage.jsx';
import SplashPage from './pages/SplashPage.jsx';
import HomePage from './pages/HomePage.jsx';
import QrCheckPage from './pages/QrCheckPage.jsx';
import QrScannerPage from './pages/QrScannerPage.jsx';
import RewardPage from './pages/RewardPage.jsx';

gsap.registerPlugin(useGSAP);

const stamp_storage_key = 'marytour_stamps';

const required_stamps = [
    'bupyeong',
    'daerim',
    'guro',
];

function get_check_token() {
    const match = window.location.hash.match(
        /^#\/check\/([^/?]+)/
    );

    return match ? decodeURIComponent(match[1]) : null;
}

function get_collected_stamps() {
    try {
        const saved_stamps = JSON.parse(
            localStorage.getItem(stamp_storage_key) || '[]'
        );

        return Array.isArray(saved_stamps)
            ? saved_stamps
            : [];
    } catch {
        return [];
    }
}

function is_all_collected(stamps) {
    return required_stamps.every(
        (stamp_id) => stamps.includes(stamp_id)
    );
}

function HomeScreen({
    onCheckStamp,
    onClaimReward,
    collectedStamps,
}) {
    const screen_ref = useRef(null);

    useGSAP(
        () => {
            gsap.fromTo(
                screen_ref.current,
                {
                    opacity: 0,
                    y: 20,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.65,
                    ease: 'power2.out',
                }
            );
        },
        {
            scope: screen_ref,
        }
    );

    return (
        <div
            className="screen_layer"
            ref={screen_ref}
        >
            <HomePage
                collectedStamps={collectedStamps}
                onCheckStamp={onCheckStamp}
                onClaimReward={onClaimReward}
            />
        </div>
    );
}

export default function App() {
    const [page, set_page] = useState('loading');
    const [show_splash, set_show_splash] = useState(false);
    const [check_token, set_check_token] = useState(get_check_token);
    const [collected_stamps, set_collected_stamps] = useState(get_collected_stamps);

    const splash_ref = useRef(null);

    const refresh_stamps = useCallback(() => {
        const stamps = get_collected_stamps();

        set_collected_stamps(stamps);

        return stamps;
    }, []);

    useEffect(() => {
        const handle_hash_change = () => {
            set_check_token(get_check_token());
            refresh_stamps();
        };

        window.addEventListener('hashchange', handle_hash_change);
        window.addEventListener('focus', refresh_stamps);
        window.addEventListener('storage', refresh_stamps);

        return () => {
            window.removeEventListener('hashchange', handle_hash_change);
            window.removeEventListener('focus', refresh_stamps);
            window.removeEventListener('storage', refresh_stamps);
        };
    }, [refresh_stamps]);

    const handle_loading_complete = useCallback(() => {
        set_show_splash(true);
    }, []);

    useGSAP(
        () => {
            if (
                check_token !== null ||
                !show_splash ||
                page !== 'loading' ||
                !splash_ref.current
            ) {
                return;
            }

            const tween = gsap.fromTo(
                splash_ref.current,
                {
                    opacity: 0,
                },
                {
                    opacity: 1,
                    duration: 0.8,
                    ease: 'sine.inOut',
                    onComplete: () => {
                        set_page('splash');
                    },
                }
            );

            return () => {
                tween.kill();
            };
        },
        {
            dependencies: [
                show_splash,
                page,
                check_token,
            ],
        }
    );

    const handle_start = useCallback(() => {
        refresh_stamps();
        set_page('home');
    }, [refresh_stamps]);

    const handle_check_stamp = useCallback(() => {
        set_page('scanner');
    }, []);

    const handle_claim_reward = useCallback(() => {
        const stamps = refresh_stamps();

        if (!is_all_collected(stamps)) {
            return;
        }

        set_page('reward');
    }, [refresh_stamps]);

    const handle_scanner_back = useCallback(() => {
        refresh_stamps();
        set_page('home');
    }, [refresh_stamps]);

    const handle_reward_back = useCallback(() => {
        refresh_stamps();
        set_page('home');
    }, [refresh_stamps]);

    const handle_scan = useCallback((token) => {
        window.location.hash = `/check/${encodeURIComponent(token)}`;
    }, []);

    if (check_token !== null) {
        return (
            <div className="container">
                <QrCheckPage checkpoint_id={check_token} />
            </div>
        );
    }

    return (
        <div className="container">
            {page === 'loading' && (
                <div className="screen_layer">
                    <LoadingPage
                        onComplete={handle_loading_complete}
                    />
                </div>
            )}

            {show_splash && (page === 'loading' || page === 'splash') && (
                <div
                    ref={splash_ref}
                    className="screen_layer screen_layer__front"
                    style={{
                        opacity: page === 'loading' ? 0 : 1,
                    }}
                >
                    <SplashPage
                        onStart={handle_start}
                    />
                </div>
            )}

            {page === 'home' && (
                <HomeScreen
                    collectedStamps={collected_stamps}
                    onCheckStamp={handle_check_stamp}
                    onClaimReward={handle_claim_reward}
                />
            )}

            {page === 'scanner' && (
                <div className="screen_layer">
                    <QrScannerPage
                        onScan={handle_scan}
                        onBack={handle_scanner_back}
                    />
                </div>
            )}

            {page === 'reward' && (
                <div className="screen_layer">
                    <RewardPage
                        onBack={handle_reward_back}
                    />
                </div>
            )}
        </div>
    );
}
