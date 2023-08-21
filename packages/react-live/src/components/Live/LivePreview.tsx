import React, { useContext } from "react";
import LiveContext from "./LiveContext";

type Props<T extends React.ElementType = React.ElementType> = {
  Component?: T;
} & React.ComponentPropsWithoutRef<T>;

function LivePreview<T extends React.ElementType = "div">(
  props: Props<T>
): JSX.Element {
  const { Component = "div", ...rest } = props;
  const { element: Element } = useContext(LiveContext);
  return <Component {...rest}>{Element ? <Element /> : null}</Component>;
}
export default LivePreview;
