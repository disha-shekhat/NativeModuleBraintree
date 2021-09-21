import { StyleSheet } from "react-native"
import { color, spacing } from "../../theme"

export const styles = StyleSheet.create({
  textInput: {
    height: 56,
    borderRadius: 8,
    marginBottom: 24,
    backgroundColor: color.background,
    paddingHorizontal: 20,
    fontSize: 16,
    color: color.primary,
    marginHorizontal: 20,
  },
  FULL: {
    flex: 1,
    backgroundColor: color.transparent,
  },
  HEADER: {
    paddingBottom: spacing[5] - 1,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
  },
  HEADER_TITLE: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1.5,
    lineHeight: 15,
    textAlign: "center",
    color: color.primary,
  },
  BUTTON_TITLE: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    color: color.primary,
  },
  BUTTON_CONTAINER: {
    height: 56,
    borderRadius: 8,
    marginBottom: 24,
    backgroundColor: color.dim,
    paddingHorizontal: 20,
    fontSize: 16,
    marginHorizontal: 20,
  },
})
