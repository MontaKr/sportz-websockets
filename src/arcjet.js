import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

// Centralize Security Logic
const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode = process.env.ARCJET_MODE === "DRY_RUN" ? "DRY_RUN" : "LIVE";

if (!arcjetKey) throw new Error("ARCJET_KEY environment variable is missing.");

export const httpArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ["CATEGOTY:SEARCH_ENGINE", "CATRGORY:PREVIEW"],
        }),
        slidingWindow({
          mode: arcjetMode,
          interval: "10s",
          max: 50,
        }),
      ],
    })
  : null;

export const wsArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ["CATEGOTY:SEARCH_ENGINE", "CATRGORY:PREVIEW"],
        }),
        slidingWindow({
          mode: arcjetMode,
          interval: "2s",
          max: 5,
        }),
      ],
    })
  : null;

export const securityMiddleware = () => {
  return async (req, res, next) => {
    //httpArcjet가 없으면 다음 미들웨어로 이동
    if (!httpArcjet) return next();

    try {
      //들어온 요청을 Arcjet에 전달하여 검사하고 결과를 반환
      const decision = await httpArcjet.protect(req);

      if (decision.isDenied()) {
        //속도 제한 오류 발생 시시
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({ error: "Too many request." });
        }

        // Shield 규칙 위반 시시
        return res.status(403).json({ error: "Forbidden." });
      }
    } catch (e) {
      console.error("Arcjet middleware error", e);
      return res.status(503).json({ error: "Service Unavailable" });
    }

    // 검사 통과
    next();
  };
};
