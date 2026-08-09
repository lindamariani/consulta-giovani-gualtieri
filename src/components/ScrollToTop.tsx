import {
  useEffect,
  useLayoutEffect,
} from "react";

import {
  useLocation,
} from "react-router-dom";

function ScrollToTop() {
  const {
    pathname,
    hash,
  } = useLocation();

  useEffect(() => {
    const previous =
      window.history.scrollRestoration;

    window.history.scrollRestoration =
      "manual";

    return () => {
      window.history.scrollRestoration =
        previous;
    };
  }, []);

  useLayoutEffect(() => {
    if (!hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });

      return;
    }

    const frame =
      window.requestAnimationFrame(
        () => {
          const id =
            decodeURIComponent(
              hash.slice(1)
            );

          const target =
            document.getElementById(
              id
            );

          if (target) {
            target.scrollIntoView({
              block: "start",
            });
          } else {
            window.scrollTo({
              top: 0,
              left: 0,
              behavior: "auto",
            });
          }
        }
      );

    return () => {
      window.cancelAnimationFrame(
        frame
      );
    };
  }, [
    pathname,
    hash,
  ]);

  return null;
}

export default ScrollToTop;
