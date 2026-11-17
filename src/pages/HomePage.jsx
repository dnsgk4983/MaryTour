
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import background from '../assets/images/stamp_background.png';
import panel from '../assets/images/stamp_panel.png';
import stamp_collected from '../assets/images/stamp_collected.png';
import button from '../assets/images/ui_button_primary.png';

gsap.registerPlugin(useGSAP);

const stamp_ids = [
    'bupyeong',
    'daerim',
    'guro',
];

const reward_storage_key = 'marytour_reward_claimed';

export default function HomePage({
    collectedStamps = [],
    onCheckStamp = () => {},
    onClaimReward = () => {},
}) {
    const container_ref = useRef(null);
    const header_ref = useRef(null);
    const panel_ref = useRef(null);
    const button_ref = useRef(null);

    const collected_count = stamp_ids.filter(
        (stamp_id) => collectedStamps.includes(stamp_id)
    ).length;

    const is_complete = collected_count === stamp_ids.length;

    const is_reward_claimed =
        localStorage.getItem(reward_storage_key) === 'true';

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

    function handle_button_click() {
        if (!is_complete) {
            onCheckStamp();
            return;
        }

        if (!is_reward_claimed) {
            onClaimReward();
        }
    }

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
                    {is_complete
                        ? '단추를 모두 모았어요!'
                        : '잃어버린 단추 3개를 찾아주세요!'}
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
                    {stamp_ids.map((stamp_id, index) => {
                        const is_collected = collectedStamps.includes(stamp_id);
                        const stamp_number = index + 1;

                        return (
                            <div
                                className="home__stamp_item"
                                key={stamp_id}
                                aria-label={
                                    is_collected
                                        ? `${stamp_number}번 단추 수집 완료`
                                        : `${stamp_number}번 단추 미수집`
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
                onClick={handle_button_click}
                disabled={is_complete && is_reward_claimed}
            >
                <img
                    src={button}
                    alt=""
                />

                <span className="home__check_text">
                    {is_reward_claimed && is_complete
                        ? '특전 수령 완료'
                        : is_complete
                            ? '특전 받기'
                            : 'QR 코드 인증하기'}
                </span>
            </button>
        </main>
    );
}
