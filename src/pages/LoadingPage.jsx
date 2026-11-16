import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import loadingBackground from '../assets/images/loading_background.png';
import loadingButton from '../assets/images/loading_button.png';
import loadingSparkle from '../assets/images/loading_sparkle.png';
import loadingThread from '../assets/images/loading_thread.png';

import splashBackground from '../assets/images/splash_background.png';
import splashMary from '../assets/images/splash_mary.png';
import splashTitle from '../assets/images/splash_title_frame.png';
import splashStartButton from '../assets/images/splash_start_button.png';

gsap.registerPlugin(useGSAP);

const images = [
    loadingBackground,
    loadingButton,
    loadingSparkle,
    loadingThread,
    splashBackground,
    splashMary,
    splashTitle,
    splashStartButton,
];

function preload_image(src) {
    return new Promise((resolve) => {
        const image = new Image();

        image.onload = resolve;
        image.onerror = resolve;
        image.src = src;
    });
}

export default function LoadingPage({ onComplete }) {
    const container_ref = useRef(null);
    const button_ref = useRef(null);
    const sparkle_ref = useRef(null);
    const thread_ref = useRef(null);
    const on_complete_ref = useRef(onComplete);

    on_complete_ref.current = onComplete;

    useGSAP(
        () => {
            gsap.to(button_ref.current, {
                rotation: 360,
                duration: 12,
                repeat: -1,
                ease: 'none',
            });

            gsap.to(sparkle_ref.current, {
                opacity: 0.65,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });

            gsap.to(thread_ref.current, {
                y: -5,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        },
        {
            scope: container_ref,
        }
    );

    useEffect(() => {
        let cancelled = false;

        const minimum_delay = new Promise((resolve) => {
            setTimeout(resolve, 1500);
        });

        async function prepare() {
            await Promise.all([
                Promise.all(images.map(preload_image)),
                minimum_delay,
            ]);

            if (!cancelled) {
                on_complete_ref.current();
            }
        }

        prepare();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <main className="loading" ref={container_ref}>
            <img
                className="loading__background"
                src={loadingBackground}
                alt=""
            />

            <img
                className="loading__thread"
                ref={thread_ref}
                src={loadingThread}
                alt=""
            />

            <img
                className="loading__sparkle"
                ref={sparkle_ref}
                src={loadingSparkle}
                alt=""
            />

            <img
                className="loading__button"
                ref={button_ref}
                src={loadingButton}
                alt=""
            />

            <p className="loading__text">
                메리의 단추를 찾는 중...
            </p>
        </main>
    );
}