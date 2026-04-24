import React from "react";
import { Shield } from "lucide-react";
import { css, cx } from "styled-system/css";
import { flex } from "styled-system/patterns";

interface LoadingPageProps {
  message?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = "Initialisation du Système",
}) => {
  return (
    <div
      className={cx(
        flex({ align: "center", justify: "center" }),
        css({
          minH: "screen",
          bg: "#050810",
          position: "relative",
          overflow: "hidden",
        }),
      )}
    >
      {/* Background radial glow */}
      <div
        className={css({
          position: "absolute",
          inset: "0",
          bg: "radial-gradient(circle at center, rgba(34,211,238,0.05) 0%, transparent 70%)",
        })}
      />

      <div
        className={cx(
          flex({ direction: "column", align: "center" }),
          css({ position: "relative" }),
        )}
      >
        {/* Animated logo container */}
        <div className={css({ position: "relative" })}>
          {/* Pulsing ring layers */}
          <div
            className={css({
              position: "absolute",
              inset: "0",
              borderRadius: "full",
              bg: "cyan.500/20",
              animation: "ping",
            })}
          />
          <div
            className={css({
              position: "absolute",
              inset: "0",
              borderRadius: "full",
              bg: "cyan.400/10",
              animation: "pulse",
            })}
          />

          <div
            className={cx(
              flex({ align: "center", justify: "center" }),
              css({
                position: "relative",
                w: "24",
                h: "24",
                borderRadius: "3xl",
                bg: "cyan.500/10",
                border: "1px solid",
                borderColor: "cyan.500/20",
                shadow: "2xl",
                boxShadow: "0 0 40px rgba(0, 242, 255, 0.1)",
                animation: "zoomIn",
              }),
            )}
          >
            <Shield
              className={css({
                w: "12",
                h: "12",
                color: "cyan.400",
                animation: "pulse",
              })}
            />
          </div>
        </div>

        <div
          className={css({
            mt: "8",
            textAlign: "center",
            animation: "slideInFromBottom",
          })}
        >
          <h1
            className={css({
              textStyle: "2xl",
              fontWeight: "bold",
              color: "white",
              letterSpacing: "tighter",
              mb: "2",
              fontFamily: "orbitron",
            })}
          >
            AEGIS AI
          </h1>
          <div
            className={flex({ align: "center", gap: "2", justify: "center" })}
          >
            <div className={flex({ gap: "1" })}>
              <div
                className={css({
                  w: "1.5",
                  h: "1.5",
                  borderRadius: "full",
                  bg: "cyan.500",
                  animation: "bounce",
                  animationDelay: "-0.3s",
                })}
              />
              <div
                className={css({
                  w: "1.5",
                  h: "1.5",
                  borderRadius: "full",
                  bg: "cyan.500",
                  animation: "bounce",
                  animationDelay: "-0.15s",
                })}
              />
              <div
                className={css({
                  w: "1.5",
                  h: "1.5",
                  borderRadius: "full",
                  bg: "cyan.500",
                  animation: "bounce",
                })}
              />
            </div>
            <span
              className={css({
                color: "gray.500",
                fontSize: "xs",
                fontWeight: "black",
                textTransform: "uppercase",
                letterSpacing: "[0.2em]",
              })}
            >
              {message}
            </span>
          </div>
        </div>
      </div>

      {/* Version badge at footer */}
      <div
        className={css({
          position: "absolute",
          bottom: "10",
          left: "1/2",
          transform: "translateX(-50%)",
          fontSize: "[10px]",
          color: "gray.700",
          fontWeight: "bold",
          letterSpacing: "widest",
          textTransform: "uppercase",
        })}
      >
        V2.4 :: SECURE PROTOCOL ACTIVE
      </div>
    </div>
  );
};
