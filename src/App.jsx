import { useCallback, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import LoadingPage from './pages/LoadingPage.jsx';
import SplashPage from './pages/SplashPage.jsx';
import HomePage from './pages/HomePage.jsx';

gsap.registerPlugin(useGSAP);

function HomeScreen({ onCheckStamp }) {
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
        <div className="screen_layer" ref={screen_ref}>
            <HomePage
                collectedStamps={[]}
                onCheckStamp={onCheckStamp}
            />
        </div>
    );
}

export default function App() {
    const [page, set_page] = useState('loading');
    const [show_splash, set_show_splash] = useState(false);

    const splash_ref = useRef(null);

    const handle_loading_complete = useCallback(() => {
        set_show_splash(true);
    }, []);

    useGSAP(
        () => {
            if (!show_splash || page !== 'loading') {
                return;
            }

            gsap.fromTo(
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
        },
        {
            dependencies: [show_splash, page],
        }
    );

    const handle_start = useCallback(() => {
        set_page('home');
    }, []);

    const handle_check_stamp = useCallback(() => {
        set_page('stamp');
    }, []);

    return (
        <div className="container">
            {page === 'loading' && (
                <div className="screen_layer">
                    <LoadingPage
                        onComplete={handle_loading_complete}
                    />
                </div>
            )}

            {show_splash && page !== 'home' && page !== 'stamp' && (
                <div
                    ref={splash_ref}
                    className="screen_layer screen_layer__front"
                    style={{
                        opacity: page === 'loading' ? 0 : 1,
                    }}
                >
                    <SplashPage onStart={handle_start} />
                </div>
            )}

            {page === 'home' && (
                <HomeScreen onCheckStamp={handle_check_stamp} />
            )}

            {page === 'stamp' && (
                <main className="stamp">
                    <h1 className="stamp__title">
                        스탬프 인증
                    </h1>
                </main>
            )}
        </div>
    );
}