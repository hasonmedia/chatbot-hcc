import { useState, useEffect } from "react";

export default function CountdownTimer({ endTime }) {
    const calculateTimeLeft = () => {
        const difference = new Date(endTime) - new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            timeLeft = null; // countdown hết
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    if (!timeLeft) return <span className="text-red-500">Hết hạn</span>;

    return (
        <span className="text-sm text-gray-600 shadow-sm">
            {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
        </span>
    );
}
