import { StyleProp } from "react-native";

/**
 * React Native version of `cn`
 * Combines styles safely (like clsx + twMerge on web)
 */
export function cn<T>(...styles: Array<StyleProp<T>>) {
  return styles;
}
