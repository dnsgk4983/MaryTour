import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import background from '../assets/images/stamp_background.png';
import panel from '../assets/images/stamp_panel.png';
import stamp_collected from '../assets/images/stamp_collected.png';
import button from '../assets/images/ui_button_primary.png';

gsap.registerPlugin(useGSAP);

const stamp_numbers = [1, 2, 3];

export default function HomePage({
    collectedStamps = [],
    onCheckStamp = () => {},
}) {
    const container_ref = useRef(null);
    const header_ref = useRef(null);
    const panel_ref = useRef(null);
    const button_ref = useRef(null);

    const collected_count = stamp_numbers.filter(
        (number) => collectedStamps.includes(number)
    ).length;

    useGSAP(
        () => {
            const timeline = gsap.timeline({
                defaults: {
                    ease: 'power2.out',
                },
            });

            timeline
                .from(header_ref.current, {
                    opacity: 0,
                    y: -15,
                    duration: 0.6,
                })
                .from(
                    panel_ref.current,
                    {
                        opacity: 0,
                        y: 20,
                        duration: 0.7,
                    },
                    '-=0.3'
                )
                .from(
                    button_ref.current,
                    {
                        opacity: 0,
                        y: 15,
                        duration: 0.5,
                    },
                    '-=0.3'
                );
        },
        {
            scope: container_ref,
        }
    );

    return (
        <main className="home" ref={container_ref}>
            <img
                className="home__background"
                src={background}
                alt=""
            />

            <header className="home__header" ref={header_ref}>
                <p className="home__subtitle">
                    MARY'S BUTTON TOUR
                </p>

                <h1 className="home__title">
                    메리의 잃어버린 단추
                </h1>

                <p className="home__description">
                    잃어버린 단추 3개를 찾아주세요!
                </p>
            </header>

            <section
                className="home__panel"
                ref={panel_ref}
                aria-label={`단추 수집 현황 ${collected_count}개 중 3개`}
            >
                <img
                    className="home__panel_image"
                    src={panel}
                    alt=""
                />

                <div className="home__stamp_grid">
                    {stamp_numbers.map((number) => {
                        const is_collected = collectedStamps.includes(number);

                        return (
                            <div
                                className="home__stamp_item"
                                key={number}
                                aria-label={
                                    is_collected
                                        ? `${number}번 단추 수집 완료`
                                        : `${number}번 단추 미수집`
                                }
                            >
                                {is_collected && (
                                    <img
                                        src={stamp_collected}
                                        alt=""
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                <p className="home__progress">
                    {collected_count} / 3
                </p>
            </section>

            <button
                className="home__check_button"
                ref={button_ref}
                type="button"
                onClick={onCheckStamp}
            >
                <img
                    src={button}
                    alt=""
                />

                <span className="home__check_text">
                    QR 코드 인증하기
                </span>
            </button>
        </main>
    );
}