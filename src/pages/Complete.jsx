
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import background from '../assets/images/stamp_background.png';
import stamp_collected from '../assets/images/stamp_collected.png';

gsap.registerPlugin(useGSAP);

export default function CompletePage({ onBack }) {
    const container_ref = useRef(null);

    useGSAP(
        () => {
            const timeline = gsap.timeline();

            timeline
                .from('.complete__title', {
                    opacity: 0,
                    y: -35,
                    duration: 0.7,
                    ease: 'power2.out',
                })
                .from('.complete__stamp', {
                    opacity: 0,
                    scale: 0,
                    rotation: -25,
                    duration: 1,
                    stagger: 0.2,
                    ease: 'elastic.out(1, 0.5)',
                })
                .from('.complete__message', {
                    opacity: 0,
                    y: 20,
                    duration: 0.6,
                })
                .from('.complete__button', {
                    opacity: 0,
                    y: 20,
                    duration: 0.5,
                });

            gsap.to('.complete__sparkle', {
                opacity: 0.2,
                scale: 1.3,
                duration: 0.8,
                repeat: -1,
                yoyo: true,
                stagger: 0.15,
                ease: 'sine.inOut',
            });
        },
        {
            scope: container_ref,
        }
    );

    return (
        <main className="complete" ref={container_ref}>
            <img
                className="complete__background"
                src={background}
                alt=""
            />

            <div className="complete__content">
                <span className="complete__eyebrow">
                    MARY'S BUTTON TOUR
                </span>

                <h1 className="complete__title">
                    단추를 모두 찾았어요!
                </h1>

                <p className="complete__description">
                    메리의 잃어버린 단추 3개를 모두 모았어요!
                </p>

                <div className="complete__stamps">
                    {[1, 2, 3].map((number) => (
                        <img
                            key={number}
                            className="complete__stamp"
                            src={stamp_collected}
                            alt={`${number}번째 수집한 단추`}
                        />
                    ))}

                    <span className="complete__sparkle complete__sparkle_1">
                        ✦
                    </span>

                    <span className="complete__sparkle complete__sparkle_2">
                        ✧
                    </span>

                    <span className="complete__sparkle complete__sparkle_3">
                        ✦
                    </span>
                </div>

                <p className="complete__message">
                    메리의 소중한 단추를 찾아줘서 고마워요!
                </p>

                <p className="complete__progress">
                    3 / 3 COMPLETE!
                </p>

                <button
                    className="complete__button"
                    type="button"
                    onClick={onBack}
                >
                    단추 보관함 보기
                </button>
            </div>
        </main>
    );
}
