
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import background from '../assets/images/stamp_background.png';
import stamp_collected from '../assets/images/stamp_collected.png';

gsap.registerPlugin(useGSAP);

const reward_storage_key = 'marytour_reward_claimed';

export default function RewardPage({ onBack }) {
    const container_ref = useRef(null);

    const [is_claimed, set_is_claimed] = useState(
        () => localStorage.getItem(reward_storage_key) === 'true'
    );

    useGSAP(
        () => {
            gsap.from('.reward__card', {
                opacity: 0,
                y: 35,
                scale: 0.9,
                duration: 0.8,
                ease: 'back.out(1.5)',
            });

            gsap.from('.reward__stamp', {
                opacity: 0,
                scale: 0,
                rotation: -20,
                duration: 0.8,
                stagger: 0.15,
                ease: 'elastic.out(1, 0.5)',
            });
        },
        {
            scope: container_ref,
        }
    );

    function handle_claim() {
        const confirmed = window.confirm(
            '현장 직원이 확인했나요?\n확인하면 특전 수령 완료로 변경됩니다.'
        );

        if (!confirmed) {
            return;
        }

        localStorage.setItem(reward_storage_key, 'true');
        set_is_claimed(true);
    }

    return (
        <main className="reward" ref={container_ref}>
            <img
                className="reward__background"
                src={background}
                alt=""
            />

            <div className="reward__content">
                <span className="reward__eyebrow">
                    MARY'S BUTTON TOUR
                </span>

                <h1 className="reward__title">
                    {is_claimed
                        ? '특전 수령 완료!'
                        : '단추를 모두 찾았어요!'}
                </h1>

                <p className="reward__description">
                    {is_claimed
                        ? '메리의 특별한 선물을 수령했어요!'
                        : '현장 직원에게 이 화면을 보여주세요!'}
                </p>

                <section className="reward__card">
                    <span className="reward__card_label">
                        MARY TOUR COMPLETE
                    </span>

                    <div className="reward__stamps">
                        {[1, 2, 3].map((number) => (
                            <img
                                className="reward__stamp"
                                key={number}
                                src={stamp_collected}
                                alt={`${number}번째 단추`}
                            />
                        ))}
                    </div>

                    <p className="reward__progress">
                        3 / 3 COMPLETE
                    </p>

                    <p className="reward__status">
                        {is_claimed
                            ? '특전 수령이 완료되었습니다.'
                            : '특전 수령 가능'}
                    </p>
                </section>

                {!is_claimed && (
                    <button
                        className="reward__button"
                        type="button"
                        onClick={handle_claim}
                    >
                        직원 확인 · 특전 수령 완료
                    </button>
                )}

                <button
                    className="reward__back"
                    type="button"
                    onClick={onBack}
                >
                    단추 보관함으로 돌아가기
                </button>
            </div>
        </main>
    );
}
