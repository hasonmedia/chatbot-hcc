// Countdown.tsx
import React, { useEffect, useRef, useState } from "react";

type CountdownProps = {
  targetDate: string | Date; // bạn truyền chuỗi "2025-11-13 09:26:05.171"
  onComplete?: () => void;
};

function parseDateString(dateStr: string): Date {
  return new Date(dateStr.replace(" ", "T")); // chuyển sang ISO
}

const pad = (n: number) => n.toString().padStart(2, "0");

const Countdown: React.FC<CountdownProps> = ({ targetDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const target =
      typeof targetDate === "string" ? parseDateString(targetDate) : targetDate;

    const update = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(intervalRef.current!);
        onComplete?.();
      } else {
        setTimeLeft(diff);
      }
    };

    update(); // cập nhật lần đầu
    intervalRef.current = window.setInterval(update, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [targetDate, onComplete]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <span>
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
};

export default Countdown;
