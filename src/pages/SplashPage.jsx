import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import background from '../assets/images/splash_background.png';
import mary from '../assets/images/splash_mary.png';
import title from '../assets/images/splash_title_frame.png';
import startButton from '../assets/images/splash_start_button.png';

gsap.registerPlugin(useGSAP);

export default function SplashPage({ onStart }) {
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const maryRef = useRef(null);
    const buttonRef = useRef(null);
    const isTransitioningRef = useRef(false);

    const { contextSafe } = useGSAP(
        () => {
            const timeline = gsap.timeline({
                defaults: {
                    ease: 'power2.out',
                },
            });

            timeline
                .from(titleRef.current, {
                    opacity: 0,
                    y: -30,
                    duration: 0.7,
                })
                .from(
                    maryRef.current,
                    {
                        opacity: 0,
                        y: 50,
                        duration: 0.9,
                        ease: 'back.out(1.3)',
                    },
                    '-=0.3'
                )
                .from(
                    buttonRef.current,
                    {
                        opacity: 0,
                        scale: 0.85,
                        duration: 0.6,
                        ease: 'back.out(1.7)',
                    },
                    '-=0.2'
                );
        },
        {
            scope: containerRef,
        }
    );

    const handleStart = contextSafe(() => {
        if (isTransitioningRef.current) {
            return;
        }

        isTransitioningRef.current = true;

        const timeline = gsap.timeline({
            onComplete: onStart,
        });

        timeline
            .to(buttonRef.current, {
                scale: 0.94,
                duration: 0.12,
                ease: 'power2.in',
            })
            .to(buttonRef.current, {
                scale: 1,
                duration: 0.2,
                ease: 'back.out(2)',
            })
            .to(
                [titleRef.current, maryRef.current, buttonRef.current],
                {
                    opacity: 0,
                    y: -35,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: 'power2.inOut',
                }
            )
            .to(
                containerRef.current,
                {
                    opacity: 0,
                    duration: 0.35,
                    ease: 'power2.inOut',
                },
                '-=0.15'
            );
    });

    return (
        <main className="splash" ref={containerRef}>
            <img
                className="splash__background"
                src={background}
                alt=""
            />

            <div className="splash__title" ref={titleRef}>
                <img
                    src={title}
                    alt=""
                />

                <h1 className="splash__title_text">
                    메리의 잃어버린 단추
                </h1>
            </div>

            <img
                className="splash__mary"
                ref={maryRef}
                src={mary}
                alt="토키노 메리"
            />

            <button
                className="splash__start"
                ref={buttonRef}
                type="button"
                onClick={handleStart}
                aria-label="스탬프 투어 시작하기"
            >
                <img
                    src={startButton}
                    alt=""
                />

                <span className="splash__start_text">
                    START
                </span>
            </button>
        </main>
    );
}