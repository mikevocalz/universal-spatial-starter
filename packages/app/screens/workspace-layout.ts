/** Content geometry is independent of the native app window and inspector visibility. */
export function resolveWorkspaceLayout(width: number) {
  const available = Math.max(0, width);
  return {
    split: available >= 600,
    listWidth: available * 0.4,
    detailWidth: available * 0.6,
    inspectorWidth: available * 0.3,
  };
}
