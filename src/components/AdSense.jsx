import { useEffect } from "react";

/**
 * Google AdSense 광고 컴포넌트
 * @param {Object} props
 * @param {string} props.client - AdSense 클라이언트 ID (ca-pub-XXXXXXXXXX)
 * @param {string} props.slot - 광고 슬롯 ID
 * @param {string} props.format - 광고 형식 ('auto', 'rectangle', 'horizontal')
 * @param {boolean} props.responsive - 반응형 여부
 * @param {string} props.className - 추가 CSS 클래스
 */
export default function AdSense({
  client,
  slot,
  format = "auto",
  responsive = true,
  className = "",
}) {
  useEffect(() => {
    try {
      // AdSense 스크립트가 로드되었는지 확인
      if (window.adsbygoogle && window.adsbygoogle.loaded) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } else {
        // 스크립트가 아직 로드되지 않았으면 대기
        const checkAdsbygoogle = setInterval(() => {
          if (window.adsbygoogle && window.adsbygoogle.loaded) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            clearInterval(checkAdsbygoogle);
          }
        }, 100);

        // 5초 후 타임아웃
        setTimeout(() => clearInterval(checkAdsbygoogle), 5000);
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, [client, slot]);

  // 클라이언트 ID나 슬롯이 없으면 렌더링하지 않음
  if (!client || !slot) {
    return null;
  }

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

