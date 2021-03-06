import { css } from "@emotion/react";
import React from "react";

const styles = {
  root: (bg?: string) => css`
    background: ${bg ?? "#fff"};
    width: 100%;
    max-width: 124.8rem;
    margin-left: auto;
    margin-right: auto;
    padding: 4.8rem;
    border-radius: 1.2rem;
  `,
};

type FloatWrapProps = {
  children: React.ReactNode;
  background?: string;
};

function FloatWrap({ children, background }: FloatWrapProps) {
  return <div css={styles.root(background)}>{children}</div>;
}

export default FloatWrap;
